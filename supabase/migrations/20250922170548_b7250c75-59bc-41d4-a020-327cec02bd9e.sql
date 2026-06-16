-- Create admin user with profile
-- First, let's check if we need to insert a user directly
-- Note: In production, users should sign up through the UI, but for demo purposes we can create one

-- Insert into profiles table for admin user (this will be referenced by user_id)
-- We'll use a placeholder UUID that should match the actual auth user when created
INSERT INTO profiles (user_id, institute_name, user_type) 
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'AICTE Admin',
  'admin'
) ON CONFLICT (user_id) DO UPDATE SET
  institute_name = EXCLUDED.institute_name,
  user_type = EXCLUDED.user_type;

-- Create an evaluator for testing
INSERT INTO evaluators (
  id,
  user_id,
  name,
  email,
  phone,
  expertise,
  experience_years,
  location,
  is_active
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000002'::uuid,
  'Dr. John Evaluator',
  'evaluator@example.com',
  '+91-9876543210',
  ARRAY['Computer Science', 'Information Technology'],
  15,
  'Delhi',
  true
) ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  expertise = EXCLUDED.expertise;