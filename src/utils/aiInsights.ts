export interface AICTEAnalysis {
  overallScore: number;
  facultyScore: number;
  infrastructureScore: number;
  equipmentScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface Application {
  id: string;
  application_number: string;
  programme_type: string;
  programme_name: string;
  faculty_data?: any;
  infrastructure_data?: any;
  application_data?: any;
  institute?: {
    institute_name: string;
  };
}

// AICTE Minimum Requirements for Engineering & Technology
const AICTE_NORMS = {
  facultyStudentRatio: 15, // 1:15
  cadreRatio: {
    professor: 1,
    associateProfessor: 2,
    assistantProfessor: 6
  },
  minimumEquipment: {
    digitalMultimeter: 10,
    oscilloscope: 5,
    signalGenerator: 2,
    universalTestingMachine: 1,
    latheMachine: 2,
    computers: 30,
    soilTestingApparatus: 1,
    surveyingInstruments: 5,
    compressionTestingMachine: 1
  },
  minimumInfrastructure: {
    landArea: 5000, // sq meters for 60 students
    builtUpArea: 3000,
    classrooms: 6,
    laboratories: 8,
    library: 1,
    computerCenter: 1
  }
};

export function calculateAICTECompliance(application: Application): AICTEAnalysis {
  const facultyData = application.faculty_data || {};
  const infrastructureData = application.infrastructure_data || {};
  const applicationData = application.application_data || {};

  // Calculate Faculty Score
  const facultyScore = calculateFacultyCompliance(facultyData, applicationData);
  
  // Calculate Infrastructure Score
  const infrastructureScore = calculateInfrastructureCompliance(infrastructureData);
  
  // Calculate Equipment Score
  const equipmentScore = calculateEquipmentCompliance(infrastructureData);

  // Overall Score (weighted average)
  const overallScore = (facultyScore * 0.4 + infrastructureScore * 0.3 + equipmentScore * 0.3);

  // Generate insights
  const { strengths, weaknesses, recommendations } = generateInsights(
    facultyScore, 
    infrastructureScore, 
    equipmentScore, 
    facultyData, 
    infrastructureData,
    applicationData
  );

  return {
    overallScore,
    facultyScore,
    infrastructureScore,
    equipmentScore,
    strengths,
    weaknesses,
    recommendations
  };
}

function calculateFacultyCompliance(facultyData: any, applicationData: any): number {
  let score = 0;
  const checks = [];

  // Extract faculty information
  const facultySummary = facultyData.facultySummary || {};
  const facultyMembers = facultyData.facultyMembers || [];
  const sanctionedIntake = parseInt(applicationData.sanctionedIntake) || 60;

  // Check Faculty-Student Ratio (40% weight)
  const totalFaculty = parseInt(facultySummary.totalFaculty) || facultyMembers.length || 0;
  const requiredFaculty = Math.ceil(sanctionedIntake / AICTE_NORMS.facultyStudentRatio);
  const fsrScore = Math.min((totalFaculty / requiredFaculty) * 100, 100);
  checks.push({ name: "Faculty-Student Ratio", score: fsrScore, weight: 40 });

  // Check Cadre Ratio (30% weight)
  const professors = facultyMembers.filter((f: any) => f.designation?.toLowerCase().includes('professor')).length;
  const associateProfessors = facultyMembers.filter((f: any) => f.designation?.toLowerCase().includes('associate')).length;
  const assistantProfessors = facultyMembers.filter((f: any) => f.designation?.toLowerCase().includes('assistant')).length;
  
  const expectedGroups = Math.ceil(requiredFaculty / 9); // 9 faculty per group (1+2+6)
  const cadreScore = Math.min(
    ((professors / expectedGroups + associateProfessors / (expectedGroups * 2) + assistantProfessors / (expectedGroups * 6)) / 3) * 100,
    100
  );
  checks.push({ name: "Cadre Ratio", score: cadreScore, weight: 30 });

  // Check PhD Faculty (30% weight)
  const phdFaculty = parseInt(facultySummary.phdCount) || 
    facultyMembers.filter((f: any) => f.qualification?.toLowerCase().includes('phd')).length || 0;
  const phdScore = Math.min((phdFaculty / Math.max(1, expectedGroups)) * 100, 100);
  checks.push({ name: "PhD Faculty", score: phdScore, weight: 30 });

  // Calculate weighted score
  score = checks.reduce((acc, check) => acc + (check.score * check.weight / 100), 0);

  return Math.min(score, 100);
}

function calculateInfrastructureCompliance(infrastructureData: any): number {
  let score = 0;
  const checks = [];

  // Land and Building (30% weight)
  const landArea = parseFloat(infrastructureData.landArea) || 0;
  const landScore = Math.min((landArea / AICTE_NORMS.minimumInfrastructure.landArea) * 100, 100);
  checks.push({ name: "Land Area", score: landScore, weight: 30 });

  // Built-up Area (25% weight)
  const builtUpArea = parseFloat(infrastructureData.builtUpArea) || 0;
  const builtUpScore = Math.min((builtUpArea / AICTE_NORMS.minimumInfrastructure.builtUpArea) * 100, 100);
  checks.push({ name: "Built-up Area", score: builtUpScore, weight: 25 });

  // Classrooms (20% weight)
  const classrooms = parseInt(infrastructureData.classrooms) || 0;
  const classroomScore = Math.min((classrooms / AICTE_NORMS.minimumInfrastructure.classrooms) * 100, 100);
  checks.push({ name: "Classrooms", score: classroomScore, weight: 20 });

  // Laboratories (25% weight)
  const laboratories = parseInt(infrastructureData.laboratories) || 0;
  const labScore = Math.min((laboratories / AICTE_NORMS.minimumInfrastructure.laboratories) * 100, 100);
  checks.push({ name: "Laboratories", score: labScore, weight: 25 });

  score = checks.reduce((acc, check) => acc + (check.score * check.weight / 100), 0);
  return Math.min(score, 100);
}

function calculateEquipmentCompliance(infrastructureData: any): number {
  let score = 0;
  const checks = [];

  // Computing Infrastructure (40% weight)
  const computers = parseInt(infrastructureData.computers) || 0;
  const computerScore = Math.min((computers / AICTE_NORMS.minimumEquipment.computers) * 100, 100);
  checks.push({ name: "Computers", score: computerScore, weight: 40 });

  // Internet Bandwidth (20% weight)
  const bandwidth = parseFloat(infrastructureData.internetBandwidth) || 0;
  const bandwidthScore = bandwidth >= 100 ? 100 : bandwidth >= 50 ? 75 : bandwidth >= 25 ? 50 : 25;
  checks.push({ name: "Internet Bandwidth", score: bandwidthScore, weight: 20 });

  // Library Resources (20% weight)
  const libraryBooks = parseInt(infrastructureData.libraryBooks) || 0;
  const libraryScore = Math.min((libraryBooks / 1000) * 100, 100); // Assuming 1000+ books required
  checks.push({ name: "Library Resources", score: libraryScore, weight: 20 });

  // Power Backup (20% weight)
  const powerBackup = parseInt(infrastructureData.powerBackupCapacity) || 0;
  const powerScore = powerBackup >= 100 ? 100 : powerBackup >= 50 ? 75 : powerBackup >= 25 ? 50 : 25;
  checks.push({ name: "Power Backup", score: powerScore, weight: 20 });

  score = checks.reduce((acc, check) => acc + (check.score * check.weight / 100), 0);
  return Math.min(score, 100);
}

function generateInsights(
  facultyScore: number,
  infrastructureScore: number,
  equipmentScore: number,
  facultyData: any,
  infrastructureData: any,
  applicationData: any
): { strengths: string[], weaknesses: string[], recommendations: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // Faculty Analysis
  if (facultyScore >= 80) {
    strengths.push("Strong faculty composition meets AICTE norms");
  } else if (facultyScore >= 60) {
    strengths.push("Adequate faculty strength with scope for improvement");
  } else {
    weaknesses.push("Faculty strength below AICTE requirements");
    recommendations.push("Recruit additional qualified faculty to meet 1:15 ratio");
  }

  // Infrastructure Analysis
  if (infrastructureScore >= 80) {
    strengths.push("Excellent infrastructure facilities available");
  } else if (infrastructureScore >= 60) {
    strengths.push("Good infrastructure with minor gaps");
  } else {
    weaknesses.push("Infrastructure facilities need significant enhancement");
    recommendations.push("Expand classroom and laboratory facilities");
  }

  // Equipment Analysis
  if (equipmentScore >= 80) {
    strengths.push("Well-equipped with modern facilities");
  } else if (equipmentScore >= 60) {
    strengths.push("Adequate equipment for basic requirements");
  } else {
    weaknesses.push("Equipment and computing resources insufficient");
    recommendations.push("Upgrade laboratory equipment and computing infrastructure");
  }

  // Specific insights based on data
  const totalFaculty = parseInt(facultyData?.facultySummary?.totalFaculty) || 0;
  const phdCount = parseInt(facultyData?.facultySummary?.phdCount) || 0;
  
  if (phdCount > 0 && totalFaculty > 0) {
    const phdRatio = (phdCount / totalFaculty) * 100;
    if (phdRatio >= 30) {
      strengths.push(`High PhD faculty ratio (${phdRatio.toFixed(1)}%)`);
    }
  }

  const computers = parseInt(infrastructureData?.computers) || 0;
  if (computers >= 30) {
    strengths.push("Adequate computing infrastructure");
  } else if (computers > 0) {
    weaknesses.push("Computing facilities need expansion");
  }

  // Add default insights if arrays are empty
  if (strengths.length === 0) {
    strengths.push("Application submitted with required documentation");
  }
  
  if (weaknesses.length === 0 && (facultyScore < 70 || infrastructureScore < 70 || equipmentScore < 70)) {
    weaknesses.push("Some areas need attention to fully meet AICTE standards");
  }

  return { strengths, weaknesses, recommendations };
}