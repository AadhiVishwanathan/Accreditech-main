-- Fix security warning: Set search_path for the function
CREATE OR REPLACE FUNCTION calculate_ai_score_for_application()
RETURNS TRIGGER AS $$
DECLARE
  calculated_score NUMERIC;
  faculty_score NUMERIC := 0;
  infrastructure_score NUMERIC := 0;
  document_score NUMERIC := 0;
  total_weight NUMERIC := 0;
BEGIN
  -- Calculate faculty score (30% weight)
  IF NEW.faculty_data IS NOT NULL AND NEW.faculty_data != '{}' THEN
    -- Basic faculty scoring based on available data
    faculty_score := CASE 
      WHEN (NEW.faculty_data->>'total_faculty')::INTEGER >= 20 THEN 85
      WHEN (NEW.faculty_data->>'total_faculty')::INTEGER >= 15 THEN 75
      WHEN (NEW.faculty_data->>'total_faculty')::INTEGER >= 10 THEN 65
      WHEN (NEW.faculty_data->>'total_faculty')::INTEGER >= 5 THEN 55
      ELSE 45
    END;
    total_weight := total_weight + 30;
  END IF;

  -- Calculate infrastructure score (40% weight)
  IF NEW.infrastructure_data IS NOT NULL AND NEW.infrastructure_data != '{}' THEN
    -- Basic infrastructure scoring
    infrastructure_score := CASE 
      WHEN (NEW.infrastructure_data->>'total_area')::NUMERIC >= 10000 THEN 90
      WHEN (NEW.infrastructure_data->>'total_area')::NUMERIC >= 5000 THEN 80
      WHEN (NEW.infrastructure_data->>'total_area')::NUMERIC >= 2000 THEN 70
      WHEN (NEW.infrastructure_data->>'total_area')::NUMERIC >= 1000 THEN 60
      ELSE 50
    END;
    total_weight := total_weight + 40;
  END IF;

  -- Calculate document completeness score (30% weight)
  IF NEW.documents IS NOT NULL AND NEW.documents != '{}' THEN
    -- Score based on number of documents uploaded
    document_score := LEAST(95, 50 + (jsonb_array_length(NEW.documents) * 5));
    total_weight := total_weight + 30;
  END IF;

  -- Calculate weighted average
  IF total_weight > 0 THEN
    calculated_score := ROUND(
      (faculty_score * LEAST(30, total_weight * 0.3) + 
       infrastructure_score * LEAST(40, total_weight * 0.4) + 
       document_score * LEAST(30, total_weight * 0.3)) / total_weight, 
      1
    );
  ELSE
    calculated_score := NULL;
  END IF;

  -- Update the ai_score
  NEW.ai_score := calculated_score;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;