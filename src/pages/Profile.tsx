import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { EmailChangeForm } from "@/components/auth/EmailChangeForm";
import { 
  User, 
  Camera, 
  Save, 
  ArrowLeft,
  Calendar,
  Mail,
  Crown,
  DollarSign,
  Edit,
  Upload
} from "lucide-react";

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  subscription_type: string | null;
  created_at: string;
}

interface UserType {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
  };
}

const Profile = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const initializeAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session?.user && session.user.email) {
        setUser(session.user as UserType);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || null,
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
        setFullName(newProfile.full_name || "");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error loading profile",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user?.id) return null;
    
    try {
      setUploading(true);
      
      // Show progress toast
      toast({
        title: "Uploading avatar...",
        description: "Please wait while we upload your profile picture.",
      });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Remove old avatar if exists to avoid storage bloat
      if (profile?.avatar_url) {
        try {
          const oldFileName = profile.avatar_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('avatars')
              .remove([`avatars/${oldFileName}`]);
          }
        } catch (error) {
          console.log('Could not remove old avatar:', error);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Ensure the URL is valid and accessible
      const avatarUrl = data.publicUrl;
      
      // Verify the upload worked by trying to fetch the image
      try {
        const response = await fetch(avatarUrl);
        if (!response.ok) {
          throw new Error('Avatar upload verification failed');
        }
      } catch (error) {
        console.warn('Avatar verification failed, but continuing:', error);
      }

      return avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      
      let avatarUrl = profile?.avatar_url;
      
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
        if (!avatarUrl) return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName || null,
          avatar_url: avatarUrl,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state immediately
      setProfile(prev => prev ? {
        ...prev,
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
      } : null);

      setAvatarFile(null);
      
      // Force a re-fetch of the profile to ensure consistency
      setTimeout(() => {
        fetchProfile();
      }, 1000);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please choose an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast({
          title: "Invalid file type",
          description: "Please choose a JPEG or PNG image.",
          variant: "destructive",
        });
        return;
      }
      
      setAvatarFile(file);
    }
  };

  const formatMemberSince = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubscriptionBadge = (subscriptionType: string | null) => {
    if (subscriptionType === 'pro') {
      return <Crown className="h-4 w-4 text-amber-500" />;
    }
    if (subscriptionType === 'enterprise') {
      return <Crown className="h-4 w-4 text-purple-500" />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
          <p>Please sign in to access your profile</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-card backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{user.user_metadata?.full_name || user.email || 'User'}</span>
              {getSubscriptionBadge(profile?.subscription_type)}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={avatarFile ? URL.createObjectURL(avatarFile) : profile?.avatar_url || ""} 
                    alt="Profile picture" 
                  />
                  <AvatarFallback className="text-lg">
                    {(fullName || user.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Camera className="h-4 w-4" />
                      {avatarFile ? 'Change Picture' : 'Upload Picture'}
                    </div>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    JPEG or PNG. Max size 5MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email">Email Address</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowEmailChange(true)}
                      className="gap-2 text-xs"
                    >
                      <Edit className="h-3 w-3" />
                      Change Email
                    </Button>
                  </div>
                  <Input
                    id="email"
                    value={user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your current email address. Click "Change Email" to update it.
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={saving || uploading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Email Change Form */}
          {showEmailChange && (
            <EmailChangeForm
              currentEmail={user.email || ''}
              onEmailChanged={() => {
                // After email change, hide the form and refresh session to reflect new email
                setShowEmailChange(false);
                initializeAuth();
              }}
            />
          )}

          {/* Account Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{user.email || 'No email'}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Member Since
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {profile?.created_at ? formatMemberSince(profile.created_at) : 'Unknown'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Crown className="h-4 w-4 text-muted-foreground" />
                    Subscription
                  </div>
                  <div className="flex items-center gap-2 pl-6">
                    <p className="text-sm text-muted-foreground capitalize">
                      {profile?.subscription_type || 'Free'}
                    </p>
                    {getSubscriptionBadge(profile?.subscription_type)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;