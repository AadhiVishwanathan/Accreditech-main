-- Function to verify EVC chairman credentials securely
CREATE OR REPLACE FUNCTION public.verify_evc_credentials(
  p_username text,
  p_password text
)
RETURNS TABLE (id uuid, evc_member_id uuid, application_id uuid, username text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
BEGIN
  SELECT id, evc_member_id, application_id, username, is_active, password_hash
  INTO rec
  FROM public.evc_chairman_credentials
  WHERE username = p_username
  LIMIT 1;

  IF rec IS NULL OR rec.is_active IS NOT TRUE THEN
    RETURN; -- no rows -> invalid
  END IF;

  IF convert_from(decode(rec.password_hash, 'base64'), 'UTF8') = p_password THEN
    RETURN QUERY SELECT rec.id, rec.evc_member_id, rec.application_id, rec.username;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_evc_credentials(text, text) TO anon, authenticated;

-- Function to get EVC session details safely
CREATE OR REPLACE FUNCTION public.get_evc_session_details(
  p_evc_member_id uuid,
  p_application_id uuid
)
RETURNS TABLE (member_name text, position text, specialization text, application_number text, institute_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT em.name, em.position, em.specialization, a.application_number, i.institute_name
  FROM public.evc_members em
  JOIN public.applications a ON a.id = p_application_id
  JOIN public.institutes i ON i.id = a.institute_id
  WHERE em.id = p_evc_member_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_evc_session_details(uuid, uuid) TO anon, authenticated;