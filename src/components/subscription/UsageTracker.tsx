import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, AlertTriangle } from 'lucide-react'
import { FreemiumModal } from './FreemiumModal'
import { supabase } from '@/integrations/supabase/client'

interface UsageTrackerProps {
  userId: string
}

export function UsageTracker({ userId }: UsageTrackerProps) {
  const [usage, setUsage] = useState(0)
  const [planType, setPlanType] = useState<'free' | 'basic' | 'pro' | 'business'>('free')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const planLimits = {
    free: 5,
    basic: 50,
    pro: 200,
    business: Infinity
  }

  const currentLimit = planLimits[planType]
  const usagePercentage = planType === 'business' ? 0 : (usage / currentLimit) * 100
  const isNearLimit = usagePercentage >= 80
  const isOverLimit = usage >= currentLimit

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_type, usage_count')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      if (data) {
        setPlanType(data.subscription_type as 'free' | 'basic' | 'pro' | 'business')
        setUsage(data.usage_count || 0)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const incrementUsage = async () => {
    if (isOverLimit && planType === 'free') {
      setShowModal(true)
      return false
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ usage_count: usage + 1 })
        .eq('user_id', userId)

      if (error) throw error

      setUsage(prev => prev + 1)
      return true
    } catch (error) {
      console.error('Error updating usage:', error)
      return false
    }
  }

  if (loading) return null

  return (
    <>
      <Card className={`border ${isOverLimit ? 'border-destructive' : isNearLimit ? 'border-warning' : 'border-border'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {planType === 'free' ? 'Free Plan' : `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`}
            </CardTitle>
            <Badge variant={planType === 'free' ? 'secondary' : 'default'} className="text-xs">
              {planType === 'business' ? 'Unlimited' : `${usage}/${currentLimit}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {planType !== 'business' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Comparisons used this month</span>
                <span className={isOverLimit ? 'text-destructive' : isNearLimit ? 'text-warning' : 'text-muted-foreground'}>
                  {usage}/{currentLimit}
                </span>
              </div>
              <Progress 
                value={Math.min(usagePercentage, 100)} 
                className={`h-2 ${isOverLimit ? 'bg-destructive/20' : isNearLimit ? 'bg-warning/20' : ''}`}
              />
            </div>
          )}

          {isOverLimit && planType === 'free' && (
            <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-xs text-destructive">Limit reached</span>
            </div>
          )}

          {isNearLimit && !isOverLimit && (
            <div className="flex items-center gap-2 p-2 bg-warning/10 rounded-md">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-xs text-warning">Approaching limit</span>
            </div>
          )}

          {(planType === 'free' && (isNearLimit || isOverLimit)) && (
            <Button 
              size="sm" 
              className="w-full" 
              onClick={() => setShowModal(true)}
              variant={isOverLimit ? 'default' : 'outline'}
            >
              <Crown className="w-3 h-3 mr-1" />
              {isOverLimit ? 'Upgrade Required' : 'Upgrade Plan'}
            </Button>
          )}
        </CardContent>
      </Card>

      <FreemiumModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentUsage={usage}
        planType={planType}
      />
    </>
  )
}

// Export the incrementUsage function for use in other components
export { UsageTracker as default }