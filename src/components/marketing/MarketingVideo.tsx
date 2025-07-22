import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import marketingHero from '@/assets/marketing-hero.jpg'

export function MarketingVideo() {
  const [currentScene, setCurrentScene] = useState(0)

  const scenes = [
    {
      title: "Welcome to PriceWise",
      subtitle: "Your AI-Powered Savings Assistant",
      description: "Upload your bills and discover instant savings opportunities"
    },
    {
      title: "Smart Bill Analysis",
      subtitle: "AI Scans Your Expenses",
      description: "Our AI analyzes your bills and finds cheaper alternatives automatically"
    },
    {
      title: "Location Intelligence", 
      subtitle: "Find Better Deals Nearby",
      description: "Get personalized recommendations for restaurants, services, and more"
    },
    {
      title: "Browser Extension",
      subtitle: "Save While You Browse",
      description: "Our extension shows $ signs when we find cheaper alternatives online"
    },
    {
      title: "Start Saving Today",
      subtitle: "Join Thousands Saving Money",
      description: "Sign up now and start optimizing your expenses with AI"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene(prev => {
        if (prev >= scenes.length - 1) {
          return 0
        }
        return prev + 1
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-gradient-to-br from-blue-600 via-blue-500 to-green-500">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${marketingHero})` }}
          />
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/30 rounded-full animate-pulse" />
            <div className="absolute top-32 right-16 w-16 h-16 bg-green-400/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-20 left-20 w-12 h-12 bg-blue-300/50 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-32 right-32 text-6xl animate-bounce opacity-60">💰</div>
            <div className="absolute top-20 right-40 text-4xl animate-pulse opacity-50">💳</div>
            <div className="absolute bottom-40 left-40 text-3xl animate-bounce opacity-60" style={{ animationDelay: '1.5s' }}>📱</div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-8">
            <div className="mb-8 transform transition-all duration-700 ease-in-out">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                {scenes[currentScene].title}
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-blue-100">
                {scenes[currentScene].subtitle}
              </h2>
              <p className="text-lg md:text-xl text-blue-50 max-w-2xl">
                {scenes[currentScene].description}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex space-x-2 mb-6">
              {scenes.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentScene 
                      ? 'bg-yellow-400 scale-125' 
                      : 'bg-white/40'
                  }`}
                />
              ))}
            </div>

          </div>

          {/* Floating Elements Animation */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 text-2xl animate-ping">💸</div>
            <div className="absolute top-3/4 right-1/4 text-2xl animate-bounce">📊</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl animate-pulse">✨</div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Ready to start saving money with AI?
          </p>
          <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            Get Started Free
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}