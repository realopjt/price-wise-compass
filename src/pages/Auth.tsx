import { useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'

interface AuthProps {
  onAuthSuccess: () => void
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm 
            onSuccess={onAuthSuccess}
            onToggleMode={() => setIsLogin(false)}
          />
        ) : (
          <SignupForm 
            onSuccess={onAuthSuccess}
            onToggleMode={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  )
}