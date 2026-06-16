-- Fix previous error by avoiding reserved word column name
CREATE OR REPLACE FUNCTION public.get_evc_session_details(
  p_evc_member_id uuid,
  p_application_id uuid
)
RETURNS TABLE (member_name text, member_position text, specialization text, application_number text, institute_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT em.name as member_name, em.position as member_position, em.specialization, a.application_number, i.institute_name
  FROM public.evc_members em
  JOIN public.applications a ON a.id = p_application_id
  JOIN public.institutes i ON i.id = a.institute_id
  WHERE em.id = p_evc_member_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_evc_session_details(uuid, uuid) TO anon, authenticated;