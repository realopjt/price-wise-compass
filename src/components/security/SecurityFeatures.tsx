import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Database, AlertTriangle, CheckCircle } from 'lucide-react';

export function SecurityFeatures() {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'TLS 1.3 Encryption',
      description: 'All data transmitted using the latest TLS 1.3 encryption protocol',
      status: 'Active',
      color: 'success'
    },
    {
      icon: Database,
      title: 'AES-256 Data Encryption',
      description: 'All stored data encrypted at rest using military-grade AES-256 encryption',
      status: 'Active',
      color: 'success'
    },
    {
      icon: Shield,
      title: 'SOC 2 Type II Compliance',
      description: 'Supabase infrastructure meets SOC 2 Type II security standards',
      status: 'Certified',
      color: 'primary'
    },
    {
      icon: Eye,
      title: 'Zero-Knowledge Architecture',
      description: 'We cannot access your sensitive financial data - only encrypted versions',
      status: 'By Design',
      color: 'accent'
    },
    {
      icon: AlertTriangle,
      title: 'Real-Time Threat Detection',
      description: 'Continuous monitoring for suspicious activities and breach attempts',
      status: 'Monitoring',
      color: 'warning'
    },
    {
      icon: CheckCircle,
      title: 'GDPR & CCPA Compliant',
      description: 'Full compliance with international data protection regulations',
      status: 'Compliant',
      color: 'success'
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Bank-Grade Security & Compliance
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your financial data is protected by enterprise-level security measures that meet or exceed banking industry standards.
          </p>
          <div className="flex justify-center gap-2">
            <Badge className="bg-success/10 text-success">ISO 27001 Certified</Badge>
            <Badge className="bg-primary/10 text-primary">PCI DSS Compliant</Badge>
            <Badge className="bg-accent/10 text-accent">GDPR Ready</Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {securityFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="modern-card">
                <CardHeader>
                  <div className={`w-12 h-12 bg-${feature.color}/10 rounded-lg flex items-center justify-center mb-4`}>
                    <IconComponent className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant="outline" 
                    className={`bg-${feature.color}/10 text-${feature.color} border-${feature.color}/20`}
                  >
                    {feature.status}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Security Details */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Infrastructure Security
              </CardTitle>
              <CardDescription>
                Built on Supabase's enterprise-grade infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">Multi-region data replication and backup</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">99.9% uptime SLA with automatic failover</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">Regular security audits and penetration testing</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">Row-level security (RLS) for data isolation</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-accent" />
                Data Protection
              </CardTitle>
              <CardDescription>
                Multiple layers of encryption and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">End-to-end encryption for all file uploads</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">Secure data deletion and right to be forgotten</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">No storage of payment credentials or passwords</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">Anonymized data processing for AI analysis</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg text-center">
          <h3 className="text-xl font-bold text-foreground mb-4">Trusted by Financial Institutions</h3>
          <p className="text-muted-foreground mb-4">
            Our security measures are trusted by banks, credit unions, and financial advisors worldwide.
          </p>
          <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              <span>Bank-Grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <span>Zero Data Breaches</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>Certified Secure</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}