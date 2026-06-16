-- Fix the AI score calculation to use proper decimal values (0.00 to 1.00)
CREATE OR REPLACE FUNCTION calculate_ai_score_for_application()
RETURNS TRIGGER AS $$
DECLARE
  calculated_score NUMERIC;
  faculty_score NUMERIC := 0;
  infrastructure_score NUMERIC := 0;
  document_score NUMERIC := 0;
  total_weight NUMERIC := 0;
BEGIN
  -- Calculate faculty score (30% weight) - normalized to 0-1 range
  IF NEW.faculty_data IS NOT NULL AND NEW.faculty_data != '{}' THEN
    faculty_score := CASE 
      WHEN (NEW.faculty_data->>'total_faculty')::INTEGER >= 20 THEN 0.85
      WHEN (NEW.faculty_data->>'total_faculty')::INTEGER >= 15 THEN 0.75
      WHEN (NEW.faculty_data->>'total_faculty')::INTEGER >= 10 THEN 0.65
      WHEN (NEW.faculty_data->>'total_faculty')::INTEGER >= 5 THEN 0.55
      ELSE 0.45
    END;
    total_weight := total_weight + 30;
  END IF;

  -- Calculate infrastructure score (40% weight) - normalized to 0-1 range
  IF NEW.infrastructure_data IS NOT NULL AND NEW.infrastructure_data != '{}' THEN
    infrastructure_score := CASE 
      WHEN (NEW.infrastructure_data->>'total_area')::NUMERIC >= 10000 THEN 0.90
      WHEN (NEW.infrastructure_data->>'total_area')::NUMERIC >= 5000 THEN 0.80
      WHEN (NEW.infrastructure_data->>'total_area')::NUMERIC >= 2000 THEN 0.70
      WHEN (NEW.infrastructure_data->>'total_area')::NUMERIC >= 1000 THEN 0.60
      ELSE 0.50
    END;
    total_weight := total_weight + 40;
  END IF;

  -- Calculate document completeness score (30% weight) - normalized to 0-1 range
  IF NEW.documents IS NOT NULL AND NEW.documents != '{}' THEN
    document_score := LEAST(0.95, 0.50 + (jsonb_array_length(NEW.documents) * 0.05));
    total_weight := total_weight + 30;
  END IF;

  -- Calculate weighted average (result between 0.00 and 1.00)
  IF total_weight > 0 THEN
    calculated_score := (
      faculty_score * LEAST(30, total_weight * 0.3) + 
      infrastructure_score * LEAST(40, total_weight * 0.4) + 
      document_score * LEAST(30, total_weight * 0.3)
    ) / total_weight;
    
    -- Ensure the score is within bounds and round to 2 decimal places
    calculated_score := ROUND(LEAST(0.99, GREATEST(0.00, calculated_score)), 2);
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