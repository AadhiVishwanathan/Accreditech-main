import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: 'admin' | 'institute';
}

export function LoginModal({ open, onOpenChange, userType }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate admin/evaluator email domain
    if (userType === 'admin' && !formData.email.endsWith('@aicte.gov.in')) {
      toast({
        title: "Access Denied",
        description: "Admin/Evaluator login requires an @aicte.gov.in email address.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // First try to sign in
      let { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      // If user doesn't exist and it's a demo admin account, create it
      if (error?.message === 'Invalid login credentials' && 
          formData.email === 'admin@aicte.gov.in' && 
          formData.password === 'admin123') {
        
        // Create the admin user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              institute_name: 'AICTE Admin',
              user_type: 'admin'
            }
          }
        });

        if (signUpError) {
          toast({
            title: "Account Creation Failed",
            description: signUpError.message,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Now try to sign in again
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          toast({
            title: "Login Failed",
            description: "Admin account created but login failed. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        data = signInData;
      } else if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Check user profile to determine user type
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', data.user.id)
          .single();

        const actualUserType = profile?.user_type || 'institute';
        
        // For admin portal access - allow both admins and evaluators
        if (userType === 'admin' && !['admin', 'evaluator'].includes(actualUserType)) {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "You do not have admin or evaluator privileges.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        onOpenChange(false);
        
        // Navigate based on actual user type
        if (actualUserType === 'admin') {
          navigate('/admin/dashboard');
        } else if (actualUserType === 'evaluator') {
          navigate('/evaluator/dashboard');
        } else {
          navigate('/institute/dashboard');
        }
        
        toast({
          title: "Login Successful",
          description: `Welcome to ${actualUserType === 'admin' ? 'Admin' : actualUserType === 'evaluator' ? 'Evaluator' : 'Institute'} Portal`,
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {userType === 'admin' ? (
              <Users className="h-5 w-5 text-primary" />
            ) : (
              <Building2 className="h-5 w-5 text-primary" />
            )}
            {userType === 'admin' ? 'Admin Login' : 'Institute Login'}
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <CardDescription>
              {userType === 'admin' 
                ? 'Access the administrative portal to manage applications and system settings (for Admins and Evaluators)'
                : 'Access your institute portal to manage applications and track status'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={userType === 'admin' ? 'admin@aicte.gov.in or evaluator@aicte.gov.in' : 'institute@example.edu'}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <Button variant="link" className="p-0 h-auto text-primary">
                  Forgot Password?
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:shadow-glow" 
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {userType === 'admin' && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Admin Account Setup:</strong><br />
                  Please register first: admin@aicte.gov.in<br />
                  Then login with your credentials
                </p>
              </div>
            )}

            {userType === 'institute' && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Demo Credentials:</strong><br />
                  Email: institute@example.edu<br />
                  Password: institute123
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}