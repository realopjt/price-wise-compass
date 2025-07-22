
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, AlertTriangle, UserCheck, CreditCard, Lock, Copyright, Eye, Gavel } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
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
            <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="outline">Last Updated: July 2025</Badge>
              <Badge variant="secondary">Version 3.0</Badge>
              <Badge variant="destructive">Enhanced IP Protection</Badge>
            </div>
            <p className="text-xl text-muted-foreground">
              Please read these terms carefully before using PriceWise services
            </p>
          </div>

          <div className="space-y-8">
            {/* Acceptance of Terms */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  1. Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  By accessing or using PriceWise ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                  If you disagree with any part of these terms, you may not access the Service.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  These Terms apply to all visitors, users, and others who access or use the Service. 
                  We reserve the right to update these terms at any time, and your continued use constitutes acceptance of any changes.
                </p>
              </CardContent>
            </Card>

            {/* Intellectual Property Rights */}
            <Card className="modern-card border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copyright className="w-5 h-5 text-orange-600" />
                  2. Intellectual Property Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Ownership of Content and Technology</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    PriceWise and its entire contents, features, functionality, algorithms, artificial intelligence systems, 
                    price comparison methodologies, data processing techniques, and user interfaces are owned by PriceWise, 
                    its licensors, or other providers of such material and are protected by United States and international 
                    copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Proprietary Algorithms and Methods</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our AI-powered bill analysis algorithms, price comparison methodologies, savings identification processes, 
                    and recommendation engines constitute valuable trade secrets and proprietary information. These systems 
                    are protected by intellectual property laws and confidentiality agreements.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Database Rights</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All databases, compilations, and collections of data used in the Service are protected by database rights 
                    and copyright laws. The selection, coordination, and arrangement of such content is the exclusive property of PriceWise.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trade Secrets & Proprietary Information */}
            <Card className="modern-card border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-600" />
                  3. Trade Secrets & Proprietary Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Confidential Business Processes</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our business processes, including but not limited to data analysis methodologies, vendor relationship 
                    management, pricing algorithms, and customer insights generation, constitute trade secrets protected under 
                    applicable trade secret laws. Users agree not to disclose, reproduce, or use these processes for any purpose 
                    other than their intended use of the Service.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Non-Disclosure Obligations</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Users who gain access to or insight into PriceWise's proprietary methods, algorithms, or business processes 
                    through use of the Service agree to maintain the confidentiality of such information and not to disclose it 
                    to third parties or use it for competitive purposes.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Reverse Engineering Prohibition</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Users are strictly prohibited from reverse engineering, decompiling, disassembling, or otherwise attempting 
                    to derive the source code, algorithms, or methods used in the Service. This includes using automated tools 
                    or manual processes to analyze the Service's functionality.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced User Restrictions */}
            <Card className="modern-card border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  4. Enhanced User Restrictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Strict Prohibition on Copying</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>Creating copies, reproductions, or derivative works of any part of the Service</li>
                    <li>Duplicating, copying, or replicating the Service's functionality, design, or user experience</li>
                    <li>Using the Service's content, algorithms, or methods to develop competing products or services</li>
                    <li>Extracting, scraping, or harvesting data from the Service using automated tools or manual processes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Competitive Intelligence Restrictions</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>Using the Service to gather competitive intelligence about PriceWise's business model or operations</li>
                    <li>Analyzing the Service's responses, recommendations, or data to understand proprietary algorithms</li>
                    <li>Benchmarking or comparing the Service against competing products for commercial purposes</li>
                    <li>Sharing insights derived from the Service with competitors or potential competitors</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Technical Restrictions</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>Accessing or attempting to access restricted areas of the Service</li>
                    <li>Interfering with or disrupting the Service's servers, networks, or security measures</li>
                    <li>Using any automated systems, bots, or scripts to access the Service</li>
                    <li>Attempting to bypass, circumvent, or disable any security features or access restrictions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Anti-Circumvention Measures */}
            <Card className="modern-card border-indigo-200 bg-indigo-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-600" />
                  5. Anti-Circumvention Measures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Security Measure Protection</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Users are prohibited from attempting to bypass, circumvent, remove, deactivate, impair, or otherwise 
                    interfere with any security-related features of the Service, including features that prevent or restrict 
                    the use or copying of content or that enforce limitations on use of the Service.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Access Control Violations</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Any attempt to gain unauthorized access to the Service, its servers, networks, or any systems or 
                    networks connected to the Service is strictly prohibited and may result in immediate termination 
                    of access and potential legal action.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Monitoring and Detection</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    PriceWise employs sophisticated monitoring systems to detect unauthorized access attempts, 
                    circumvention activities, and violations of these Terms. Users consent to such monitoring 
                    as a condition of using the Service.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Competitive Use Restrictions */}
            <Card className="modern-card border-yellow-200 bg-yellow-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-600" />
                  6. Competitive Use Restrictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Competitor Prohibitions</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Individuals or entities that operate, develop, or are affiliated with competing price comparison, 
                    bill analysis, or financial optimization services are prohibited from using the Service for 
                    competitive analysis, benchmarking, or any purpose that could benefit competing businesses.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Development Restrictions</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Users may not use insights, knowledge, or understanding gained from the Service to develop, 
                    improve, or enhance competing products or services. This includes using the Service's 
                    recommendations, analysis methods, or results as input for competing systems.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Definition of Competitive Use</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    "Competitive use" includes any use of the Service that directly or indirectly benefits a 
                    competing business, helps develop competing technology, or provides competitive advantages 
                    to entities operating in the same or similar markets as PriceWise.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-success" />
                  7. Service Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  PriceWise provides automated bill analysis and cost comparison services to help businesses and consumers 
                  identify potential savings on recurring expenses. Our service includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                  <li>AI-powered bill analysis and categorization</li>
                  <li>Market-based price comparison and savings identification</li>
                  <li>Vendor recommendations and alternative service suggestions</li>
                  <li>Location-based business and service discovery</li>
                  <li>Secure document processing and storage</li>
                </ul>
              </CardContent>
            </Card>

            {/* Billing and Payments */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent" />
                  8. Billing and Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Subscription Plans</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    PriceWise offers various subscription tiers with different feature sets and usage limits. 
                    All fees are charged in advance on a recurring basis according to your selected plan.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Refund Policy</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We offer a 30-day money-back guarantee for new subscribers. Refund requests must be submitted 
                    within 30 days of your initial subscription. Refunds are processed within 5-10 business days.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Price Changes</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We reserve the right to modify subscription prices with 30 days advance notice. 
                    Existing subscribers will maintain their current pricing until the next billing cycle after notification.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* DMCA & IP Enforcement */}
            <Card className="modern-card border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-green-600" />
                  9. DMCA & IP Enforcement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">IP Violation Reporting</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If you believe your intellectual property rights have been violated, please notify us immediately 
                    at legal@pricewise.com with detailed information about the alleged infringement. We will investigate 
                    and take appropriate action within 48 hours.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Enforcement Actions</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    PriceWise reserves the right to take immediate action against any user who violates these intellectual 
                    property terms, including but not limited to account suspension, service termination, legal action, 
                    and seeking damages and injunctive relief.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Legal Remedies</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Violations of these intellectual property terms may result in monetary damages, injunctive relief, 
                    attorney's fees, and other legal remedies available under applicable law. Users acknowledge that 
                    monetary damages may be insufficient to compensate for IP violations.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Penalties & Remedies */}
            <Card className="modern-card border-red-300 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-700" />
                  10. Enhanced Penalties & Remedies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Immediate Termination</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Any violation of the intellectual property, trade secret, or competitive use restrictions in these 
                    Terms will result in immediate termination of access to the Service without notice or refund.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Liquidated Damages</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    For violations of IP restrictions, users agree to pay liquidated damages of $10,000 per violation 
                    or actual damages, whichever is greater, plus attorney's fees and costs. This amount represents 
                    a reasonable estimate of the harm caused by such violations.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Injunctive Relief</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Users acknowledge that violations of these Terms would cause irreparable harm to PriceWise for which 
                    monetary damages would be inadequate. Therefore, PriceWise is entitled to seek injunctive relief 
                    and other equitable remedies without posting bond.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Governing Law & Jurisdiction</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    These Terms are governed by the laws of the Cayman Islands. Any disputes shall be resolved exclusively 
                    in the courts of the Cayman Islands, and users consent to personal jurisdiction in such courts.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle>11. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  PriceWise provides cost analysis and recommendations for informational purposes only. We do not guarantee 
                  specific savings amounts or results. Our liability is limited to the subscription amount paid for PriceWise's services in the 
                  twelve months preceding any claim.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We are not responsible for decisions made based on our recommendations, changes in market prices, 
                  or issues with recommended third-party service providers.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="modern-card bg-muted/30">
              <CardHeader>
                <CardTitle>Questions About These Terms?</CardTitle>
                <CardDescription>
                  If you have any questions about these Terms of Service, please contact us
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Email: legal@pricewise.com</div>
                  <div>Phone: 1-800-PRICEWISE (774-2394)</div>
                  <div>
                    Address: Suite 384, 10 Market Street, Camana Bay, Grand Cayman, Cayman Islands, KY1 9006
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

export default TermsOfService;
