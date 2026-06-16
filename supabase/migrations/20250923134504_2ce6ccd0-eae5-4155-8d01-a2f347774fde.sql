-- Add sample data to demonstrate AI scoring with fixed numeric ranges
UPDATE applications 
SET 
  faculty_data = jsonb_build_object(
    'total_faculty', 15,
    'phd_faculty', 8,
    'professor_count', 3,
    'associate_professor_count', 5,
    'assistant_professor_count', 7
  ),
  infrastructure_data = jsonb_build_object(
    'total_area', 5500,
    'built_up_area', 4200,
    'classrooms', 12,
    'laboratories', 8,
    'library_area', 500,
    'auditorium_capacity', 200
  ),
  documents = jsonb_build_array(
    jsonb_build_object('name', 'Affiliation Certificate', 'url', '/docs/affiliation.pdf'),
    jsonb_build_object('name', 'Land Documents', 'url', '/docs/land.pdf'),
    jsonb_build_object('name', 'Building Plans', 'url', '/docs/building.pdf'),
    jsonb_build_object('name', 'Faculty List', 'url', '/docs/faculty.pdf'),
    jsonb_build_object('name', 'Equipment List', 'url', '/docs/equipment.pdf')
  )
WHERE application_number = 'APP-2025-004';

-- Add different data for another application to show score variation
UPDATE applications 
SET 
  faculty_data = jsonb_build_object(
    'total_faculty', 25,
    'phd_faculty', 18,
    'professor_count', 5,
    'associate_professor_count', 8,
    'assistant_professor_count', 12
  ),
  infrastructure_data = jsonb_build_object(
    'total_area', 12000,
    'built_up_area', 9500,
    'classrooms', 20,
    'laboratories', 15,
    'library_area', 800,
    'auditorium_capacity', 500
  ),
  documents = jsonb_build_array(
    jsonb_build_object('name', 'Affiliation Certificate', 'url', '/docs/affiliation.pdf'),
    jsonb_build_object('name', 'Land Documents', 'url', '/docs/land.pdf'),
    jsonb_build_object('name', 'Building Plans', 'url', '/docs/building.pdf'),
    jsonb_build_object('name', 'Faculty List', 'url', '/docs/faculty.pdf'),
    jsonb_build_object('name', 'Equipment List', 'url', '/docs/equipment.pdf'),
    jsonb_build_object('name', 'Financial Statement', 'url', '/docs/finance.pdf'),
    jsonb_build_object('name', 'Academic Calendar', 'url', '/docs/calendar.pdf')
  )
WHERE application_number = 'APP-2025-006';

-- Add minimal data for another application to show lower score
UPDATE applications 
SET 
  faculty_data = jsonb_build_object(
    'total_faculty', 8,
    'phd_faculty', 3,
    'professor_count', 1,
    'associate_professor_count', 2,
    'assistant_professor_count', 5
  ),
  infrastructure_data = jsonb_build_object(
    'total_area', 1500,
    'built_up_area', 1200,
    'classrooms', 6,
    'laboratories', 3,
    'library_area', 200,
    'auditorium_capacity', 100
  ),
  documents = jsonb_build_array(
    jsonb_build_object('name', 'Affiliation Certificate', 'url', '/docs/affiliation.pdf'),
    jsonb_build_object('name', 'Building Plans', 'url', '/docs/building.pdf')
  )
WHERE application_number = 'APP-2025-005';