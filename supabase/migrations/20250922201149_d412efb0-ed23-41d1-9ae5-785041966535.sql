-- Create storage bucket for infrastructure photos
INSERT INTO storage.buckets (id, name, public) VALUES ('infrastructure-photos', 'infrastructure-photos', true);

-- Create RLS policies for infrastructure photos
CREATE POLICY "Users can view infrastructure photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'infrastructure-photos');

CREATE POLICY "Institutes can upload infrastructure photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'infrastructure-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Institutes can update their infrastructure photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'infrastructure-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage all infrastructure photos" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'infrastructure-photos' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'admin'
));