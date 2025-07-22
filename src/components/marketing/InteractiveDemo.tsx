import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Eye, 
  TrendingDown, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  AlertCircle,
  Star
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  duration: number;
  interactive?: boolean;
}

const demoSteps: DemoStep[] = [
  {
    id: 'upload',
    title: 'Upload Your Bill',
    description: 'Upload any business expense or personal bill for analysis',
    icon: Upload,
    duration: 2000,
    interactive: true
  },
  {
    id: 'analysis',
    title: 'AI Analysis in Progress',
    description: 'Our AI scans and categorizes your expense',
    icon: Eye,
    duration: 3000
  },
  {
    id: 'comparison',
    title: 'Finding Alternatives',
    description: 'Comparing with 10,000+ vendors in real-time',
    icon: TrendingDown,
    duration: 2500
  },
  {
    id: 'location',
    title: 'Location Intelligence',
    description: 'Finding better deals near you',
    icon: MapPin,
    duration: 2000
  },
  {
    id: 'results',
    title: 'Savings Discovered!',
    description: 'We found 3 better alternatives saving you $89/month',
    icon: DollarSign,
    duration: 4000,
    interactive: true
  }
];

const sampleBills = [
  { name: 'Verizon Business', amount: 299, type: 'Internet Service', savings: 89 },
  { name: 'Office Depot', amount: 156, type: 'Office Supplies', savings: 23 },
  { name: 'ConEd Energy', amount: 445, type: 'Electricity', savings: 67 }
];

export function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedBill, setSelectedBill] = useState(sampleBills[0]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const step = demoSteps[currentStep];
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next step
          if (currentStep < demoSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
            setProgress(0);
            if (currentStep === demoSteps.length - 2) {
              setShowResults(true);
            }
          } else {
            // Demo complete
            setIsPlaying(false);
            setProgress(100);
          }
          return 0;
        }
        return prev + (100 / (step.duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStep, isPlaying]);

  const startDemo = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(true);
    setShowResults(false);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
    setShowResults(false);
  };

  const currentStepData = demoSteps[currentStep];
  const IconComponent = currentStepData?.icon || Upload;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Demo Header */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">Interactive AI Demo</h3>
        <p className="text-muted-foreground">
          Experience how PriceWise analyzes your expenses and finds savings
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Demo Interface */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconComponent className="w-5 h-5 text-primary" />
              {currentStepData?.title || 'Ready to Start'}
            </CardTitle>
            <CardDescription>
              {currentStepData?.description || 'Click "Start Demo" to begin the AI analysis'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step Indicators */}
            <div className="flex justify-between items-center">
              {demoSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                    index === currentStep
                      ? 'border-primary bg-primary text-primary-foreground'
                      : index < currentStep
                      ? 'border-success bg-success text-success-foreground'
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            {isPlaying && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Bill Selection (Step 1) */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Choose a sample bill to analyze:</h4>
                <div className="grid gap-3">
                  {sampleBills.map((bill, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedBill(bill)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedBill === bill
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium">{bill.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {bill.type} - ${bill.amount}/month
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Analysis Display */}
            {currentStep > 0 && currentStep < 4 && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedBill.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedBill.type} - ${selectedBill.amount}/month
                      </div>
                    </div>
                  </div>
                  
                  {currentStep >= 2 && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                      <span className="text-warning">Analyzing 10,247 alternatives...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results Display */}
            {showResults && currentStep === 4 && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-success/10 border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="font-medium text-success">Analysis Complete!</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Found 3 better alternatives for {selectedBill.name}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="p-3 bg-background rounded border">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">AT&T Business Fiber</div>
                          <div className="text-sm text-muted-foreground">Same speed, better price</div>
                        </div>
                        <Badge className="bg-success/10 text-success">Save $89/mo</Badge>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-background rounded border">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Spectrum Business</div>
                          <div className="text-sm text-muted-foreground">Higher speed available</div>
                        </div>
                        <Badge className="bg-success/10 text-success">Save $45/mo</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Monthly Savings</span>
                      <span className="text-xl font-bold text-primary">${selectedBill.savings}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${selectedBill.savings * 12}/year potential savings
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3">
              {!isPlaying && currentStep === 0 && (
                <Button onClick={startDemo} className="flex-1">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Start Interactive Demo
                </Button>
              )}
              
              {!isPlaying && currentStep > 0 && (
                <Button onClick={resetDemo} variant="outline" className="flex-1">
                  Try Another Bill
                </Button>
              )}
              
              {showResults && (
                <Button variant="hero" className="flex-1">
                  Get Started Free
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feature Highlights */}
        <Card className="modern-card">
          <CardHeader>
            <CardTitle>What Makes PriceWise Different?</CardTitle>
            <CardDescription>
              Advanced AI technology that saves you time and money
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg mt-1">
                  <Eye className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Smart Bill Recognition</h4>
                  <p className="text-sm text-muted-foreground">
                    AI automatically identifies service types, billing periods, and contract terms
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-success/10 rounded-lg mt-1">
                  <TrendingDown className="w-4 h-4 text-success" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Real-Time Market Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Compare against 10,000+ vendors with live pricing and availability
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-warning/10 rounded-lg mt-1">
                  <MapPin className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Location Intelligence</h4>
                  <p className="text-sm text-muted-foreground">
                    Find better deals based on your specific location and needs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent/10 rounded-lg mt-1">
                  <Star className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Quality Assurance</h4>
                  <p className="text-sm text-muted-foreground">
                    All recommendations include ratings, reviews, and reliability scores
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                <span className="font-medium">Average Results</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">32%</div>
                  <div className="text-xs text-muted-foreground">Avg. Savings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">94%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}