import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { TrendingDown, AlertTriangle, CheckCircle, X } from 'lucide-react'

interface RecommendationsListProps {
  userId: string
}

export function RecommendationsList({ userId }: RecommendationsListProps) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRecommendations()
  }, [userId])

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecommendations(data || [])
    } catch (error: any) {
      toast({
        title: "Error loading recommendations",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateRecommendationStatus = async (id: string, status: 'dismissed' | 'acted_upon') => {
    try {
      // Check if this is a sample recommendation (starts with 'sample-')
      if (id.startsWith('sample-')) {
        // For sample data, remove from sample recommendations state
        setSampleRecommendations(prev => prev.filter(rec => rec.id !== id))
        
        if (status === 'acted_upon') {
          // For "Act on This", redirect to purchase the recommended product/service
          const recommendation = sampleRecommendations.find(rec => rec.id === id)
          if (recommendation) {
            handlePurchaseRecommendation(recommendation)
          }
        }
        
        toast({
          title: status === 'acted_upon' ? "Redirecting to purchase..." : "Recommendation dismissed",
          description: status === 'acted_upon' 
            ? "Opening purchasing options for this recommendation."
            : "This recommendation has been removed from your list."
        })
        return
      }

      // For real recommendations, update in database
      const { error } = await supabase
        .from('recommendations')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      if (status === 'acted_upon') {
        const recommendation = recommendations.find(rec => rec.id === id)
        if (recommendation) {
          handlePurchaseRecommendation(recommendation)
        }
      }

      setRecommendations(prev => prev.filter(rec => rec.id !== id))
      
      toast({
        title: status === 'acted_upon' ? "Redirecting to purchase..." : "Recommendation dismissed",
        description: status === 'acted_upon' 
          ? "Opening purchasing options for this recommendation."
          : "This recommendation has been removed from your list."
      })
    } catch (error: any) {
      toast({
        title: "Error updating recommendation",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handlePurchaseRecommendation = (recommendation: any) => {
    let purchaseUrl = ''
    let actionDescription = ''
    
    // Generate specific purchase URLs based on recommendation content
    const title = recommendation.title.toLowerCase()
    const description = recommendation.description.toLowerCase()
    
    console.log('Processing recommendation:', { title, description, id: recommendation.id })
    
    if (title.includes('internet') || title.includes('provider')) {
      // For internet provider recommendations
      if (description.includes('xfinity')) {
        purchaseUrl = 'https://www.xfinity.com/learn/internet-service'
        actionDescription = 'Opening Xfinity business internet plans'
      } else if (description.includes('verizon')) {
        purchaseUrl = 'https://www.verizon.com/business/solutions/small-business/internet/'
        actionDescription = 'Opening Verizon business internet options'
      } else if (description.includes('at&t') || description.includes('att')) {
        purchaseUrl = 'https://www.att.com/business/internet/'
        actionDescription = 'Opening AT&T business internet plans'
      } else if (description.includes('spectrum')) {
        purchaseUrl = 'https://business.spectrum.com/internet'
        actionDescription = 'Opening Spectrum business internet services'
      } else {
        // Generic business internet comparison
        purchaseUrl = 'https://www.businessinternetcompare.com/'
        actionDescription = 'Opening business internet provider comparison'
      }
    } else if (title.includes('office') || title.includes('supply') || title.includes('supplies') || description.includes('supplies') || description.includes('office')) {
      // For office supplies - more specific matching
      console.log('Matched office supplies condition')
      if (description.includes('costco')) {
        purchaseUrl = 'https://www.costco.com/business-delivery'
        actionDescription = 'Opening Costco Business Delivery'
      } else if (description.includes('amazon')) {
        purchaseUrl = 'https://business.amazon.com/'
        actionDescription = 'Opening Amazon Business'
      } else if (description.includes('staples')) {
        purchaseUrl = 'https://www.staples.com/business'
        actionDescription = 'Opening Staples Business Solutions'
      } else {
        purchaseUrl = 'https://business.amazon.com/en/discover-more/office-supplies'
        actionDescription = 'Opening business office supplies marketplace'
      }
    } else if (title.includes('venue') || title.includes('restaurant') || title.includes('dinner') || (title.includes('meeting') && description.includes('dinner'))) {
      // For restaurant/venue recommendations - more specific matching to avoid conflicts
      console.log('Matched restaurant/venue condition')
      if (description.includes('opentable') || description.includes('dinner') || description.includes('restaurant')) {
        purchaseUrl = 'https://www.opentable.com/business'
        actionDescription = 'Opening OpenTable for business reservations'
      } else {
        purchaseUrl = 'https://www.yelp.com/biz/search?find_desc=business+restaurants'
        actionDescription = 'Opening business dining options on Yelp'
      }
    } else if (title.includes('software') || title.includes('subscription') || description.includes('software')) {
      // For software/subscription recommendations
      if (description.includes('microsoft')) {
        purchaseUrl = 'https://www.microsoft.com/en-us/microsoft-365/business'
        actionDescription = 'Opening Microsoft 365 business plans'
      } else if (description.includes('google') || description.includes('workspace')) {
        purchaseUrl = 'https://workspace.google.com/pricing.html'
        actionDescription = 'Opening Google Workspace pricing'
      } else {
        purchaseUrl = 'https://www.capterra.com/business-software/'
        actionDescription = 'Opening business software marketplace'
      }
    } else if (title.includes('phone') || title.includes('mobile') || description.includes('phone')) {
      // For phone/mobile service recommendations
      if (description.includes('verizon')) {
        purchaseUrl = 'https://www.verizon.com/business/small-business-essentials/mobile/'
        actionDescription = 'Opening Verizon business mobile plans'
      } else if (description.includes('at&t') || description.includes('att')) {
        purchaseUrl = 'https://www.att.com/business/wireless/'
        actionDescription = 'Opening AT&T business wireless plans'
      } else {
        purchaseUrl = 'https://www.businesswirelessplans.com/'
        actionDescription = 'Opening business wireless plan comparison'
      }
    } else if (title.includes('insurance') || description.includes('insurance')) {
      // For business insurance recommendations
      purchaseUrl = 'https://www.next-insurance.com/'
      actionDescription = 'Opening business insurance options'
    } else {
      // For any other recommendations, create a specific business-focused search
      console.log('Using fallback search for:', recommendation.title)
      const businessContext = 'business services'
      const searchTerm = encodeURIComponent(`${recommendation.title} ${businessContext} purchase`)
      purchaseUrl = `https://www.google.com/search?q=${searchTerm}`
      actionDescription = `Searching for business solutions: ${recommendation.title}`
    }
    
    console.log('Final URL:', purchaseUrl)
    
    // Open in new tab
    window.open(purchaseUrl, '_blank')
    
    toast({
      title: "Action taken",
      description: actionDescription,
    })
  }

  // Sample recommendations if none exist (use state to allow removal)
  const [sampleRecommendations, setSampleRecommendations] = useState([
    {
      id: 'sample-1',
      type: 'expense',
      title: 'Verizon Internet - Better Alternative Found',
      description: 'Better alternative found: Xfinity Business offers the same speed for $45/month less. Switch to save $540 annually.',
      potential_savings: 540,
      status: 'active',
      bill_company: 'Verizon',
      alternative_found: true
    },
    {
      id: 'sample-2',
      type: 'expense',
      title: 'Staples Office Supplies - Better Alternative Found',
      description: 'Better alternative found: Costco Business Delivery offers 30% savings on bulk office supplies.',
      potential_savings: 180,
      status: 'active',
      bill_company: 'Staples',
      alternative_found: true
    },
    {
      id: 'sample-3',
      type: 'expense',
      title: 'Office Depot Supplies - No Better Alternative Found',
      description: 'No better alternative found: Your current Office Depot pricing is competitive in the market.',
      potential_savings: 0,
      status: 'active',
      bill_company: 'Office Depot',
      alternative_found: false
    },
    {
      id: 'sample-4',
      type: 'location',
      title: 'Restaurant Meeting Venue - Better Alternative Found',
      description: 'Better alternative found: Rosemary\'s Kitchen offers better reviews (4.8/5) and is 15% cheaper than The Capital Grille.',
      potential_savings: 75,
      status: 'active',
      bill_company: 'The Capital Grille',
      alternative_found: true
    }
  ])

  const displayRecommendations = recommendations.length > 0 ? recommendations : sampleRecommendations

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">Loading recommendations...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-success" />
            Savings Section - Bill Alternatives
            {recommendations.length === 0 && (
              <Badge variant="outline" className="ml-2 text-xs">Demo Examples</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {recommendations.length === 0 
              ? "Sample bill analysis showing better alternatives found via Google Places API and price comparison" 
              : "Per-bill status showing whether better alternatives were found for each service"
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {displayRecommendations.length === 0 ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No active recommendations at the moment. Upload more bills to get personalized savings suggestions!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {recommendations.length === 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                These are example recommendations. Upload real bills to get personalized AI-powered suggestions!
              </AlertDescription>
            </Alert>
          )}
          {displayRecommendations.map((recommendation) => (
            <Card key={recommendation.id} className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{recommendation.title}</h3>
                      <Badge variant={recommendation.type === 'expense' ? 'default' : 'secondary'}>
                        {recommendation.type === 'expense' ? 'Expense' : 'Location'}
                      </Badge>
                      {recommendation.id.startsWith('sample-') && (
                        <Badge variant="outline" className="text-xs">Example</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {recommendation.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium text-success">
                        Potential savings: ${recommendation.potential_savings}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => updateRecommendationStatus(recommendation.id, 'acted_upon')}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Act on This
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateRecommendationStatus(recommendation.id, 'dismissed')}
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}