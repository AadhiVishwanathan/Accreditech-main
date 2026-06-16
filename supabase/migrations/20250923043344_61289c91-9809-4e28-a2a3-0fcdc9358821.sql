-- Add unique constraint for visit_evaluations table to support ON CONFLICT
ALTER TABLE visit_evaluations 
ADD CONSTRAINT visit_evaluations_application_evc_chairman_unique 
UNIQUE (application_id, evc_chairman_id);