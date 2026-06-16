-- Enable realtime for all relevant tables
ALTER TABLE public.applications REPLICA IDENTITY FULL;
ALTER TABLE public.institutes REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.evaluators REPLICA IDENTITY FULL;
ALTER TABLE public.document_verification REPLICA IDENTITY FULL;
ALTER TABLE public.infrastructure_validation REPLICA IDENTITY FULL;
ALTER TABLE public.application_workflow REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.institutes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.evaluators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_verification;
ALTER PUBLICATION supabase_realtime ADD TABLE public.infrastructure_validation;
ALTER PUBLICATION supabase_realtime ADD TABLE public.application_workflow;