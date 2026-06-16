-- Create evaluators table
CREATE TABLE public.evaluators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  expertise TEXT[] NOT NULL DEFAULT '{}',
  experience_years INTEGER,
  location TEXT,
  workload INTEGER DEFAULT 0,
  max_workload INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_number TEXT NOT NULL UNIQUE,
  institute_id UUID NOT NULL REFERENCES public.institutes(id),
  programme_name TEXT NOT NULL,
  programme_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  evaluator_id UUID REFERENCES public.evaluators(id),
  ai_score NUMERIC(3,2),
  progress_percentage INTEGER DEFAULT 0,
  next_step TEXT,
  documents JSONB DEFAULT '{}',
  infrastructure_data JSONB DEFAULT '{}',
  faculty_data JSONB DEFAULT '{}',
  financial_data JSONB DEFAULT '{}',
  payment_status TEXT DEFAULT 'pending',
  payment_utr TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create application_workflow table for tracking status changes
CREATE TABLE public.application_workflow (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id),
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  comments TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Create document_verification table
CREATE TABLE public.document_verification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending',
  ocr_text TEXT,
  verification_score NUMERIC(3,2),
  fraud_checks JSONB DEFAULT '{}',
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create infrastructure_validation table
CREATE TABLE public.infrastructure_validation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id),
  facility_type TEXT NOT NULL,
  image_url TEXT NOT NULL,
  calculated_area NUMERIC(10,2),
  compliance_status TEXT DEFAULT 'pending',
  compliance_score NUMERIC(3,2),
  validation_metadata JSONB DEFAULT '{}',
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  application_id UUID REFERENCES public.applications(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('application-documents', 'application-documents', false);

-- Enable RLS on all tables
ALTER TABLE public.evaluators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for evaluators
CREATE POLICY "Admin can manage evaluators" ON public.evaluators FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

CREATE POLICY "Evaluators can view their own data" ON public.evaluators FOR SELECT TO authenticated USING (
  auth.uid() = user_id
);

-- Create RLS policies for applications
CREATE POLICY "Admin can manage all applications" ON public.applications FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'admin'
  )
);

CREATE POLICY "Institutes can view their own applications" ON public.applications FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.institutes 
    WHERE institutes.user_id = auth.uid() 
    AND institutes.id = applications.institute_id
  )
);

CREATE POLICY "Institutes can create applications" ON public.applications FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.institutes 
    WHERE institutes.user_id = auth.uid() 
    AND institutes.id = applications.institute_id
  )
);

CREATE POLICY "Evaluators can view assigned applications" ON public.applications FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.evaluators 
    WHERE evaluators.user_id = auth.uid() 
    AND evaluators.id = applications.evaluator_id
  )
);

-- Create RLS policies for workflow
CREATE POLICY "Users can view workflow for their applications" ON public.application_workflow FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    LEFT JOIN public.institutes i ON i.id = a.institute_id
    WHERE a.id = application_workflow.application_id
    AND (i.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.user_type IN ('admin', 'evaluator')
    ))
  )
);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING (
  auth.uid() = user_id
);

CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Create RLS policies for document verification
CREATE POLICY "Admin and evaluators can manage document verification" ON public.document_verification FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type IN ('admin', 'evaluator')
  )
);

-- Create RLS policies for infrastructure validation
CREATE POLICY "Admin and evaluators can manage infrastructure validation" ON public.infrastructure_validation FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type IN ('admin', 'evaluator')
  )
);

-- Create storage policies for application documents
CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'application-documents'
);

CREATE POLICY "Users can view documents they have access to" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'application-documents' AND (
    -- Institute can view their own documents
    auth.uid()::text = (storage.foldername(name))[1] OR
    -- Admin can view all documents
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.user_type = 'admin'
    ) OR
    -- Evaluator can view documents for assigned applications
    EXISTS (
      SELECT 1 FROM public.evaluators e
      JOIN public.applications a ON a.evaluator_id = e.id
      JOIN public.institutes i ON i.id = a.institute_id
      WHERE e.user_id = auth.uid()
      AND i.user_id::text = (storage.foldername(name))[1]
    )
  )
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_evaluators_updated_at
  BEFORE UPDATE ON public.evaluators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate application numbers
CREATE OR REPLACE FUNCTION public.generate_application_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Function to auto-generate application number on insert
CREATE OR REPLACE FUNCTION public.set_application_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_number IS NULL OR NEW.application_number = '' THEN
    NEW.application_number := public.generate_application_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate application number
CREATE TRIGGER set_application_number_trigger
  BEFORE INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_application_number();