import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, ExternalLink, Bot, User, X } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const supportResponses = {
  greeting: "Hi! I'm your PriceWise support assistant. How can I help you today?",
  
  what_is_app: "PriceWise is a smart financial management platform that helps you save money on your business expenses! Here's what we do:\n\n• 📄 **Bill Analysis**: Upload your bills (utilities, internet, insurance, etc.) and we analyze them to find potential savings\n• 🛒 **Browser Extension**: Automatically finds deals and discounts while you shop online\n• 📍 **Location Finder**: Discovers cheaper alternatives for services in your area\n• 💰 **PayPal Integration**: Connects to your PayPal to analyze spending patterns\n• 🤖 **AI Recommendations**: Get personalized suggestions to reduce your expenses\n\nWe've helped businesses save an average of $2,400 per year!",
  
  how_it_works: "Here's how PriceWise works:\n\n1. **Sign up** for free (no credit card required)\n2. **Upload your bills** - utilities, internet, phone, insurance, etc.\n3. **Get instant analysis** - our AI finds potential savings and better deals\n4. **Install our browser extension** - automatically find discounts while shopping\n5. **Review recommendations** - see personalized ways to reduce expenses\n6. **Take action** - switch to better providers or plans and start saving!\n\nThe whole process takes just a few minutes to set up.",
  
  features: "PriceWise offers these powerful features:\n\n💡 **Smart Bill Analysis**: AI-powered analysis of your business expenses\n🔍 **Price Comparison**: Find better deals on utilities, internet, insurance\n🛒 **Shopping Extension**: Automatic coupon finding and price alerts\n📊 **Expense Tracking**: Monitor your spending patterns and trends\n📍 **Local Deals**: Discover better service providers in your area\n🔗 **PayPal Integration**: Seamless expense import and analysis\n📱 **Mobile Friendly**: Access from any device, anywhere\n🔒 **Bank-Level Security**: Your data is encrypted and protected",
  
  pricing: "PriceWise offers flexible pricing:\n\n🆓 **Free Plan**: Upload up to 5 bills, basic analysis, browser extension\n💼 **Pro Plan**: Unlimited bills, advanced AI analysis, priority support, PayPal integration\n🏢 **Business Plan**: Team features, bulk analysis, custom integrations\n\nStart with our free plan - no credit card required! Most users save more in their first month than a year of our Pro plan costs.",
  
  billing: "For billing questions, please check your dashboard for payment history. If you need further assistance, I'll connect you with a live agent.",
  
  extension: "Our browser extension is amazing! Here's how to install it:\n\n**Chrome/Edge:**\n1. Download the extension from your dashboard\n2. Open Chrome → Settings → Extensions\n3. Enable 'Developer mode'\n4. Click 'Load unpacked' and select the downloaded folder\n\n**Firefox:**\n1. Download the Firefox version\n2. Open Firefox → Add-ons → Install from file\n\n**Safari:**\n1. Download the Safari version\n2. Open Safari → Extensions → Install\n\nThe extension automatically finds deals, applies coupons, and alerts you to better prices while you shop!",
  
  savings: "PriceWise helps you save money in multiple ways:\n\n💰 **Bill Optimization**: Find better rates on utilities, internet, phone plans\n🏪 **Shopping Deals**: Automatic coupon application and price comparison\n📍 **Local Alternatives**: Discover cheaper service providers nearby\n📊 **Spending Insights**: Identify areas where you're overspending\n🔄 **Contract Analysis**: Know when to switch providers for better deals\n\nOur users typically save 15-40% on their analyzed expenses. The average business saves $2,400+ per year!",
  
  account: "For account issues, try refreshing your browser or signing out and back in. If problems persist, our live agents can help.",
  
  getting_started: "Getting started is super easy!\n\n1. **Sign up free** - takes 30 seconds, no credit card needed\n2. **Upload your first bill** - any utility, internet, or service bill\n3. **Get instant analysis** - see potential savings immediately\n4. **Download our browser extension** - start finding deals while you shop\n5. **Explore recommendations** - discover ways to reduce expenses\n\nMost users find their first savings opportunity within 5 minutes! Want me to guide you through any specific step?",
  
  security: "Your security is our top priority! 🔒\n\n• **Bank-level encryption**: All data is encrypted in transit and at rest\n• **No sensitive data storage**: We don't store payment credentials or account passwords\n• **Supabase infrastructure**: Built on enterprise-grade secure cloud platform\n• **GDPR & CCPA compliant**: Full compliance with privacy regulations\n• **Regular security audits**: Continuous monitoring and updates\n\nWe only analyze the information you choose to share, and you can delete your data anytime.",
  
  live_agent: "I'll connect you with our live support team on Discord where real humans can assist you immediately.",
  
  default: "I'd be happy to help! Could you be more specific about what you need? I can explain:\n\n• What PriceWise is and how it works\n• How to get started and upload bills\n• Browser extension installation\n• Pricing and features\n• Account or technical issues\n\nOr I can connect you with our live support team on Discord!"
}

