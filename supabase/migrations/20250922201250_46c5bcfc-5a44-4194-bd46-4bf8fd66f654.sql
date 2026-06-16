-- Create RLS policies for infrastructure photos (skip if they already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can view infrastructure photos'
  ) THEN
    CREATE POLICY "Users can view infrastructure photos" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'infrastructure-photos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Institutes can upload infrastructure photos'
  ) THEN
    CREATE POLICY "Institutes can upload infrastructure photos" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'infrastructure-photos' AND auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Institutes can update their infrastructure photos'
  ) THEN
    CREATE POLICY "Institutes can update their infrastructure photos" 
    ON storage.objects 
    FOR UPDATE 
    USING (bucket_id = 'infrastructure-photos' AND auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Admin can manage all infrastructure photos'
  ) THEN
    CREATE POLICY "Admin can manage all infrastructure photos" 
    ON storage.objects 
    FOR ALL 
    USING (bucket_id = 'infrastructure-photos' AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_type = 'admin'
    ));
  END IF;
END
$$;