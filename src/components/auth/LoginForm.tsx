import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { SimplePasswordReset } from './SimplePasswordReset'
import { ArrowLeft } from 'lucide-react'

interface LoginFormProps {
  onSuccess: () => void
  onToggleMode: () => void
}

export function LoginForm({ onSuccess, onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Clear any existing session first
      await supabase.auth.signOut()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        // Force a page reload to ensure clean state
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to PriceWise.",
        })
        
        // Use setTimeout to ensure toast shows before redirect
        setTimeout(() => {
          window.location.href = '/'
        }, 500)
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      })

      if (error) throw error

      setResetEmailSent(true)
      toast({
        title: "Reset email sent!",
        description: "Check your email for a password reset link.",
      })
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (isResettingPassword) {
    return <SimplePasswordReset onBack={() => setIsResettingPassword(false)} />
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
        <CardTitle className="text-2xl font-bold">
          {isResettingPassword ? 'Reset Password' : 'Welcome Back'}
        </CardTitle>
        <CardDescription>
          {isResettingPassword 
            ? 'Enter your email to receive a password reset link' 
            : 'Sign in to your PriceWise account'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetEmailSent ? (
          <div className="text-center space-y-4">
            <div className="text-success">
              ✓ Password reset email sent!
            </div>
            <p className="text-sm text-muted-foreground">
              If an account with that email exists, we've sent you a password reset link.
            </p>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Due to email configuration issues, password reset emails may not arrive. 
                Please contact support at{' '}
                <a href="mailto:support@pricewise.com" className="text-primary hover:underline">
                  support@pricewise.com
                </a>
                {' '}if you need assistance accessing your account.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsResettingPassword(false)
                setResetEmailSent(false)
              }}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        ) : isResettingPassword ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setIsResettingPassword(false)}
              className="w-full"
            >
              Back to Login
            </Button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        )}

        {!resetEmailSent && !isResettingPassword && (
          <div className="mt-4 space-y-3 text-center">
            <button
              onClick={() => setIsResettingPassword(true)}
              className="text-sm text-primary hover:underline block w-full"
            >
              Forgot your password?
            </button>
            <div className="text-xs text-muted-foreground">
              Having trouble with password reset? Contact{' '}
              <a href="mailto:support@pricewise.com" className="text-primary hover:underline">
                support@pricewise.com
              </a>
            </div>
            <button
              onClick={onToggleMode}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              Don't have an account? Sign up
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}