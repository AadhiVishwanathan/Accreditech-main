-- Fix numeric field overflow issue in AI score calculation
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
      WHEN (NEW.faculty_data->>'total_faculty')::INTEGER >= 20 THEN 8.5
      WHEN (NEW.faculty_data->>'total_faculty')::INTEGER >= 15 THEN 7.5
      WHEN (NEW.faculty_data->>'total_faculty')::INTEGER >= 10 THEN 6.5
      WHEN (NEW.faculty_data->>'total_faculty')::INTEGER >= 5 THEN 5.5
      ELSE 4.5
    END;
    total_weight := total_weight + 3;
  END IF;

  -- Calculate infrastructure score (40% weight)
  IF NEW.infrastructure_data IS NOT NULL AND NEW.infrastructure_data != '{}' THEN
    -- Basic infrastructure scoring
    infrastructure_score := CASE 
      WHEN (NEW.infrastructure_data->>'total_area')::NUMERIC >= 10000 THEN 9.0
      WHEN (NEW.infrastructure_data->>'total_area')::NUMERIC >= 5000 THEN 8.0
      WHEN (NEW.infrastructure_data->>'total_area')::NUMERIC >= 2000 THEN 7.0
      WHEN (NEW.infrastructure_data->>'total_area')::NUMERIC >= 1000 THEN 6.0
      ELSE 5.0
    END;
    total_weight := total_weight + 4;
  END IF;

  -- Calculate document completeness score (30% weight)
  IF NEW.documents IS NOT NULL AND NEW.documents != '{}' THEN
    -- Score based on number of documents uploaded (scaled to 0-9.5)
    document_score := LEAST(9.5, 5.0 + (jsonb_array_length(NEW.documents) * 0.5));
    total_weight := total_weight + 3;
  END IF;

  -- Calculate weighted average (scale 0-10)
  IF total_weight > 0 THEN
    calculated_score := ROUND(
      (faculty_score * LEAST(3, total_weight * 0.3) + 
       infrastructure_score * LEAST(4, total_weight * 0.4) + 
       document_score * LEAST(3, total_weight * 0.3)) / total_weight, 
      2
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