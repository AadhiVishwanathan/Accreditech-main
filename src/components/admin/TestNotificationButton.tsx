import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ensureAdminUser } from '@/utils/adminUtils';
const TestNotificationButton: React.FC = () => {
  const {
    toast
  } = useToast();
  const createTestNotification = async () => {
    try {
      // Get current user to verify admin access
      const {
        data: userData
      } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({
          title: "Error",
          description: "No authenticated user",
          variant: "destructive"
        });
        return;
      }
      console.log('Current user:', userData.user.id, userData.user.email);

      // Ensure current user is admin
      const userType = await ensureAdminUser();
      console.log('User type after admin check:', userType);
      if (userType !== 'admin') {
        toast({
          title: "Error",
          description: `User is not an admin. Current user type: ${userType || 'unknown'}`,
          variant: "destructive"
        });
        return;
      }

      // Get the institute user ID from the database
      // First check if we have permission to read institutes
      const {
        data: instituteData,
        error: instituteError
      } = await supabase.from('institutes').select('user_id, institute_name, id').order('created_at', {
        ascending: false
      }).limit(1).maybeSingle();
      console.log('Institute query result:', {
        instituteData,
        instituteError
      });
      if (instituteError) {
        console.error('Error fetching institute:', instituteError);
        toast({
          title: "Error",
          description: `Database error: ${instituteError.message}`,
          variant: "destructive"
        });
        return;
      }
      if (!instituteData) {
        console.log('No institutes found in database');
        toast({
          title: "Error",
          description: "No institutes found in database. Please create an institute first.",
          variant: "destructive"
        });
        return;
      }
      console.log('Creating notification for institute user:', instituteData.user_id);
      console.log('Current admin user creating notification:', userData.user.id);

      // Create test notification for institute user
      const notificationData = {
        user_id: instituteData.user_id,
        title: 'Expert Visit Committee Assigned',
        message: `Your Expert Visit Committee has been assigned with the following details:

Chairman: Dr. Tariq Iyer (Civil Engineering)

Team Members:
• Dr. Rajesh Sharma (Mechanical Engineering) - 12 years experience
• Dr. Suresh Bose (Mechanical Engineering) - 10 years experience
• Dr. Lata Dutta (Architecture) - 15 years experience
• Dr. Swapnil Deshmukh (Architecture) - 11 years experience

Visit scheduled for September 24th, 2025. Please prepare according to AICTE guidelines.`,
        type: 'info' as const,
        application_id: null
      };
      console.log('Notification data to insert:', notificationData);
      const {
        data,
        error
      } = await supabase.from('notifications').insert(notificationData).select();
      if (error) {
        console.error('Error creating test notification:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        toast({
          title: "Error",
          description: `Failed to create notification: ${error.message}`,
          variant: "destructive"
        });
      } else {
        console.log('Test notification created successfully:', data);
        toast({
          title: "Success",
          description: `Test notification created successfully for ${instituteData.institute_name}`
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to create test notification",
        variant: "destructive"
      });
    }
  };
  return (
    <Button onClick={createTestNotification} variant="outline" size="sm">
      <Bell className="h-4 w-4 mr-2" />
      Test Notification
    </Button>
  );
};

export default TestNotificationButton;