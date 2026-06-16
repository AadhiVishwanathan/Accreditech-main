-- Secure RPC to fetch assignment and application+institute details for an EVC chairman
CREATE OR REPLACE FUNCTION public.get_evc_assignment_and_application(
  p_evc_member_id uuid,
  p_application_id uuid
)
RETURNS TABLE (
  assignment_id uuid,
  visit_date timestamptz,
  assignment_status text,
  assignment_type text,
  application_id uuid,
  application_number text,
  programme_name text,
  programme_type text,
  application_status text,
  submission_date timestamptz,
  institute_id uuid,
  institute_name text,
  institute_type text,
  address text,
  city text,
  state text,
  pincode text,
  phone text,
  email text,
  website text,
  director_name text,
  director_email text,
  director_phone text,
  nodal_officer_name text,
  nodal_officer_email text,
  nodal_officer_phone text,
  establishment_year int
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ea.id as assignment_id,
    ea.visit_date,
    ea.status as assignment_status,
    ea.assignment_type,
    a.id as application_id,
    a.application_number,
    a.programme_name,
    a.programme_type,
    a.status as application_status,
    a.submission_date,
    i.id as institute_id,
    i.institute_name,
    i.institute_type,
    i.address,
    i.city,
    i.state,
    i.pincode,
    i.phone,
    i.email,
    i.website,
    i.director_name,
    i.director_email,
    i.director_phone,
    i.nodal_officer_name,
    i.nodal_officer_email,
    i.nodal_officer_phone,
    i.establishment_year
  FROM public.evc_assignments ea
  JOIN public.applications a ON a.id = ea.application_id
  JOIN public.institutes i ON i.id = a.institute_id
  WHERE ea.evc_member_id = p_evc_member_id
    AND ea.application_id = p_application_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_evc_assignment_and_application(uuid, uuid) TO anon, authenticated;

-- Secure RPC to fetch all EVC team members for an application
CREATE OR REPLACE FUNCTION public.get_evc_team_members(p_application_id uuid)
RETURNS TABLE (
  member_id uuid,
  name text,
  position text,
  specialization text,
  experience_years int,
  assignment_type text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    m.id as member_id,
    m.name,
    m.position,
    m.specialization,
    m.experience_years,
    ea.assignment_type
  FROM public.evc_assignments ea
  JOIN public.evc_members m ON m.id = ea.evc_member_id
  WHERE ea.application_id = p_application_id
  ORDER BY CASE WHEN ea.assignment_type = 'chairman' THEN 0 ELSE 1 END, m.name;
$$;

GRANT EXECUTE ON FUNCTION public.get_evc_team_members(uuid) TO anon, authenticated;

-- Secure RPC to fetch infrastructure photos for an application
CREATE OR REPLACE FUNCTION public.get_infrastructure_photos(p_application_id uuid)
RETURNS TABLE (
  id uuid,
  facility_type text,
  image_url text,
  compliance_score numeric,
  compliance_status text,
  calculated_area numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    iv.id,
    iv.facility_type,
    iv.image_url,
    iv.compliance_score,
    iv.compliance_status,
    iv.calculated_area
  FROM public.infrastructure_validation iv
  WHERE iv.application_id = p_application_id
  ORDER BY iv.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_infrastructure_photos(uuid) TO anon, authenticated;