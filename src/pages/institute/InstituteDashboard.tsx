import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Upload, Eye, Download, Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ApplicationStatusCard } from "@/components/institute/ApplicationStatusCard";
import { ApplicationPreview } from "@/components/application/ApplicationPreview";
import { QuickStats } from "@/components/institute/QuickStats";
import { ApplicationTracker } from "@/components/institute/ApplicationTracker";
import { NotificationsPanel } from "@/components/institute/NotificationsPanel";
import { InfrastructureUploadModal } from "@/components/infrastructure/InfrastructureUploadModal";
import { ApplicationInsightsModal } from "@/components/institute/ApplicationInsightsModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
export default function InstituteDashboard() {
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  const [institute, setInstitute] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewApplication, setPreviewApplication] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [selectedApplicationForInsights, setSelectedApplicationForInsights] = useState(null);

  // Fetch institute data
  const fetchInstituteData = async () => {
    if (!user) return;
    try {
      const {
        data: instituteData,
        error: instituteError
      } = await supabase.from('institutes').select('*').eq('user_id', user.id).single();
      if (instituteError && instituteError.code !== 'PGRST116') {
        console.error('Error fetching institute:', instituteError);
        return;
      }
      setInstitute(instituteData);
    } catch (error) {
      console.error('Error fetching institute data:', error);
    }
  };

  // Fetch applications for this institute
  const fetchApplications = async () => {
    if (!user) return;
    try {
      const {
        data: instituteData
      } = await supabase.from('institutes').select('id').eq('user_id', user.id).single();
      if (!instituteData) return;
      const {
        data: applicationsData,
        error: applicationsError
      } = await supabase.from('applications').select('*').eq('institute_id', instituteData.id).order('created_at', {
        ascending: false
      });
      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        return;
      }

      // Transform data to match component interface
      const transformedApplications = applicationsData.map(app => ({
        id: app.application_number,
        program: `${app.programme_type} ${app.programme_name}`,
        submittedDate: new Date(app.submission_date).toLocaleDateString(),
        status: app.status,
        progress: app.progress_percentage || 0,
        nextStep: app.next_step || 'Awaiting Review',
        aiScore: app.ai_score || 0,
        rawData: app // Store the raw database data
      }));
      setApplications(transformedApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  // Fetch recent activities/notifications
  const fetchRecentActivities = async () => {
    if (!user) return;
    try {
      const {
        data: notificationsData,
        error
      } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      }).limit(5);
      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }
      const transformedActivities = notificationsData.map(notification => ({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        timestamp: new Date(notification.created_at).toLocaleDateString(),
        icon: notification.type === 'success' ? CheckCircle : AlertCircle,
        color: notification.type === 'success' ? 'text-success' : 'text-warning'
      }));
      setRecentActivities(transformedActivities);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;
    fetchInstituteData();
    fetchApplications();
    fetchRecentActivities();
    setLoading(false);

    // Subscribe to applications changes
    const applicationsChannel = supabase.channel('applications-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'applications'
    }, () => {
      fetchApplications();
    }).subscribe();

    // Subscribe to notifications changes
    const notificationsChannel = supabase.channel('notifications-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'notifications'
    }, () => {
      fetchRecentActivities();
    }).subscribe();
    return () => {
      supabase.removeChannel(applicationsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user]);

  // Download PDF handlers
  const downloadApplicationForm = () => {
    const link = document.createElement('a');
    link.href = '/forms/ApplicationforNewCollege_2021-22.pdf';
    link.download = 'ApplicationforNewCollege_2021-22.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Application form downloaded successfully');
  };
  const downloadUserManual = () => {
    const link = document.createElement('a');
    link.href = '/documents/APH_Final_1.pdf';
    link.download = 'APH_Final_1.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('User manual downloaded successfully');
  };
  const viewGuidelines = () => {
    window.open('/documents/APH_Final_1.pdf', '_blank');
  };
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  // Helper function to check if application is complete
  const isApplicationComplete = (applicationData: any) => {
    if (!applicationData) return false;
    const requiredSections = ['institution', 'programme', 'faculty', 'infrastructure', 'financial', 'attachments'];
    return requiredSections.every(section => {
      const sectionData = applicationData[section];
      if (!sectionData) return false;

      // Check if section has meaningful data
      if (section === 'attachments') {
        return sectionData.documents && Object.keys(sectionData.documents).length > 0;
      }

      // For other sections, check if they have some filled fields
      return Object.values(sectionData).some(value => value !== null && value !== undefined && value !== '');
    });
  };

  // Helper function to find incomplete section
  const findIncompleteSection = (applicationData: any) => {
    if (!applicationData) return 1;
    const sections = [{
      key: 'institution',
      index: 1
    }, {
      key: 'programme',
      index: 2
    }, {
      key: 'faculty',
      index: 3
    }, {
      key: 'infrastructure',
      index: 4
    }, {
      key: 'financial',
      index: 5
    }, {
      key: 'attachments',
      index: 6
    }];
    for (const section of sections) {
      const sectionData = applicationData[section.key];
      if (!sectionData) return section.index;
      if (section.key === 'attachments') {
        if (!sectionData.documents || Object.keys(sectionData.documents).length === 0) {
          return section.index;
        }
      } else {
        const hasData = Object.values(sectionData).some(value => value !== null && value !== undefined && value !== '');
        if (!hasData) return section.index;
      }
    }
    return 1; // Default to first section
  };

  // Handle view button click
  const handleViewApplication = (application: any) => {
    const rawData = application.rawData;
    const applicationData = rawData?.application_data;

    // Check if application is complete
    if (isApplicationComplete(applicationData) && application.progress === 100) {
      // Show preview for completed applications
      const previewData = {
        id: rawData.id,
        applicationNumber: application.id,
        programmeType: rawData.programme_type,
        programmeName: rawData.programme_name,
        status: rawData.status,
        progress: rawData.progress_percentage || 0,
        submissionDate: new Date(rawData.submission_date).toLocaleDateString(),
        application_data: applicationData
      };
      setPreviewApplication(previewData);
      setShowPreview(true);
    } else {
      // Navigate to incomplete section for draft applications
      const incompleteSection = findIncompleteSection(applicationData);
      navigate(`/institute/application/new?section=${incompleteSection}&draft=${rawData.id}`);
      toast.info(`Redirecting to section ${incompleteSection} to complete your application`);
    }
  };

  // Handle track status button click
  const handleTrackStatus = (application: any) => {
    setSelectedApplicationForInsights(application.rawData);
    setShowInsightsModal(true);
  };

  // Handle upload documents
  const handleUploadDocuments = () => {
    setShowUploadModal(true);
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 lg:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-primary">Institute Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {institute?.institute_name || 'Loading...'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                Verified Institute
              </Badge>
              <div className="flex space-x-2 w-full sm:w-auto">
                <Button onClick={() => navigate('/institute/application/new')} className="bg-gradient-primary hover:shadow-glow flex-1 sm:flex-none" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Application
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 lg:py-8">
        {/* Quick Stats */}
        <QuickStats />

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 mt-6 lg:mt-8">
          {/* Applications Section */}
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                      <FileText className="h-5 w-5" />
                      Your Applications
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Track the status of your AICTE approval applications
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {applications.map(app => <ApplicationStatusCard key={app.id} application={app} onView={handleViewApplication} onTrack={handleTrackStatus} />)}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">Quick Actions</CardTitle>
                <CardDescription className="text-sm">Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 lg:p-6 flex flex-col items-center justify-center space-y-2" onClick={() => navigate('/institute/application/new')}>
                    <Plus className="h-5 w-5 lg:h-6 lg:w-6" />
                    <span className="text-xs lg:text-sm font-medium">New Application</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 lg:p-6 flex flex-col items-center justify-center space-y-2" onClick={handleUploadDocuments}>
                    <Upload className="h-5 w-5 lg:h-6 lg:w-6" />
                    <span className="text-xs lg:text-sm font-medium">Upload Documents</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 lg:p-6 flex flex-col items-center justify-center space-y-2" onClick={downloadApplicationForm}>
                    <Download className="h-5 w-5 lg:h-6 lg:w-6" />
                    <span className="text-xs lg:text-sm font-medium">Download Forms</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ApplicationTracker />
            
            {/* Notifications Panel */}
            <NotificationsPanel />
            
            {/* Recent Activity */}
            

            {/* Application Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">Application Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-primary/5 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Required Documents</h4>
                  <p className="text-xs text-muted-foreground">
                    Ensure all mandatory documents are uploaded before submission
                  </p>
                </div>
                <div className="p-3 bg-warning/5 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Processing Time</h4>
                  <p className="text-xs text-muted-foreground">
                    Average processing time is 2-3 days with AI assistance
                  </p>
                </div>
                <div className="p-3 bg-success/5 rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Expert Visit</h4>
                  <p className="text-xs text-muted-foreground">
                    Be prepared for virtual or physical expert evaluation
                  </p>
                </div>
                <Button variant="link" className="p-0 h-auto text-xs" onClick={viewGuidelines}>
                  View Complete Guidelines →
                </Button>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full text-sm" size="sm" onClick={downloadUserManual}>
                  Download User Manual
                </Button>
                <Button variant="outline" className="w-full text-sm" size="sm">
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full text-sm" size="sm">
                  FAQ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Application Preview Modal */}
      {previewApplication && <ApplicationPreview application={previewApplication} isOpen={showPreview} onClose={() => {
      setShowPreview(false);
      setPreviewApplication(null);
    }} />}

      {/* Infrastructure Upload Modal */}
      <InfrastructureUploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} applicationId={applications[0]?.rawData?.id} />

      {/* Application Insights Modal */}
      <ApplicationInsightsModal isOpen={showInsightsModal} onClose={() => setShowInsightsModal(false)} application={selectedApplicationForInsights} />
    </div>;
}