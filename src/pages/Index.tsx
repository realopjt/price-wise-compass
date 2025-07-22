import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Auth } from "./Auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { InteractiveDemo } from "@/components/marketing/InteractiveDemo";
import { DynamicInfographic } from "@/components/marketing/DynamicInfographic";
import { DemoReceiptScanner } from "@/components/marketing/DemoReceiptScanner";
import { SecurityFeatures } from "@/components/security/SecurityFeatures";
import { ClientReviews } from "@/components/marketing/ClientReviews";
import { FloatingCustomerSupport } from "@/components/support/FloatingCustomerSupport";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  TrendingUp, 
  DollarSign, 
  Upload, 
  MapPin, 
  CreditCard, 
  Bell,
  BarChart3,
  Target,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Crown
} from "lucide-react";
import heroImage from "@/assets/marketing-hero.jpg";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        console.log('Auth event:', event, !!session);
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
        
        // Store session in localStorage for persistence
        if (session) {
          localStorage.setItem('supabase_session', JSON.stringify(session));
        } else {
          localStorage.removeItem('supabase_session');
        }
      }
    });

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        // First try to get session from localStorage
        const storedSession = localStorage.getItem('supabase_session');
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            if (parsedSession.expires_at > Date.now() / 1000) {
              setSession(parsedSession);
              setUser(parsedSession.user);
              setLoading(false);
              return;
            }
          } catch (e) {
            localStorage.removeItem('supabase_session');
          }
        }
        
        // Then check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (mounted) {
          console.log('Initial session check:', !!session, error);
          setSession(session);
          setUser(session?.user || null);
          setLoading(false);
          
          if (session) {
            localStorage.setItem('supabase_session', JSON.stringify(session));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = () => {
    toast({
      title: "Welcome to PriceWise!",
      description: "Start uploading your bills to find savings opportunities.",
    });
  };

  const handleSignOut = async () => {
    try {
      // Clear localStorage first
      localStorage.removeItem('supabase_session');
      
      // Then sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      setSession(null);
      setUser(null);
      
      toast({
        title: "Signed out successfully",
        description: "Thanks for using PriceWise!",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      // Force logout even if Supabase fails
      setSession(null);
      setUser(null);
      localStorage.removeItem('supabase_session');
      
      toast({
        title: "Signed out",
        description: "Session cleared locally.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p>Loading PriceWise...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard user={user} onSignOut={handleSignOut} />;
  }

  // If user is not logged in, show landing page, demo, or auth
  if (activeTab === "auth") {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (showDemo) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl font-bold">PriceWise Demo</h1>
            <p className="text-muted-foreground">Experience how PriceWise helps you save money</p>
            <Button variant="outline" onClick={() => setShowDemo(false)}>
              Back to Homepage
            </Button>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Sample Bill Analysis</CardTitle>
                <CardDescription>See how we analyze your business expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="font-semibold">Verizon Business</div>
                  <div className="text-sm text-muted-foreground">Internet Service - $299/month</div>
                  <div className="mt-2 p-2 bg-destructive/10 rounded text-sm">
                    ⚠️ Found 3 cheaper alternatives saving up to $89/month
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="font-semibold">Office Depot</div>
                  <div className="text-sm text-muted-foreground">Office Supplies - $156/month</div>
                  <div className="mt-2 p-2 bg-success/10 rounded text-sm">
                    ✅ Competitive pricing - No better options found
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Smart Recommendations</CardTitle>
                <CardDescription>AI-powered suggestions for your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium">Switch to AT&T Business Fiber</div>
                  <div className="text-sm text-muted-foreground">Save $89/month • Same speed</div>
                  <Badge className="mt-1 bg-success/10 text-success">Recommended</Badge>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium">Bulk order supplies from Amazon Business</div>
                  <div className="text-sm text-muted-foreground">Save 15% on office supplies</div>
                  <Badge className="mt-1 bg-primary/10 text-primary">Consider</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">Ready to start saving on your business expenses?</p>
            <Button variant="hero" size="lg" onClick={() => setActiveTab("auth")}>
              Get Started Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">PriceWise</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`text-sm font-medium transition-colors ${activeTab === "overview" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("expenses")}
              className={`text-sm font-medium transition-colors ${activeTab === "expenses" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Expenses
            </button>
            <button 
              onClick={() => setActiveTab("recommendations")}
              className={`text-sm font-medium transition-colors ${activeTab === "recommendations" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Smart Recommendations
            </button>
            <button 
              onClick={() => setActiveTab("locations")}
              className={`text-sm font-medium transition-colors ${activeTab === "locations" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              Location Finder
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={() => setActiveTab("auth")}>Sign In</Button>
            <Button variant="hero" size="sm" onClick={() => setActiveTab("auth")}>Get Started</Button>
          </div>
        </div>
      </nav>

      {activeTab === "overview" && (
        <>
          {/* Hero Section */}
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-success/5" />
            <div className="container mx-auto px-4 relative">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Badge className="bg-primary-muted text-primary border-primary/20">
                      Corporate Expense Intelligence
                    </Badge>
                    <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                      Stop Overpaying for{" "}
                      <span className="bg-gradient-hero bg-clip-text text-transparent">
                        Business Services
                      </span>
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      PriceWise automatically analyzes your corporate expenses and finds better deals. 
                      Upload bills, get instant alternatives, and make smarter purchasing decisions with real-time intelligence.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="hero" size="lg" className="text-lg px-8" onClick={() => setActiveTab("auth")}>
                      <Upload className="w-5 h-5" />
                      Upload First Bill
                    </Button>
                  </div>
                  <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>Bank-grade security</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>Real-time analysis</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src={heroImage} 
                    alt="Financial Dashboard" 
                    className="rounded-xl shadow-large w-full"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Marketing Video Section */}
          <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="container mx-auto px-4">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                  <a 
                    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="story-link hover:text-primary transition-colors"
                  >
                    See PriceWise in Action
                  </a>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Watch our interactive demo to see how AI-powered savings work for your business.
                </p>
              </div>
              <InteractiveDemo />
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                  Intelligent Cost Optimization
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Advanced algorithms analyze your spending patterns and market data to ensure you never overpay again.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary-muted rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Bill Analysis</CardTitle>
                    <CardDescription>
                      AI-powered bill scanning identifies service types and finds cheaper alternatives instantly.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-success-muted rounded-lg flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-success" />
                    </div>
                    <CardTitle>Smart Recommendations</CardTitle>
                    <CardDescription>
                      Get personalized suggestions for restaurants, gyms, and services based on price, quality, and location.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-warning-muted rounded-lg flex items-center justify-center mb-4">
                      <CreditCard className="w-6 h-6 text-warning" />
                    </div>
                    <CardTitle>Banking Integration</CardTitle>
                    <CardDescription>
                      Secure connection to your accounts provides real-time spending insights and automatic notifications.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary-muted rounded-lg flex items-center justify-center mb-4">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Real-time Reviews</CardTitle>
                    <CardDescription>
                      Access the latest reviews and ratings to make informed decisions about restaurants and services.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-success-muted rounded-lg flex items-center justify-center mb-4">
                      <MapPin className="w-6 h-6 text-success" />
                    </div>
                    <CardTitle>Location Intelligence</CardTitle>
                    <CardDescription>
                      Find and book the best nearby options based on distance, price, and real-time availability.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-warning-muted rounded-lg flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-warning" />
                    </div>
                    <CardTitle>Enterprise Security</CardTitle>
                    <CardDescription>
                      Bank-grade encryption and compliance ensures your financial data remains completely secure.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>

          {/* Updated Pricing Section */}
          <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="container mx-auto px-4">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Choose the plan that fits your business needs. Start free and upgrade as you grow.
                </p>
                
                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mt-8">
                  <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Monthly
                  </span>
                  <Switch
                    checked={isYearly}
                    onCheckedChange={setIsYearly}
                  />
                  <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Yearly
                  </span>
                  <Badge className="bg-success/10 text-success text-xs">
                    Save 20%
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Free Plan */}
                <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-xl">Free</CardTitle>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">$0</div>
                      <CardDescription className="text-sm">
                        Perfect for getting started
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>5 bill uploads per month</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Basic price comparison</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Email support</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Basic reporting</span>
                      </li>
                    </ul>
                    <Button className="w-full" variant="outline" onClick={() => setActiveTab("auth")}>
                      Get Started Free
                    </Button>
                  </CardContent>
                </Card>

                {/* Pro Plan */}
                <Card className="relative bg-gradient-card border-primary shadow-lg scale-105 transition-all duration-300">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Crown className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-xl">Pro</CardTitle>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">
                        ${isYearly ? '15' : '19'}
                        <span className="text-lg font-normal text-muted-foreground">/month</span>
                      </div>
                      {isYearly && (
                        <div className="text-sm text-success">
                          Save $48/year
                        </div>
                      )}
                      <CardDescription className="text-sm">
                        Advanced AI analysis & automation
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Unlimited bill uploads</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Advanced AI analysis</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Smart recommendations</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Priority support</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Advanced reporting & analytics</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Browser extension access</span>
                      </li>
                    </ul>
                    <Button className="w-full" onClick={() => setActiveTab("auth")}>
                      Start Pro Plan
                    </Button>
                  </CardContent>
                </Card>

                {/* Enterprise Plan */}
                <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300">
                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-xl">Enterprise</CardTitle>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">
                        ${isYearly ? '79' : '99'}
                        <span className="text-lg font-normal text-muted-foreground">/month</span>
                      </div>
                      {isYearly && (
                        <div className="text-sm text-success">
                          Save $240/year
                        </div>
                      )}
                      <CardDescription className="text-sm">
                        For large teams & organizations
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Everything in Pro</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Multi-user access</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Team collaboration tools</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>API access</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Custom integrations</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Dedicated account manager</span>
                      </li>
                    </ul>
                    <Button className="w-full" variant="outline" onClick={() => setActiveTab("auth")}>
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-12 text-center space-y-3">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-full">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>All plans include 7-day free trial • Cancel anytime</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span>💳 PayPal • Credit/Debit Cards accepted</span>
                </div>
              </div>
            </div>
          </section>

          <SecurityFeatures />
          
        </>
      )}

      {activeTab === "expenses" && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-foreground">Expense Management</h2>
                <p className="text-muted-foreground">Upload and analyze your business expenses</p>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>Upload Bill</span>
                    </CardTitle>
                    <CardDescription>
                      Drag and drop or click to upload your bill for analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">PDF, PNG, JPG up to 10MB</p>
                    </div>
                    <Button variant="default" className="w-full" onClick={() => setActiveTab("auth")}>
                      Analyze Bill
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle>Recent Analysis</CardTitle>
                    <CardDescription>Your latest expense comparisons</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">Office Supplies</div>
                          <div className="text-sm text-muted-foreground">Staples Inc.</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">$847</div>
                          <Badge variant="destructive" className="text-xs">15% savings available</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">Cloud Storage</div>
                          <div className="text-sm text-muted-foreground">AWS</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">$1,240</div>
                          <Badge className="bg-success-muted text-success text-xs">Optimal price</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Receipt Scanner Demo Section */}
              <div className="mt-12">
                <div className="text-center space-y-4 mb-8">
                  <h3 className="text-2xl font-bold text-foreground">Try Our Receipt Scanner</h3>
                  <p className="text-muted-foreground">
                    Experience how our AI analyzes individual items and finds better prices
                  </p>
                </div>
                <div className="max-w-4xl mx-auto">
                  <DemoReceiptScanner />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "recommendations" && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-foreground">Smart Recommendations</h2>
                <p className="text-muted-foreground">AI-powered suggestions for better spending decisions</p>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5 text-warning" />
                      <span>Active Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-warning-muted rounded-lg">
                      <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">Internet Service</div>
                        <div className="text-xs text-muted-foreground">Better plan available - Save $180/month</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-success-muted rounded-lg">
                      <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">Office Lease</div>
                        <div className="text-xs text-muted-foreground">Competitive rate confirmed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle>Spending Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Office Supplies</span>
                        <span>$12,450/month</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Software Licenses</span>
                        <span>$8,200/month</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-success h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle>Savings Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center p-4 bg-success-muted rounded-lg">
                      <div className="text-2xl font-bold text-success">$4,890</div>
                      <div className="text-sm text-muted-foreground">Potential monthly savings</div>
                    </div>
                    <Button variant="success" className="w-full" onClick={() => setActiveTab("auth")}>
                      View All Opportunities
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "locations" && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-foreground">Smart Location Finder</h2>
                <p className="text-muted-foreground">Find the best restaurants, gyms, and services near you</p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <Card className="bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Find Better Options</span>
                    </CardTitle>
                    <CardDescription>
                      Enter what you're looking for and we'll find the best value options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Input placeholder="What are you looking for? (e.g., Italian restaurant, gym, coffee shop)" />
                      <Input placeholder="Your location or address" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm">
                        <DollarSign className="w-4 h-4" />
                        Best Price
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="w-4 h-4" />
                        Top Rated
                      </Button>
                      <Button variant="outline" size="sm">
                        <MapPin className="w-4 h-4" />
                        Nearest
                      </Button>
                    </div>
                    <Button variant="hero" className="w-full" onClick={() => setActiveTab("auth")}>
                      Find Recommendations
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                <Card className="bg-gradient-card">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Mario's Italian</h3>
                          <p className="text-sm text-muted-foreground">0.3 miles away</p>
                        </div>
                        <Badge className="bg-success-muted text-success">Best Value</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex text-yellow-400">
                          ★★★★★
                        </div>
                        <span className="text-sm text-muted-foreground">4.8 (342 reviews)</span>
                      </div>
                      <div className="text-sm">
                        <div>Price: $$</div>
                        <div>Wait time: 15 min</div>
                      </div>
                      <Button variant="outline" className="w-full">Book Table</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">FitLife Gym</h3>
                          <p className="text-sm text-muted-foreground">0.5 miles away</p>
                        </div>
                        <Badge className="bg-primary-muted text-primary">Top Rated</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex text-yellow-400">
                          ★★★★★
                        </div>
                        <span className="text-sm text-muted-foreground">4.9 (156 reviews)</span>
                      </div>
                      <div className="text-sm">
                        <div>Monthly: $39</div>
                        <div>Open until: 11 PM</div>
                      </div>
                      <Button variant="outline" className="w-full">View Details</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Bean & Brew</h3>
                          <p className="text-sm text-muted-foreground">0.1 miles away</p>
                        </div>
                        <Badge className="bg-warning-muted text-warning">Nearest</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex text-yellow-400">
                          ★★★★☆
                        </div>
                        <span className="text-sm text-muted-foreground">4.2 (89 reviews)</span>
                      </div>
                      <div className="text-sm">
                        <div>Coffee: $3.50</div>
                        <div>Wait time: 5 min</div>
                      </div>
                      <Button variant="outline" className="w-full">Order Ahead</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-success/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Ready to Start Saving?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of people and businesses already saving money with PriceWise
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-lg px-8" onClick={() => setActiveTab("auth")}>
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ClientReviews />

      {/* Disclaimer */}
      <section className="py-8 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Collapsible open={legalOpen} onOpenChange={setLegalOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <span className="text-lg font-semibold">Legal Disclaimer</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${legalOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-6">
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Service Disclaimer</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        PriceWise provides bill analysis and cost comparison services for informational purposes only. 
                        Savings estimates are based on available market data and may vary based on individual circumstances, 
                        location, and current market conditions. Actual savings may differ from projections.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Data Accuracy</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        While we strive to provide accurate and up-to-date information, PriceWise cannot guarantee 
                        the accuracy, completeness, or timeliness of all data and recommendations. Users should 
                        independently verify all information before making financial decisions.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Third-Party Services</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Recommendations for alternative service providers are based on publicly available information. 
                        PriceWise is not affiliated with recommended vendors unless explicitly stated. We may receive 
                        compensation from some service providers, which does not influence our analysis methodology.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Privacy & Security</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Your financial information is protected using industry-standard encryption through our secure Supabase infrastructure. 
                        We do not store sensitive payment information or account credentials. Data is processed securely and in compliance with 
                        applicable privacy regulations including GDPR and CCPA.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Limitation of Liability</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Our liability is limited to the subscription amount paid for PriceWise's services in the twelve months preceding any claim. 
                        We are not responsible for any indirect, incidental, or consequential damages arising from the use of our platform or 
                        reliance on our recommendations.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">Professional Advice</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Our service does not constitute professional financial, legal, or business advice. 
                        Consult with qualified professionals before making significant business or financial decisions. 
                        Terms of service and privacy policy apply to all users.
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="border-t pt-4 mt-6">
              <p className="text-xs text-muted-foreground">
                © 2024 PriceWise Technologies Inc. All rights reserved. | 
                <Link to="/terms" className="text-primary hover:underline ml-1">Terms of Service</Link> | 
                <Link to="/privacy" className="text-primary hover:underline ml-1">Privacy Policy</Link> | 
                <Link to="/contact" className="text-primary hover:underline ml-1">Contact Support</Link>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                * Demo data shown for illustration purposes. Actual results may vary. 
                Individual savings depend on current contracts and market availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Customer Support */}
      <FloatingCustomerSupport isAuthenticated={!!user} />
    </div>
  );
};

export default Index;
