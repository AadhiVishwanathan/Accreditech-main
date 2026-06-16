-- Create secure function to submit EVC evaluations
CREATE OR REPLACE FUNCTION public.submit_evc_evaluation(
  p_application_id uuid,
  p_evc_chairman_id uuid,
  p_visit_date timestamp with time zone,
  p_evaluation_status text,
  p_remarks text,
  p_pros text[],
  p_cons text[],
  p_infrastructure_rating integer,
  p_faculty_rating integer,
  p_overall_rating integer,
  p_is_approved boolean,
  p_requires_rescheduling boolean,
  p_reschedule_reason text DEFAULT NULL,
  p_new_proposed_date timestamp with time zone DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  application_id uuid,
  evc_chairman_id uuid,
  visit_date timestamp with time zone,
  evaluation_status text,
  remarks text,
  pros text[],
  cons text[],
  infrastructure_rating integer,
  faculty_rating integer,
  overall_rating integer,
  is_approved boolean,
  requires_rescheduling boolean,
  reschedule_reason text,
  new_proposed_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  evaluation_record RECORD;
  application_status_update text;
  application_next_step text;
BEGIN
  -- Verify EVC chairman credentials exist for this application
  IF NOT EXISTS (
    SELECT 1 FROM public.evc_chairman_credentials 
    WHERE evc_member_id = p_evc_chairman_id 
    AND application_id = p_application_id 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Invalid EVC chairman credentials for this application';
  END IF;

  -- Insert or update the evaluation
  INSERT INTO public.visit_evaluations (
    application_id,
    evc_chairman_id,
    visit_date,
    evaluation_status,
    remarks,
    pros,
    cons,
    infrastructure_rating,
    faculty_rating,
    overall_rating,
    is_approved,
    requires_rescheduling,
    reschedule_reason,
    new_proposed_date
  ) VALUES (
    p_application_id,
    p_evc_chairman_id,
    p_visit_date,
    p_evaluation_status,
    p_remarks,
    p_pros,
    p_cons,
    p_infrastructure_rating,
    p_faculty_rating,
    p_overall_rating,
    p_is_approved,
    p_requires_rescheduling,
    p_reschedule_reason,
    p_new_proposed_date
  )
  ON CONFLICT (application_id, evc_chairman_id)
  DO UPDATE SET
    visit_date = EXCLUDED.visit_date,
    evaluation_status = EXCLUDED.evaluation_status,
    remarks = EXCLUDED.remarks,
    pros = EXCLUDED.pros,
    cons = EXCLUDED.cons,
    infrastructure_rating = EXCLUDED.infrastructure_rating,
    faculty_rating = EXCLUDED.faculty_rating,
    overall_rating = EXCLUDED.overall_rating,
    is_approved = EXCLUDED.is_approved,
    requires_rescheduling = EXCLUDED.requires_rescheduling,
    reschedule_reason = EXCLUDED.reschedule_reason,
    new_proposed_date = EXCLUDED.new_proposed_date,
    updated_at = now()
  RETURNING * INTO evaluation_record;

  -- Update application status based on evaluation
  IF p_is_approved THEN
    application_status_update := 'approved';
    application_next_step := 'Accreditation process completed successfully';
  ELSIF p_requires_rescheduling THEN
    application_status_update := 'expert_visit_rescheduled';
    application_next_step := 'Expert visit rescheduled. Reason: ' || COALESCE(p_reschedule_reason, 'Not specified');
  ELSE
    application_status_update := 'under_review';
    application_next_step := 'Application requires modifications based on expert evaluation';
  END IF;

  -- Update the application status
  UPDATE public.applications 
  SET 
    status = application_status_update,
    next_step = application_next_step,
    updated_at = now()
  WHERE id = p_application_id;

  -- Return the evaluation record
  RETURN QUERY SELECT 
    evaluation_record.id,
    evaluation_record.application_id,
    evaluation_record.evc_chairman_id,
    evaluation_record.visit_date,
    evaluation_record.evaluation_status,
    evaluation_record.remarks,
    evaluation_record.pros,
    evaluation_record.cons,
    evaluation_record.infrastructure_rating,
    evaluation_record.faculty_rating,
    evaluation_record.overall_rating,
    evaluation_record.is_approved,
    evaluation_record.requires_rescheduling,
    evaluation_record.reschedule_reason,
    evaluation_record.new_proposed_date,
    evaluation_record.created_at,
    evaluation_record.updated_at;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.submit_evc_evaluation TO anon;
GRANT EXECUTE ON FUNCTION public.submit_evc_evaluation TO authenticated;