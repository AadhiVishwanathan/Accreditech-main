import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface EVCLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EVCLoginModal: React.FC<EVCLoginModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Invalid Credentials",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login with:', { username: credentials.username, password: credentials.password });
      
      // Use secure function to verify credentials
      const { data: verificationRaw, error: verificationError } = await (supabase as any)
        .rpc('verify_evc_credentials', {
          p_username: credentials.username,
          p_password: credentials.password
        });

      // Cast result for type-safety without generated RPC types
      type VerifyResult = { id: string; evc_member_id: string; application_id: string; username: string };
      const verificationData = (verificationRaw as any[] as VerifyResult[]);
      console.log('Verification result:', { data: verificationData, error: verificationError });

      if (verificationError) {
        console.error('Verification error:', verificationError);
        throw verificationError;
      }

      if (!verificationData || verificationData.length === 0) {
        console.log('No matching credentials found');
        toast({
          title: "Invalid Credentials",
          description: "Username or password is incorrect",
          variant: "destructive"
        });
        return;
      }

      const credentialData = verificationData[0];
      console.log('Found credential data:', credentialData);

      // Get session details using secure function
      const { data: sessionData, error: sessionError } = await supabase
        .rpc('get_evc_session_details', {
          p_evc_member_id: credentialData.evc_member_id,
          p_application_id: credentialData.application_id
        });

      console.log('Session data result:', { data: sessionData, error: sessionError });

      if (sessionError || !sessionData || sessionData.length === 0) {
        console.error('Session data error:', sessionError);
        toast({
          title: "Login Failed",
          description: "Unable to fetch session details",
          variant: "destructive"
        });
        return;
      }

      const sessionDetails = sessionData[0];
      console.log('Session details:', sessionDetails);

      // Store EVC session in localStorage
      const sessionInfo = {
        evc_member_id: credentialData.evc_member_id,
        application_id: credentialData.application_id,
        username: credentialData.username,
        member_name: sessionDetails.member_name,
        position: sessionDetails.member_position,
        specialization: sessionDetails.specialization,
        application_number: sessionDetails.application_number,
        institute_name: sessionDetails.institute_name
      };

      console.log('Storing session info:', sessionInfo);
      localStorage.setItem('evc_session', JSON.stringify(sessionInfo));

      toast({
        title: "Login Successful",
        description: `Welcome, ${sessionDetails.member_name}`,
      });

      onClose();
      navigate('/evc/dashboard');
    } catch (error) {
      console.error('EVC login error:', error);
      toast({
        title: "Login Failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCredentials({ username: '', password: '' });
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            EVC Chairman Login
          </DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Expert Visit Committee Access</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your EVC chairman credentials to access the evaluation dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your EVC username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground text-center">
          EVC chairman credentials are provided by the AICTE admin after team assignment.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EVCLoginModal;