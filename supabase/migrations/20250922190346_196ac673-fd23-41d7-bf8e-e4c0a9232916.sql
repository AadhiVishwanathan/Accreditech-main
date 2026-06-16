-- Create EVC (Expert Visit Committee) members table
CREATE TABLE public.evc_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  specialization TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_available BOOLEAN NOT NULL DEFAULT true,
  current_assignments INTEGER NOT NULL DEFAULT 0,
  max_assignments INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create EVC assignments table
CREATE TABLE public.evc_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  evc_member_id UUID NOT NULL,
  assignment_type TEXT NOT NULL DEFAULT 'member', -- 'chairman' or 'member'
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID NOT NULL,
  visit_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'assigned' -- 'assigned', 'completed', 'cancelled'
);

-- Create EVC teams table to group assignments
CREATE TABLE public.evc_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL UNIQUE,
  team_name TEXT NOT NULL,
  chairman_id UUID,
  total_members INTEGER NOT NULL DEFAULT 0,
  required_members INTEGER NOT NULL DEFAULT 4,
  visit_scheduled_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'forming', -- 'forming', 'complete', 'scheduled', 'completed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.evc_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evc_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evc_teams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for EVC members
CREATE POLICY "Admin can manage EVC members"
  ON public.evc_members
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'admin'
  ));

-- Create RLS policies for EVC assignments
CREATE POLICY "Admin can manage EVC assignments"
  ON public.evc_assignments
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'admin'
  ));

-- Create RLS policies for EVC teams
CREATE POLICY "Admin can manage EVC teams"
  ON public.evc_teams
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.user_type = 'admin'
  ));

-- Create indexes for better performance
CREATE INDEX idx_evc_members_specialization ON public.evc_members(specialization);
CREATE INDEX idx_evc_members_active ON public.evc_members(is_active, is_available);
CREATE INDEX idx_evc_assignments_application ON public.evc_assignments(application_id);
CREATE INDEX idx_evc_assignments_member ON public.evc_assignments(evc_member_id);
CREATE INDEX idx_evc_teams_application ON public.evc_teams(application_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_evc_members_updated_at
  BEFORE UPDATE ON public.evc_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evc_teams_updated_at
  BEFORE UPDATE ON public.evc_teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample EVC members data based on the uploaded file
INSERT INTO public.evc_members (name, position, specialization, experience_years) VALUES
('Dr. Tariq Iyer', 'Chairman', 'Civil Engineering', 22),
('Dr. Rajesh Sharma', 'AICTE Expert', 'Mechanical Engineering', 12),
('Dr. Suresh Bose', 'AICTE Expert', 'Mechanical Engineering', 10),
('Dr. Lata Dutta', 'AICTE Expert', 'Architecture', 15),
('Dr. Swapnil Deshmukh', 'AICTE Expert', 'Architecture', 11),
('Dr. Suresh Chatterjee', 'AICTE Expert', 'AI & ML', 10),
('Dr. Pratik Mehta', 'AICTE Expert', 'Cybersecurity', 34),
('Dr. Sunita Singh', 'AICTE Expert', 'Management', 30),
('Dr. Pratik Bose', 'AICTE Expert', 'AI & ML', 27),
('Dr. Suman Nair', 'AICTE Expert', 'Architecture', 25),
('Dr. Vikram Shah', 'AICTE Expert', 'Cybersecurity', 35),
('Dr. Tariq Dutta', 'AICTE Expert', 'Electronics', 23),
('Dr. Ravi Deshmukh', 'AICTE Expert', 'Civil Engineering', 28),
('Dr. Deepak Menon', 'AICTE Expert', 'AI & ML', 35),
('Dr. Suresh Rao', 'AICTE Expert', 'Electronics', 35),
('Dr. Aadesh Deshmukh', 'AICTE Expert', 'Architecture', 16),
('Dr. Vikram Mehta', 'AICTE Expert', 'Data Analytics', 14),
('Dr. Aadesh Joshi', 'AICTE Expert', 'Networking', 18),
('Dr. Karan Bose', 'AICTE Expert', 'Management', 25),
('Dr. Sunita Nair', 'AICTE Expert', 'Cybersecurity', 17),
('Dr. Karan Mukherjee', 'AICTE Expert', 'Electronics', 18),
('Dr. Meera Singh', 'AICTE Expert', 'Architecture', 19),
('Dr. Karan Iyer', 'AICTE Expert', 'Data Analytics', 25),
('Dr. Nisha Gupta', 'AICTE Expert', 'Electronics', 15),
('Dr. Swapnil Chatterjee', 'AICTE Expert', 'Management', 29),
('Dr. Alka Patil', 'AICTE Expert', 'Networking', 16),
('Dr. Priya Deshmukh', 'AICTE Expert', 'Civil Engineering', 29),
('Dr. Nisha Chatterjee', 'AICTE Expert', 'Data Analytics', 29),
('Dr. Vikram Joshi', 'AICTE Expert', 'Architecture', 28),
('Dr. Meera Patil', 'AICTE Expert', 'Civil Engineering', 11),
('Dr. Anita Rao', 'IIT/NIT Expert', 'AI & ML', 23),
('Dr. Ravi Singh', 'IIT/NIT Expert', 'Computer Science', 34),
('Dr. Suman Joshi', 'IIT/NIT Expert', 'Management', 29),
('Dr. Alka Mukherjee', 'IIT/NIT Expert', 'Architecture', 15),
('Dr. Swapnil Kulkarni', 'IIT/NIT Expert', 'Mechanical Engineering', 23),
('Dr. Pratik Nair', 'IIT/NIT Expert', 'AI & ML', 13),
('Dr. Lata Iyer', 'IIT/NIT Expert', 'Civil Engineering', 35),
('Dr. Suresh Menon', 'IIT/NIT Expert', 'Networking', 29),
('Dr. Tariq Nair', 'IIT/NIT Expert', 'Civil Engineering', 11),
('Dr. Gopal Bose', 'IIT/NIT Expert', 'Networking', 16),
('Dr. Swapnil Mukherjee', 'IIT/NIT Expert', 'AI & ML', 31),
('Dr. Tariq Patil', 'IIT/NIT Expert', 'Data Analytics', 18),
('Dr. Suresh Chatterjee', 'IIT/NIT Expert', 'Management', 10),
('Dr. Lata Singh', 'IIT/NIT Expert', 'Networking', 11),
('Dr. Suresh Deshmukh', 'IIT/NIT Expert', 'Architecture', 21),
('Dr. Gopal Dutta', 'IIT/NIT Expert', 'Electronics', 21),
('Dr. Aadesh Kulkarni', 'IIT/NIT Expert', 'Electronics', 26),
('Dr. Tariq Rao', 'IIT/NIT Expert', 'Architecture', 18),
('Dr. Sunita Mehta', 'IIT/NIT Expert', 'Electronics', 24),
('Dr. Aadesh Vyas', 'IIT/NIT Expert', 'Management', 31);

-- Enable realtime for the tables
ALTER TABLE public.evc_members REPLICA IDENTITY FULL;
ALTER TABLE public.evc_assignments REPLICA IDENTITY FULL;
ALTER TABLE public.evc_teams REPLICA IDENTITY FULL;