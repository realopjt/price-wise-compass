
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, TrendingDown, AlertCircle, CheckCircle, BarChart3, DollarSign, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PayPalTransaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  potential_savings?: number;
  alternative_found?: boolean;
}

const PayPalIntegration = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [transactions, setTransactions] = useState<PayPalTransaction[]>([]);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const { toast } = useToast();

  const connectPayPal = async () => {
    setLoading(true);
    try {
      console.log('Initiating PayPal OAuth connection...');
      
      const { data, error } = await supabase.functions.invoke('paypal-integration', {
        body: { action: 'get_oauth_url' }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to get OAuth URL');
      }

      console.log('Opening PayPal OAuth popup...');
      
      // Open PayPal OAuth in popup
      const popup = window.open(
        data.oauth_url, 
        'paypal_oauth', 
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth completion
      const messageHandler = (event: MessageEvent) => {
        console.log('Received message from popup:', event.data);
        
        if (event.data.type === 'paypal_oauth_success') {
          setConnected(true);
          setTransactions(event.data.data.transactions || []);
          setTotalSavings(event.data.data.totalSavings || 0);
          
          toast({
            title: "PayPal Connected!",
            description: `Successfully imported ${event.data.data.transactions?.length || 0} transactions.`,
          });
          
          popup?.close();
          window.removeEventListener('message', messageHandler);
        } else if (event.data.type === 'paypal_oauth_error') {
          console.error('PayPal OAuth error:', event.data.error);
          toast({
            title: "Connection Failed",
            description: event.data.error || "Failed to connect to PayPal",
            variant: "destructive",
          });
          popup?.close();
          window.removeEventListener('message', messageHandler);
        }
      };

      window.addEventListener('message', messageHandler);

      // Check if popup was blocked
      if (!popup) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups for this site and try again.",
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      console.error('PayPal connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Unable to connect to PayPal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeSpending = async () => {
    setAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Simulate progress while calling analysis
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 200);

      // Call Supabase edge function for analysis
      const { data, error } = await supabase.functions.invoke('paypal-integration', {
        body: { 
          action: 'analyze',
          transactions: transactions
        }
      });

      clearInterval(progressInterval);

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysisProgress(100);
      setTotalSavings(data.totalSavings || 0);
      
      toast({
        title: "Analysis Complete",
        description: `Found $${data.totalSavings?.toFixed(2) || '0.00'} in potential monthly savings!`,
      });
    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Unable to analyze transactions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setTransactions([]);
    setTotalSavings(0);
    setAnalysisProgress(0);
    toast({
      title: "PayPal Disconnected",
      description: "Your PayPal account has been disconnected.",
    });
  };

  useEffect(() => {
    if (connected && transactions.length > 0) {
      // Auto-analyze when connected
      setTimeout(() => analyzeSpending(), 1000);
    }
  }, [connected, transactions]);

  if (!connected) {
    return (
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            PayPal Spending Analysis
          </CardTitle>
          <CardDescription>
            Connect your PayPal account to analyze your purchase history and discover real savings opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You'll be redirected to PayPal to securely authorize access to your transaction history. 
              We only read transaction data - we never store your PayPal login credentials.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h4 className="font-medium">What we'll analyze:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Purchase history and spending patterns</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Vendor comparison and alternatives</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Recurring payment optimization</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Bulk purchase opportunities</span>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Secure PayPal Authorization</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Click below to securely log into your PayPal account and authorize transaction analysis. 
              You'll be redirected to PayPal's secure login page.
            </p>
            <Button 
              onClick={connectPayPal} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Opening PayPal...' : 'Connect with PayPal'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p>🔒 Secured by PayPal OAuth 2.0</p>
            <p>We never store your PayPal login credentials</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="modern-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <CardTitle>PayPal Connected Successfully</CardTitle>
                <CardDescription>
                  Analyzing your real PayPal transaction data for savings opportunities.
                </CardDescription>
              </div>
            </div>
            <Badge variant="default" className="bg-success/10 text-success border-success/20">
              <Link2 className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {analyzing && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>AI Analysis Progress</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Analyzing {transactions.length} recent transactions...
              </p>
            </div>
          )}

          {!analyzing && totalSavings > 0 && (
            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-success">Analysis Complete!</h4>
                  <p className="text-sm text-muted-foreground">
                    Found savings opportunities in your recent purchases
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-success">${totalSavings.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Potential monthly savings</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={handleDisconnect} className="flex-1">
              Disconnect PayPal
            </Button>
            {!analyzing && totalSavings > 0 && (
              <Button onClick={analyzeSpending} className="flex-1">
                Re-analyze Transactions
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Analysis */}
      {transactions.length > 0 && !analyzing && (
        <Card className="modern-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Recent Transaction Analysis
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your PayPal purchase history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{transaction.merchant}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.category} • {transaction.date}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">${transaction.amount.toFixed(2)}</div>
                    {transaction.alternative_found ? (
                      <Badge className="bg-warning/10 text-warning border-warning/20">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        Save ${transaction.potential_savings?.toFixed(2)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        Optimal Price
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Savings Summary */}
      {totalSavings > 0 && (
        <Card className="modern-card">
          <CardHeader>
            <CardTitle>Spending Optimization Summary</CardTitle>
            <CardDescription>
              Based on your PayPal transaction history analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">{transactions.length}</div>
                <div className="text-sm text-muted-foreground">Transactions Analyzed</div>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-warning">
                  {transactions.filter(t => t.alternative_found).length}
                </div>
                <div className="text-sm text-muted-foreground">Savings Opportunities</div>
              </div>
              <div className="p-4 bg-success/10 rounded-lg text-center">
                <div className="text-2xl font-bold text-success">${totalSavings.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Monthly Savings Potential</div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button className="w-full" size="lg">
                View Detailed Recommendations
              </Button>
              <Button variant="outline" className="w-full">
                Set Up Savings Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PayPalIntegration;
