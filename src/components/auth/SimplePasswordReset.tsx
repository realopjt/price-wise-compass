
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { DollarSign, Mail, Lock, ArrowLeft } from 'lucide-react'

interface SimplePasswordResetProps {
  onBack: () => void
}

export function SimplePasswordReset({ onBack }: SimplePasswordResetProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      console.log('Starting password reset process for:', email)
      
      // Generate reset link using Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      })

      if (error) {
        console.error('Supabase reset error:', error)
        throw error
      }

      // Send custom email via our edge function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-password-reset', {
          body: {
            email,
            resetLink: `${window.location.origin}/auth?mode=reset&email=${encodeURIComponent(email)}`
          }
        })

        if (emailError) {
          console.error('Email sending error:', emailError)
          // Don't throw here - Supabase's built-in email might still work
        } else {
          console.log('Custom password reset email sent successfully')
        }
      } catch (emailError) {
        console.error('Failed to send custom email:', emailError)
        // Continue anyway - user will get Supabase's default email
      }

      setEmailSent(true)
      toast({
        title: "Password reset email sent!",
        description: "Check your email for instructions to reset your password.",
      })
      
    } catch (error: any) {
      console.error('Password reset failed:', error)
      
      let errorMessage = "Failed to send password reset email."
      
      if (error.message?.includes('rate limit')) {
        errorMessage = "Too many requests. Please try again later."
      } else if (error.message?.includes('invalid')) {
        errorMessage = "Please enter a valid email address."
      } else if (error.message?.includes('not found')) {
        errorMessage = "No account found with this email address."
      }
      
      toast({
        title: "Reset failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-gradient-primary rounded-xl shadow-glow">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">PriceWise</h1>
            </div>
          </div>
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We've sent password reset instructions to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg text-sm">
            <p className="font-medium mb-2">What to do next:</p>
            <ol className="space-y-1 text-muted-foreground">
              <li>1. Check your email inbox (and spam folder)</li>
              <li>2. Click the reset link in the email</li>
              <li>3. Enter your new password</li>
              <li>4. Sign in with your new password</li>
            </ol>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
            <Button 
              onClick={() => {
                setEmailSent(false)
                setEmail('')
              }}
              variant="default"
              className="flex-1"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-gradient-primary rounded-xl shadow-glow">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PriceWise</h1>
          </div>
        </div>
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email Address</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              className="text-center"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          
          <Button 
            type="button"
            variant="outline" 
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
