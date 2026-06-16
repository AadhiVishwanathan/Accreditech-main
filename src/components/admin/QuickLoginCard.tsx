import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
const QuickLoginCard: React.FC = () => {
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const loginAsAdmin = async () => {
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email: 'admin@aicte.gov.in',
        password: 'admin123' // Default password for demo
      });
      if (error) {
        console.error('Admin login error:', error);
        toast({
          title: "Login Failed",
          description: `Admin login failed: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Logged in as admin successfully"
        });
        // Refresh the page to update auth state
        window.location.reload();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Failed to login as admin",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const loginAsInstitute = async () => {
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email: 'admin@psg.ac.in',
        password: 'admin123'
      });
      if (error) {
        console.error('Institute login error:', error);
        toast({
          title: "Login Failed",
          description: `Institute login failed: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Logged in as institute successfully"
        });
        window.location.reload();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Failed to login as institute",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={loginAsAdmin} 
          className="w-full" 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login as Admin'}
        </Button>
        <Button 
          onClick={loginAsInstitute} 
          variant="outline" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login as Institute'}
        </Button>
      </CardContent>
    </Card>
  );
};
export default QuickLoginCard;