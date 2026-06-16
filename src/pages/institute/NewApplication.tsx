import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Upload, Check } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { InstitutionDetails } from "@/components/application/InstitutionDetails";
import { ProgrammeDetails } from "@/components/application/ProgrammeDetails";
import { InfrastructureDetails } from "@/components/application/InfrastructureDetails";
import { FacultyDetails } from "@/components/application/FacultyDetails";
import { FinancialDetails } from "@/components/application/FinancialDetails";
import { AttachmentsSection } from "@/components/application/AttachmentsSection";
import { PaymentSection } from "@/components/application/PaymentSection";
import { ReviewSubmit } from "@/components/application/ReviewSubmit";

const steps = [
  { id: 1, title: "Institution Details", component: InstitutionDetails },
  { id: 2, title: "Programme Details", component: ProgrammeDetails },
  { id: 3, title: "Infrastructure", component: InfrastructureDetails },
  { id: 4, title: "Faculty Details", component: FacultyDetails },
  { id: 5, title: "Financial Details", component: FinancialDetails },
  { id: 6, title: "Attachments", component: AttachmentsSection },
  { id: 7, title: "Payment", component: PaymentSection },
  { id: 8, title: "Review & Submit", component: ReviewSubmit }
];

export default function NewApplication() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [institute, setInstitute] = useState<any>(null);
  const [formData, setFormData] = useState({
    institution: {},
    programme: {},
    infrastructure: {},
    faculty: {},
    financial: {},
    attachments: {},
    payment: {},
    submitted: false
  });

  // Load institute data and existing application if any
  useEffect(() => {
    if (user) {
      loadInstituteData();
    }
  }, [user]);

  const loadInstituteData = async () => {
    try {
      // Get institute data
      const { data: instituteData, error: instituteError } = await supabase
        .from('institutes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (instituteError) {
        console.error('Error loading institute:', instituteError);
        return;
      }

      setInstitute(instituteData);
      
      // Check for existing draft application
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('institute_id', instituteData.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1);

      if (appError) {
        console.error('Error loading applications:', appError);
        return;
      }

      if (applications && applications.length > 0) {
        const app = applications[0];
        setApplicationId(app.id);
        if (app.application_data) {
          setFormData(app.application_data as any);
        }
      } else {
        // Pre-fill institution details from institute data
        const institutionData = {
          institutionName: instituteData.institute_name || '',
          institutionType: instituteData.institute_type || '',
          establishedYear: instituteData.establishment_year?.toString() || '',
          principalName: instituteData.director_name || '',
          contactNumber: instituteData.phone || '',
          email: instituteData.email || '',
          website: instituteData.website || '',
          address: instituteData.address || '',
          city: instituteData.city || '',
          state: instituteData.state || '',
          district: '', // Not available in institute table
          pincode: instituteData.pincode || '',
          affiliatedUniversity: instituteData.university_name || ''
        };

        setFormData(prev => ({
          ...prev,
          institution: institutionData
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  // Section completion validation
  const getSectionCompletion = () => {
    const sections = [
      {
        key: 'institution',
        required: ['institutionName', 'institutionType', 'establishedYear', 'principalName', 'contactNumber', 'email', 'address', 'state', 'district', 'pincode']
      },
      {
        key: 'programme',
        required: ['programmes']
      },
      {
        key: 'infrastructure',
        required: ['landArea', 'builtUpArea', 'classrooms', 'laboratories', 'libraryArea', 'libraryBooks', 'computers', 'internetBandwidth']
      },
      {
        key: 'faculty',
        required: ['totalFaculty', 'phdFaculty', 'facultyStudentRatio', 'faculty']
      },
      {
        key: 'financial',
        required: ['feeCollection', 'facultySalaries', 'maintenanceCost', 'bankBalance', 'auditorFirm', 'auditorRegNumber']
      },
      {
        key: 'attachments',
        required: ['documents']
      },
      {
        key: 'payment',
        required: ['confirmed']
      }
    ];

    return sections.map(section => {
      const sectionData = formData[section.key];
      if (!sectionData) return false;

      const isComplete = section.required.every(field => {
        if (field === 'programmes' && sectionData.programmes) {
          return sectionData.programmes.length > 0 && sectionData.programmes[0].name;
        }
        if (field === 'faculty' && sectionData.faculty) {
          return sectionData.faculty.length > 0 && sectionData.faculty[0].name;
        }
        if (field === 'documents' && sectionData.documents) {
          return Object.keys(sectionData.documents).length > 0;
        }
        if (field === 'confirmed') {
          return sectionData.confirmed === true;
        }
        return sectionData[field];
      });

      return isComplete;
    });
  };

  const updateFormData = async (section: string, data: any) => {
    const updatedData = {
      ...formData,
      [section]: { ...(formData[section as keyof typeof formData] || {}), ...data }
    };
    
    setFormData(updatedData);
    
    // Save to database in real-time
    if (user && institute) {
      try {
        if (applicationId) {
          // Update existing application
          await supabase
            .from('applications')
            .update({
              application_data: updatedData,
              updated_at: new Date().toISOString()
            })
            .eq('id', applicationId);
        } else {
          // Create new draft application
          const { data: newApp, error } = await supabase
            .from('applications')
            .insert({
              institute_id: institute.id,
              programme_type: 'Under Graduate',
              programme_name: 'Draft Application',
              status: 'draft',
              application_data: updatedData,
              application_number: '' // Will be generated by trigger
            })
            .select()
            .single();

          if (error) {
            console.error('Error creating application:', error);
          } else {
            setApplicationId(newApp.id);
          }
        }
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('Starting submission...', { applicationId, institute });
      
      if (!applicationId || !institute) {
        console.error('Missing required data:', { applicationId, institute });
        throw new Error('Application data not found');
      }

      console.log('Form data:', formData);
      
      // Validate required data exists
      const programmeName = (formData.programme as any)?.programmes?.[0]?.name || 
                           (formData.programme as any)?.name || 
                           'Engineering';
      const programmeType = (formData.programme as any)?.programmes?.[0]?.type || 
                           (formData.programme as any)?.type || 
                           'Under Graduate';

      console.log('Programme data:', { programmeName, programmeType });

      // Update application status to submitted and generate application number
      const { data: submittedApp, error } = await supabase
        .from('applications')
        .update({
          status: 'submitted',
          submission_date: new Date().toISOString(),
          application_data: formData,
          programme_type: programmeType,
          programme_name: programmeName,
          progress_percentage: 100
        })
        .eq('id', applicationId)
        .select()
        .single();

      console.log('Supabase response:', { submittedApp, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      toast({
        title: "Application Submitted Successfully",
        description: `Your application ${submittedApp.application_number} has been submitted for review. You will receive updates via email.`,
      });

      setTimeout(() => {
        navigate("/institute/dashboard");
      }, 2000);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;
  const sectionCompletion = getSectionCompletion();
  const completedSections = sectionCompletion.filter(Boolean).length;
  const progress = (completedSections / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/institute/dashboard")}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">New Application</h1>
                <p className="text-sm text-muted-foreground">AICTE Approval Process</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className={`font-medium ${
                  completedSections === steps.length 
                    ? 'text-green-600' 
                    : completedSections > 0 
                      ? 'text-orange-600' 
                      : 'text-muted-foreground'
                }`}>
                  {completedSections}/{steps.length} Sections Complete ({Math.round(progress)}%)
                </span>
              </div>
              <Progress 
                value={progress} 
                className={`h-3 ${
                  completedSections === steps.length ? '[&>div]:bg-green-500' : '[&>div]:bg-primary'
                }`}
              />
            </div>
            
            {/* Step Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
              {steps.map((step, index) => {
                const isCompleted = sectionCompletion[index];
                const isCurrentStep = currentStep === step.id;
                const isPastStep = currentStep > step.id;
                
                return (
                  <Button
                    key={step.id}
                    variant={
                      isCurrentStep 
                        ? "default" 
                        : isCompleted 
                          ? "secondary" 
                          : "outline"
                    }
                    size="sm"
                    className={`h-auto p-2 flex flex-col items-center space-y-1 transition-colors ${
                      isCompleted && !isCurrentStep
                        ? 'bg-green-100 hover:bg-green-200 border-green-300 text-green-800'
                        : !isCompleted && !isCurrentStep
                          ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                          : ''
                    }`}
                    onClick={() => handleStepClick(step.id)}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : !isCompleted && !isCurrentStep ? (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    ) : (
                      <span className="text-xs">{step.id}</span>
                    )}
                    <span className="text-xs text-center leading-tight">
                      {step.title}
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm">
                {currentStep}
              </span>
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent 
              data={formData}
              updateData={updateFormData}
            />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep === steps.length ? (
            <Button onClick={handleSubmit} className="bg-gradient-primary hover:shadow-glow">
              <Upload className="h-4 w-4 mr-2" />
              Submit Application
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}