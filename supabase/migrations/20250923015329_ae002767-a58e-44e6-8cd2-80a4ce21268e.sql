-- Create EVC chairman profiles table for login credentials
CREATE TABLE public.evc_chairman_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evc_member_id UUID NOT NULL,
  application_id UUID NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.evc_chairman_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for EVC chairman credentials
CREATE POLICY "Admin can manage EVC chairman credentials" 
ON public.evc_chairman_credentials 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'admin'
));

-- Create visit evaluation table for EVC chairman to record evaluations
CREATE TABLE public.visit_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  evc_chairman_id UUID NOT NULL,
  visit_date TIMESTAMP WITH TIME ZONE,
  evaluation_status TEXT NOT NULL DEFAULT 'pending',
  remarks TEXT,
  pros TEXT[],
  cons TEXT[],
  infrastructure_rating INTEGER CHECK (infrastructure_rating >= 1 AND infrastructure_rating <= 5),
  faculty_rating INTEGER CHECK (faculty_rating >= 1 AND faculty_rating <= 5),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  is_approved BOOLEAN DEFAULT false,
  requires_rescheduling BOOLEAN DEFAULT false,
  reschedule_reason TEXT,
  new_proposed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visit_evaluations ENABLE ROW LEVEL SECURITY;

-- Create policies for visit evaluations
CREATE POLICY "Admin can manage all visit evaluations" 
ON public.visit_evaluations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'admin'
));

CREATE POLICY "EVC chairman can manage their evaluations" 
ON public.visit_evaluations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM evc_chairman_credentials ecc
  WHERE ecc.evc_member_id = visit_evaluations.evc_chairman_id
));

-- Add trigger for timestamp updates
CREATE TRIGGER update_evc_chairman_credentials_updated_at
BEFORE UPDATE ON public.evc_chairman_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visit_evaluations_updated_at
BEFORE UPDATE ON public.visit_evaluations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();