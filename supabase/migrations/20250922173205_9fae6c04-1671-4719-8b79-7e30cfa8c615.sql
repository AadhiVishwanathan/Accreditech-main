-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, institute_name, user_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'institute_name',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'institute')
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
DECLARE
  year_part TEXT;
  counter INTEGER;
  app_number TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Get the next counter for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 'APP-' || year_part || '-(\d{3})') AS INTEGER)), 0) + 1
  INTO counter
  FROM public.applications
  WHERE application_number LIKE 'APP-' || year_part || '-%';
  
  -- Format the application number
  app_number := 'APP-' || year_part || '-' || LPAD(counter::TEXT, 3, '0');
  
  RETURN app_number;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_application_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $function$
BEGIN
  IF NEW.application_number IS NULL OR NEW.application_number = '' THEN
    NEW.application_number := public.generate_application_number();
  END IF;
  RETURN NEW;
END;
$function$;