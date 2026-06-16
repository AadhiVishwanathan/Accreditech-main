import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, FileText, CheckCircle, AlertTriangle, LogOut, User, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";

interface EvaluatorProfile {
  id: string;
  name: string;
  email: string;
  location?: string;
  expertise: string[];
  experience_years?: number;
  workload: number;
  max_workload: number;
}

interface Application {
  id: string;
  application_number: string;
  institute_name: string;
  programme_type: string;
  programme_name: string;
  status: string;
  submission_date: string;
}

export default function EvaluatorDashboard() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  
  const [evaluatorProfile, setEvaluatorProfile] = useState<EvaluatorProfile | null>(null);
  const [assignedApplications, setAssignedApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEvaluatorData();
    }
  }, [user]);

  const fetchEvaluatorData = async () => {
    try {
      setLoading(true);
      
      // Fetch evaluator profile
      const { data: evaluator, error: evaluatorError } = await supabase
        .from('evaluators')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (evaluatorError) {
        console.error('Error fetching evaluator profile:', evaluatorError);
        toast({
          title: "Error",
          description: "Failed to load evaluator profile",
          variant: "destructive"
        });
        return;
      }

      setEvaluatorProfile(evaluator);

      // Fetch assigned applications
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          id,
          application_number,
          programme_type,
          programme_name,
          status,
          submission_date,
          institutes!inner(institute_name)
        `)
        .eq('evaluator_id', evaluator.id)
        .order('submission_date', { ascending: false });

      if (applicationsError) {
        console.error('Error fetching assigned applications:', applicationsError);
      } else {
        const formattedApplications = applications?.map(app => ({
          ...app,
          institute_name: (app.institutes as any)?.institute_name || 'Unknown Institute'
        })) || [];
        setAssignedApplications(formattedApplications);
      }

    } catch (error) {
      console.error('Error fetching evaluator data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the evaluator portal"
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const dashboardStats = [
    {
      title: "Assigned Applications",
      value: assignedApplications.length.toString(),
      icon: FileText,
      color: "text-primary"
    },
    {
      title: "Pending Reviews",
      value: assignedApplications.filter(app => app.status === 'under_review').length.toString(),
      icon: Clock,
      color: "text-warning"
    },
    {
      title: "Completed Reviews",
      value: assignedApplications.filter(app => ['approved', 'rejected'].includes(app.status)).length.toString(),
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "Workload",
      value: evaluatorProfile ? `${evaluatorProfile.workload}/${evaluatorProfile.max_workload}` : "0/0",
      icon: AlertTriangle,
      color: "text-info"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!evaluatorProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-warning mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have evaluator privileges or your profile is not set up properly.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Evaluator Dashboard</h1>
              <p className="text-sm text-muted-foreground">AICTE Application Evaluation Portal</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Live Updates Active</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{evaluatorProfile.name}</p>
                <p className="text-xs text-muted-foreground">Evaluator</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Evaluator Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Contact Information</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Email:</strong> {evaluatorProfile.email}
                </p>
                {evaluatorProfile.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {evaluatorProfile.location}
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Experience</h4>
                {evaluatorProfile.experience_years && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {evaluatorProfile.experience_years} years of experience
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Expertise Areas</h4>
                <div className="flex flex-wrap gap-1">
                  {evaluatorProfile.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="applications">Assigned Applications</TabsTrigger>
            <TabsTrigger value="reports">Evaluation Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Assigned Applications
                </CardTitle>
                <CardDescription>
                  Review and evaluate applications assigned to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignedApplications.length > 0 ? (
                  <div className="space-y-4">
                    {assignedApplications.map((app) => (
                      <Card key={app.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{app.application_number}</p>
                              <p className="text-sm text-muted-foreground">{app.institute_name}</p>
                              <p className="text-sm">{app.programme_name}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                                {app.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(app.submission_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No applications assigned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Evaluation Reports
                </CardTitle>
                <CardDescription>
                  View and manage your evaluation reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Evaluation reports feature coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}