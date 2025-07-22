import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';

interface EmailChangeFormProps {
  currentEmail: string;
  onEmailChanged: () => void;
}

export function EmailChangeForm({ currentEmail, onEmailChanged }: EmailChangeFormProps) {
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { toast } = useToast();

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || newEmail === currentEmail) {
      toast({
        title: "Invalid Email",
        description: "Please enter a different email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Update email in Supabase Auth (this sends confirmation email automatically)
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      setConfirmationSent(true);
      
      toast({
        title: "Confirmation Email Sent",
        description: `A confirmation email has been sent to ${newEmail}. Please check your inbox and click the link to confirm the change.`,
      });

      // Reset form
      setNewEmail('');
      
    } catch (error: any) {
      console.error('Email change error:', error);
      toast({
        title: "Email Change Failed",
        description: error.message || "Failed to update email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (confirmationSent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Confirmation Email Sent
          </CardTitle>
          <CardDescription>
            Please check your email and click the confirmation link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              We've sent a confirmation email with a secure 15-minute token. 
              Click the link in the email to complete your email change.
              If you don't see it, check your spam folder.
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => setConfirmationSent(false)}
            className="mt-4"
          >
            Send Another Email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Change Email Address
        </CardTitle>
        <CardDescription>
          Update your email address with confirmation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-email">Current Email</Label>
            <Input
              id="current-email"
              type="email"
              value={currentEmail}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-email">New Email Address</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter your new email address"
              required
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              A confirmation email with a 15-minute token will be sent to your new email address. 
              You must click the confirmation link to complete the change.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            disabled={loading || !newEmail || newEmail === currentEmail}
            className="w-full"
          >
            {loading ? "Sending Confirmation..." : "Change Email Address"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}