import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Eye, Lock, Database, Cookie, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
            <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="outline">Last Updated: December 2024</Badge>
              <Badge variant="secondary">GDPR & CCPA Compliant</Badge>
            </div>
            <p className="text-xl text-muted-foreground">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
          </div>

          <div className="space-y-8">
            {/* Information We Collect */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  1. Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Account Information</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    When you create an account, we collect your email address, name, and business information. 
                    This information is necessary to provide our services and communicate with you about your account.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Bill and Document Data</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We process uploaded bills and documents to provide cost analysis. This may include vendor names, 
                    amounts, service types, and billing periods. We do not store payment methods or account numbers.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Usage Analytics</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We collect information about how you use our service, including features accessed, 
                    analysis requests, and general usage patterns to improve our platform.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-success" />
                  2. How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                  <li>Provide bill analysis and cost comparison services</li>
                  <li>Generate personalized savings recommendations</li>
                  <li>Communicate important account and service updates</li>
                  <li>Improve our AI analysis algorithms and service quality</li>
                  <li>Ensure platform security and prevent fraudulent activity</li>
                  <li>Comply with legal obligations and respond to lawful requests</li>
                </ul>
                <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm text-success font-medium">
                    <strong>We never sell your personal information to third parties.</strong>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-warning" />
                  3. Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Encryption</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All data is encrypted in transit using TLS 1.2+ encryption and encrypted at rest using 
                    industry-standard encryption through our Supabase infrastructure. Our security measures are designed to protect your sensitive information.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Access Controls</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Access to your data is strictly limited to authorized personnel who need it to provide services. 
                    All access is logged and monitored for unauthorized activity.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Data Retention</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We retain your data only as long as necessary to provide services or as required by law. 
                    Analysis data is automatically deleted after 2 years unless you choose to save it longer.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Third-Party Sharing */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  4. Third-Party Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We may share limited information with trusted third parties in these specific circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                  <li><strong>Service Providers:</strong> Companies that help us operate our platform (cloud hosting, analytics)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                  <li><strong>Business Transfer:</strong> In the event of a merger, acquisition, or sale of assets</li>
                  <li><strong>Safety:</strong> To protect the rights, property, or safety of PriceWise, users, or others</li>
                </ul>
                <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-primary">
                    <strong>Note:</strong> Any third-party service providers are contractually obligated to protect 
                    your information and use it only for specified purposes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="w-5 h-5 text-destructive" />
                  5. Your Privacy Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Access and Portability</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You can request a copy of all personal information we have about you in a machine-readable format.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Correction and Deletion</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You can update your account information at any time or request deletion of your account and all associated data.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Opt-Out Rights</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You can opt out of marketing communications and request that we stop processing your data for certain purposes.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">California Residents (CCPA)</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    California residents have additional rights including the right to know what personal information is collected 
                    and the right to request deletion. Contact us to exercise these rights.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cookies and Tracking */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="w-5 h-5 text-warning" />
                  6. Cookies and Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to improve your experience and analyze usage patterns:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                  <li><strong>Essential Cookies:</strong> Required for basic platform functionality and security</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You can control cookie settings through your browser, though disabling certain cookies may affect functionality.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="modern-card bg-muted/30">
              <CardHeader>
                <CardTitle>Privacy Questions or Concerns?</CardTitle>
                <CardDescription>
                  Contact our privacy team for questions about this policy or your data rights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Email: privacy@pricewise.com</div>
                  <div>Phone: 1-800-PRICEWISE (774-2394)</div>
                  <div>
                    Address: Privacy Officer, Suite 384, 10 Market Street, Camana Bay, Grand Cayman, Cayman Islands, KY1 9006
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;