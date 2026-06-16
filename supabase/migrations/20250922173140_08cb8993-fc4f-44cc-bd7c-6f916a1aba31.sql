-- Add real-time data storage for application forms
-- Add application_data column to store all form data
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS application_data jsonb DEFAULT '{}';

-- Update the application number trigger to be more robust
CREATE OR REPLACE FUNCTION public.set_application_number()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.application_number IS NULL OR NEW.application_number = '' THEN
    NEW.application_number := public.generate_application_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger for application number generation
DROP TRIGGER IF EXISTS set_application_number_trigger ON public.applications;
CREATE TRIGGER set_application_number_trigger
  BEFORE INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_application_number();

-- Add real-time support for applications table
ALTER TABLE public.applications REPLICA IDENTITY FULL;