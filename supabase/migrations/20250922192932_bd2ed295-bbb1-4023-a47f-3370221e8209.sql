-- Allow admins to read all institute data for application management
CREATE POLICY "Admins can view all institutes"
  ON public.institutes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );