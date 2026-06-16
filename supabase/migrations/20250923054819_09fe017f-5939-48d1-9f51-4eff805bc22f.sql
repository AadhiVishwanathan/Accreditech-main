-- Allow institutes to update their own applications (needed for submission)
DROP POLICY IF EXISTS "Institutes can update their own applications" ON public.applications;
CREATE POLICY "Institutes can update their own applications"
ON public.applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.institutes i
    WHERE i.user_id = auth.uid() AND i.id = applications.institute_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.institutes i
    WHERE i.user_id = auth.uid() AND i.id = applications.institute_id
  )
);

-- Ensure application numbers are generated automatically
-- Create BEFORE INSERT trigger to set application number if empty
DROP TRIGGER IF EXISTS applications_set_app_number_before_insert ON public.applications;
CREATE TRIGGER applications_set_app_number_before_insert
BEFORE INSERT ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.set_application_number();

-- Create BEFORE UPDATE trigger to set application number when submitting if missing
DROP TRIGGER IF EXISTS applications_set_app_number_before_update ON public.applications;
CREATE TRIGGER applications_set_app_number_before_update
BEFORE UPDATE ON public.applications
FOR EACH ROW
WHEN (NEW.status = 'submitted' AND (NEW.application_number IS NULL OR NEW.application_number = ''))
EXECUTE FUNCTION public.set_application_number();
