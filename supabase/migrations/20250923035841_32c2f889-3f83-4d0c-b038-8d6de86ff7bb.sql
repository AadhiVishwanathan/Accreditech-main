-- Fix the password hash to properly encode 'adminevc123'
UPDATE evc_chairman_credentials 
SET 
  password_hash = encode('adminevc123', 'base64'),
  updated_at = now()
WHERE username = 'deepakmenon@aicte.gov.in';