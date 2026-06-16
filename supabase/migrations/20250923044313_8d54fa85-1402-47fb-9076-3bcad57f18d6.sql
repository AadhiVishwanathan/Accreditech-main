-- Drop and recreate submit_evc_evaluation function to fix ambiguous column and add notifications
DROP FUNCTION IF EXISTS public.submit_evc_evaluation(uuid,uuid,timestamp with time zone,text,text,text[],text[],integer,integer,integer,boolean,boolean,text,timestamp with time zone);

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
  eval_id uuid,
  eval_application_id uuid,
  eval_evc_chairman_id uuid,
  eval_visit_date timestamp with time zone,
  eval_evaluation_status text,
  eval_remarks text,
  eval_pros text[],
  eval_cons text[],
  eval_infrastructure_rating integer,
  eval_faculty_rating integer,
  eval_overall_rating integer,
  eval_is_approved boolean,
  eval_requires_rescheduling boolean,
  eval_reschedule_reason text,
  eval_new_proposed_date timestamp with time zone,
  eval_created_at timestamp with time zone,
  eval_updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  evaluation_record visit_evaluations%ROWTYPE;
  application_status_update text;
  application_next_step text;
  institute_user uuid;
  notif_title text;
  notif_message text;
  notif_type text := 'info';
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

  -- Upsert evaluation using constraint name to avoid ambiguity with OUT params
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
  ON CONFLICT ON CONSTRAINT visit_evaluations_application_evc_chairman_unique
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

  -- Compute application status and next step
  IF p_is_approved THEN
    application_status_update := 'approved';
    application_next_step := 'Accreditation process completed successfully';
    notif_title := 'Application Approved';
    notif_message := 'Your application has been approved by the EVC committee.';
    notif_type := 'success';
  ELSIF p_requires_rescheduling THEN
    application_status_update := 'expert_visit_rescheduled';
    application_next_step := 'Expert visit rescheduled. Reason: ' || COALESCE(p_reschedule_reason, 'Not specified');
    notif_title := 'Expert Visit Rescheduled';
    notif_message := 'Expert visit has been rescheduled' ||
                     CASE WHEN p_new_proposed_date IS NOT NULL 
                          THEN ' to ' || to_char(p_new_proposed_date, 'DD Mon YYYY') 
                          ELSE '' END ||
                     CASE WHEN p_reschedule_reason IS NOT NULL 
                          THEN '. Reason: ' || p_reschedule_reason 
                          ELSE '' END;
    notif_type := 'warning';
  ELSE
    application_status_update := 'under_review';
    application_next_step := 'Application requires modifications based on expert evaluation';
    notif_title := 'Evaluation Completed';
    notif_message := 'Expert evaluation has been completed. Please check the feedback and make necessary improvements.';
    notif_type := 'info';
  END IF;

  -- Update application
  UPDATE public.applications 
  SET 
    status = application_status_update,
    next_step = application_next_step,
    updated_at = now()
  WHERE id = p_application_id;

  -- Find institute user to notify
  SELECT i.user_id INTO institute_user
  FROM public.applications a
  JOIN public.institutes i ON i.id = a.institute_id
  WHERE a.id = p_application_id
  LIMIT 1;

  -- Create notification for institute dashboard (if user present)
  IF institute_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, application_id, title, message, type)
    VALUES (institute_user, p_application_id, notif_title, notif_message, notif_type);
  END IF;

  -- Return the evaluation record mapped to OUT columns (prefixed to avoid ambiguity)
  eval_id := evaluation_record.id;
  eval_application_id := evaluation_record.application_id;
  eval_evc_chairman_id := evaluation_record.evc_chairman_id;
  eval_visit_date := evaluation_record.visit_date;
  eval_evaluation_status := evaluation_record.evaluation_status;
  eval_remarks := evaluation_record.remarks;
  eval_pros := evaluation_record.pros;
  eval_cons := evaluation_record.cons;
  eval_infrastructure_rating := evaluation_record.infrastructure_rating;
  eval_faculty_rating := evaluation_record.faculty_rating;
  eval_overall_rating := evaluation_record.overall_rating;
  eval_is_approved := evaluation_record.is_approved;
  eval_requires_rescheduling := evaluation_record.requires_rescheduling;
  eval_reschedule_reason := evaluation_record.reschedule_reason;
  eval_new_proposed_date := evaluation_record.new_proposed_date;
  eval_created_at := evaluation_record.created_at;
  eval_updated_at := evaluation_record.updated_at;

  RETURN NEXT;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.submit_evc_evaluation TO anon;
GRANT EXECUTE ON FUNCTION public.submit_evc_evaluation TO authenticated;