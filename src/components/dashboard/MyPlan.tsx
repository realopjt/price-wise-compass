import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { CheckCircle, Crown, Zap, Star, ArrowRight } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface MyPlanProps {
  userId: string
}

export function MyPlan({ userId }: MyPlanProps) {
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [loading, setLoading] = useState(true)
  const [isYearly, setIsYearly] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_type')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error
      
      setCurrentPlan(data?.subscription_type || 'free')
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error loading plan information",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    {
      name: 'Free',
      id: 'free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect for getting started with basic expense tracking',
      features: [
        'Upload up to 5 bills per month',
        'Basic expense analysis',
        'Simple recommendations',
        'Email support'
      ],
      color: 'default',
      icon: <Star className="h-5 w-5" />
    },
    {
      name: 'Pro',
      id: 'pro',
      monthlyPrice: 19,
      yearlyPrice: 15, // 20% discount for yearly
      description: 'Advanced features for growing businesses',
      features: [
        'Unlimited bill uploads',
        'Advanced AI analysis',
        'Smart recommendations',
        'Priority support',
        'Custom integrations',
        'Detailed analytics',
        'Discord live support'
      ],
      color: 'primary',
      icon: <Zap className="h-5 w-5" />,
      popular: true
    },
    {
      name: 'Enterprise',
      id: 'enterprise',
      monthlyPrice: 99,
      yearlyPrice: 79, // 20% discount for yearly
      description: 'Complete solution for large organizations',
      features: [
        'Everything in Pro',
        'Multi-user accounts',
        'Custom workflows',
        'API access',
        'Dedicated support',
        'Advanced security',
        'Custom reporting'
      ],
      color: 'secondary',
      icon: <Crown className="h-5 w-5" />
    }
  ]

  const getDisplayPrice = (plan: typeof plans[0]) => {
    if (plan.id === 'free') return '$0'
    const price = isYearly ? plan.yearlyPrice * 12 : plan.monthlyPrice
    return `$${price}`
  }

  const getDisplayPeriod = (plan: typeof plans[0]) => {
    if (plan.id === 'free') return 'forever'
    return isYearly ? 'per year (billed annually)' : 'per month'
  }

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan) {
      toast({
        title: "Already on this plan",
        description: "You're currently using this plan.",
      })
      return
    }

    if (planId === 'free') {
      // Handle downgrade to free
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_type: planId })
          .eq('user_id', userId)

        if (error) throw error

        setCurrentPlan(planId)
        
        toast({
          title: "Plan updated!",
          description: `Successfully downgraded to ${plans.find(p => p.id === planId)?.name} plan.`,
        })
      } catch (error: any) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive"
        })
      }
      return
    }

    // Handle PayPal payment for paid plans
    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    const amount = isYearly ? plan.yearlyPrice * 12 : plan.monthlyPrice
    const billingCycle = isYearly ? 'yearly' : 'monthly'

    try {
      // Call PayPal integration edge function
      const { data, error } = await supabase.functions.invoke('paypal-integration', {
        body: {
          action: 'create_subscription',
          planId,
          amount,
          billingCycle,
          userId
        }
      })

      if (error) throw error

      if (data?.approvalUrl) {
        // Open PayPal in a popup window
        const popup = window.open(data.approvalUrl, 'paypal_checkout', 'width=600,height=700');
        
        // Listen for payment completion
        const messageHandler = (event: MessageEvent) => {
          console.log('Received message from PayPal popup:', event.data)
          
          if (event.data?.type === 'paypal_payment_success') {
            console.log('Payment successful, updating subscription...')
            // Update user subscription in database
            supabase
              .from('profiles')
              .update({ subscription_type: planId })
              .eq('user_id', userId)
              .then(({ error: updateError }) => {
                if (!updateError) {
                  console.log('Subscription updated successfully')
                  setCurrentPlan(planId);
                  toast({
                    title: "Payment successful!",
                    description: `Successfully upgraded to ${plan.name} plan.`,
                  });
                } else {
                  console.error('Failed to update subscription:', updateError);
                  toast({
                    title: "Payment completed but subscription update failed",
                    description: "Please contact support for assistance.",
                    variant: "destructive"
                  });
                }
              });
            
            popup?.close();
            window.removeEventListener('message', messageHandler);
          } else if (event.data?.type === 'paypal_payment_error') {
            console.error('PayPal payment error:', event.data.error)
            toast({
              title: "Payment failed",
              description: event.data.error || "An error occurred during payment processing.",
              variant: "destructive"
            });
            popup?.close();
            window.removeEventListener('message', messageHandler);
          } else if (event.data?.type === 'paypal_payment_cancelled') {
            console.log('PayPal payment cancelled')
            toast({
              title: "Payment cancelled",
              description: "You can try again anytime.",
            });
            popup?.close();
            window.removeEventListener('message', messageHandler);
          }
        };
        
        window.addEventListener('message', messageHandler);
        
        // Handle popup being closed manually
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            console.log('PayPal popup closed manually')
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
          }
        }, 1000);
      } else {
        throw new Error('No approval URL received from PayPal')
      }
    } catch (error: any) {
      console.error('PayPal payment setup failed:', error)
      toast({
        title: "Payment setup failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">Loading plan information...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your active subscription plan and usage details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold capitalize">{currentPlan}</h3>
                <Badge variant={currentPlan === 'free' ? 'secondary' : 'default'}>
                  Active
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {plans.find(p => p.id === currentPlan)?.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {getDisplayPrice(plans.find(p => p.id === currentPlan)!)}
              </div>
              <div className="text-sm text-muted-foreground">
                {getDisplayPeriod(plans.find(p => p.id === currentPlan)!)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Choose Your Plan</h2>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${!isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span className={`text-sm ${isYearly ? 'font-semibold' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            <Badge variant="secondary" className="ml-2">Save 20%</Badge>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${
                currentPlan === plan.id ? 'bg-primary/5 border-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{getDisplayPrice(plan)}</div>
                  <div className="text-sm text-muted-foreground">{getDisplayPeriod(plan)}</div>
                  {isYearly && plan.id !== 'free' && (
                    <div className="text-xs text-success">
                      Save ${((plan.monthlyPrice * 12) - (plan.yearlyPrice * 12))}/year
                    </div>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    variant={currentPlan === plan.id ? 'outline' : plan.popular ? 'default' : 'outline'}
                    disabled={currentPlan === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {currentPlan === plan.id ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Current Plan
                      </>
                    ) : (
                      <>
                        {currentPlan === 'free' && plan.id !== 'free' ? 'Upgrade' : 'Switch'} to {plan.name}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  {plan.id !== 'free' && currentPlan !== plan.id && (
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        PayPal • Credit/Debit Cards accepted
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Secure payment via PayPal checkout
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Why Upgrade?</CardTitle>
          <CardDescription>
            Unlock advanced features to maximize your business savings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Advanced AI Analysis
              </h4>
              <p className="text-sm text-muted-foreground">
                Get deeper insights with our advanced AI that analyzes market trends and finds better deals across thousands of vendors.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                Priority Support
              </h4>
              <p className="text-sm text-muted-foreground">
                Get faster response times and dedicated support to help you maximize your savings potential.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}