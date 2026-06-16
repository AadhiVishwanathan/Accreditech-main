-- Fix RLS policies for notifications to allow admin users to create notifications

-- First, drop the existing restrictive policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create a new policy that allows:
-- 1. Users to create notifications for themselves
-- 2. Admin users to create notifications for any user
CREATE POLICY "Users and admins can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Also allow admins to update notifications (for marking as read, etc.)
CREATE POLICY "Admins can update all notifications"
  ON public.notifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- Allow users to update their own notifications (for marking as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);