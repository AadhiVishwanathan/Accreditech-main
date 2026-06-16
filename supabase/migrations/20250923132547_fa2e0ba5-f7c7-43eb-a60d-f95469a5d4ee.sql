-- Insert missing EVC assignment for Dr. Karan Iyer as chairman
INSERT INTO public.evc_assignments (
  application_id,
  evc_member_id,
  assignment_type,
  status,
  visit_date,
  assigned_by,
  assigned_at
) 
SELECT 
  'ea95a56e-9683-4f1a-8bf8-2e9708de946a',
  '4f9a5305-67fb-459a-8e6c-ff0ae346984f',
  'chairman',
  'assigned',
  '2025-09-29 18:30:00+00:00',
  'fabe1561-0075-4cf4-8de3-a53b83494072',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.evc_assignments 
  WHERE application_id = 'ea95a56e-9683-4f1a-8bf8-2e9708de946a' 
  AND evc_member_id = '4f9a5305-67fb-459a-8e6c-ff0ae346984f'
);