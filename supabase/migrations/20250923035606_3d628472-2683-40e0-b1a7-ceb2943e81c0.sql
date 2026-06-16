-- Update existing EVC chairman credentials to use email format
UPDATE evc_chairman_credentials 
SET 
  username = 'deepakmenon@aicte.gov.in',
  password_hash = encode('adminevc123', 'base64'),
  updated_at = now()
WHERE id = '212afef2-e537-484d-8336-ee8ec416a317';