interface FloatingCustomerSupportProps {
  isAuthenticated?: boolean
}

export function FloatingCustomerSupport({ isAuthenticated = false }: FloatingCustomerSupportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: supportResponses.greeting,
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const getResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    
    // App explanation and overview
    if (message.includes('what is') || message.includes('what does') || message.includes('explain') || 
        message.includes('about') || message.includes('overview') || message.includes('pricewise')) {
      return supportResponses.what_is_app
    }
    
    // How it works
    if (message.includes('how') && (message.includes('work') || message.includes('use') || message.includes('process'))) {
      return supportResponses.how_it_works
    }
    
    // Features
    if (message.includes('feature') || message.includes('what can') || message.includes('capabilities') || 
        message.includes('functions')) {
      return supportResponses.features
    }
    
    // Pricing
    if (message.includes('price') || message.includes('cost') || message.includes('plan') || 
        message.includes('subscription') || message.includes('fee') || message.includes('free')) {
      return supportResponses.pricing
    }
    
    // Security
    if (message.includes('security') || message.includes('safe') || message.includes('privacy') || 
        message.includes('data') || message.includes('encrypt')) {
      return supportResponses.security
    }
    
    // Getting started
    if (message.includes('start') || message.includes('begin') || message.includes('first') || 
        message.includes('setup') || message.includes('new')) {
      return supportResponses.getting_started
    }
    
    // Billing
    if (message.includes('bill') || message.includes('payment') || message.includes('charge') || 
        message.includes('invoice')) {
      return supportResponses.billing
    }
    
    // Extension
    if (message.includes('extension') || message.includes('install') || message.includes('browser') || 
        message.includes('chrome') || message.includes('firefox') || message.includes('safari')) {
      return supportResponses.extension
    }
    
    // Savings
    if (message.includes('saving') || message.includes('money') || message.includes('deal') || 
        message.includes('discount') || message.includes('cheaper')) {
      return supportResponses.savings
    }
    
    // Account issues
    if (message.includes('account') || message.includes('login') || message.includes('password') || 
        message.includes('signin') || message.includes('access')) {
      return supportResponses.account
    }
    
    // Live agent request
    if (message.includes('human') || message.includes('agent') || message.includes('person') || 
        message.includes('live') || message.includes('talk') || message.includes('speak')) {
      return supportResponses.live_agent
    }
    
    return supportResponses.default
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const openDiscordSupport = async () => {
    // Check if user has a paid subscription
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_type')
        .eq('user_id', user.id)
        .single()

      if (profile?.subscription_type === 'free') {
        // Show upgrade message for free users
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "Discord live support is available for Pro and Enterprise users. Please upgrade your plan to access our live support team!",
          sender: 'bot',
          timestamp: new Date()
        }])
        return
      }

      window.open('https://discord.gg/pricewise-support', '_blank')
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6 mr-2" />
          Support
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px]">
      <Card className="modern-card h-full flex flex-col shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              Support Chat
            </CardTitle>
            <CardDescription>Get help from our AI assistant</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openDiscordSupport}
              className="shadow-soft"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="p-2 bg-muted rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-6 border-t bg-muted/30">
            <div className="flex gap-2">
              <Input
                placeholder="Type your question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon" className="shadow-soft">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Badge variant="secondary" className="text-xs">
                Need immediate help?
              </Badge>
              <Button 
                variant="link" 
                size="sm" 
                onClick={openDiscordSupport}
                className="text-xs h-auto p-0"
              >
                Join our Discord for live support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}