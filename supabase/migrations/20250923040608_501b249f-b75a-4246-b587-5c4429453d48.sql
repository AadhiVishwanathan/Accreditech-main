-- Create function to verify EVC chairman credentials securely  
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
  SELECT ecc.id, ecc.evc_member_id, ecc.application_id, ecc.username, ecc.is_active, ecc.password_hash
  INTO rec
  FROM public.evc_chairman_credentials ecc
  WHERE ecc.username = p_username
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