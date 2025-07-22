import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactSupport = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-foreground">PriceWise</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Contact Support</h1>
            <p className="text-xl text-muted-foreground">
              We're here to help you save money and optimize your business expenses
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Information */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Our support team is available to help you with any questions about PriceWise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-sm text-muted-foreground">support@pricewise.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Phone className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <div className="font-medium">Phone Support</div>
                    <div className="text-sm text-muted-foreground">1-800-PRICEWISE (774-2394)</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <div className="font-medium">Business Hours</div>
                    <div className="text-sm text-muted-foreground">
                      Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                      Saturday: 10:00 AM - 2:00 PM EST
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-medium">Mailing Address</div>
                    <div className="text-sm text-muted-foreground">
                      Suite 384, 10 Market Street<br />
                      Camana Bay, Grand Cayman<br />
                      Cayman Islands, KY1 9006
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Categories */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>Quick Help</CardTitle>
                <CardDescription>
                  Common support categories and average response times
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Technical Support</div>
                    <Badge variant="outline">2-4 hours</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    App issues, bill upload problems, account access
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Billing Questions</div>
                    <Badge variant="outline">1-2 hours</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Subscription, payments, refunds, plan changes
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Savings Analysis</div>
                    <Badge variant="outline">24 hours</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Custom analysis, vendor recommendations, implementation help
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Partnership Inquiries</div>
                    <Badge variant="outline">2-3 days</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Business partnerships, integrations, enterprise solutions
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Quick answers to common questions about PriceWise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">How does PriceWise protect my financial data?</h4>
                <p className="text-sm text-muted-foreground">
                  All data is transmitted using industry-standard TLS encryption and stored securely in our Supabase infrastructure. 
                  We never store your account credentials or payment information. All data is processed securely and deleted after analysis unless you explicitly save it.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">What types of bills can I analyze?</h4>
                <p className="text-sm text-muted-foreground">
                  PriceWise can analyze utility bills, telecom services, insurance, software subscriptions, 
                  office supplies, and most recurring business expenses. Our AI recognizes over 200 service categories.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">How accurate are the savings estimates?</h4>
                <p className="text-sm text-muted-foreground">
                  Our savings estimates are based on real-time market data and historical analysis. 
                  While individual results may vary, 94% of our users find savings within the estimated range.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Is there a free trial available?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! You can analyze up to 3 bills for free with no credit card required. 
                  This gives you a complete picture of potential savings before committing to a paid plan.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;