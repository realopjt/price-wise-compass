import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Crown, Zap } from 'lucide-react'

interface FreemiumModalProps {
  isOpen: boolean
  onClose: () => void
  currentUsage: number
  planType: 'free' | 'basic' | 'pro' | 'business'
}

export function FreemiumModal({ isOpen, onClose, currentUsage, planType }: FreemiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      limit: '5 comparisons/month',
      features: [
        'Basic bill analysis',
        'Simple recommendations',
        'Email support'
      ],
      buttonText: 'Current Plan',
      current: planType === 'free'
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$9',
      period: 'month',
      limit: '50 comparisons/month',
      features: [
        'Advanced bill analysis',
        'Smart recommendations',
        'Location finder',
        'Priority email support',
        'Browser extension access'
      ],
      buttonText: 'Upgrade to Basic',
      popular: false,
      current: planType === 'basic'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19',
      period: 'month',
      limit: '200 comparisons/month',
      features: [
        'Everything in Basic',
        'Real-time price monitoring',
        'Custom alerts',
        'API access',
        'Phone support',
        'Team collaboration (3 users)'
      ],
      buttonText: 'Upgrade to Pro',
      popular: true,
      current: planType === 'pro'
    },
    {
      id: 'business',
      name: 'Business',
      price: '$49',
      period: 'month',
      limit: 'Unlimited comparisons',
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee'
      ],
      buttonText: 'Upgrade to Business',
      current: planType === 'business'
    }
  ]

  const freeLimit = 5
  const isNearLimit = currentUsage >= freeLimit * 0.8
  const isOverLimit = currentUsage >= freeLimit

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isOverLimit ? (
              <>
                <AlertCircle className="w-5 h-5 text-destructive" />
                Upgrade Required
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 text-primary" />
                Choose Your Plan
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isOverLimit 
              ? `You've reached your free limit of ${freeLimit} comparisons this month. Upgrade to continue using PriceWise.`
              : isNearLimit 
                ? `You've used ${currentUsage} of ${freeLimit} free comparisons this month. Consider upgrading for more features.`
                : `You've used ${currentUsage} of ${freeLimit} free comparisons this month.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} ${plan.current ? 'border-success' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Zap className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-3 right-3">
                  <Badge className="bg-success text-success-foreground">
                    Current
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {plan.price}
                    {plan.id !== 'free' && <span className="text-lg font-normal text-muted-foreground">/{plan.period}</span>}
                  </div>
                  <CardDescription className="text-sm">{plan.limit}</CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : plan.current ? "outline" : "secondary"}
                  disabled={plan.current}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.current ? 'Current Plan' : plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="font-medium">Cancel anytime</span>
          </div>
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day free trial. Cancel anytime with no questions asked. 
            Your data stays with you even if you downgrade.
          </p>
        </div>

        {selectedPlan && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary">
              Ready to upgrade to {plans.find(p => p.id === selectedPlan)?.name}? 
              Payment processing will be available soon. For now, contact support to upgrade.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}