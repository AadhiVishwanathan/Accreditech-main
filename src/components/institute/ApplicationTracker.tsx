import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Application {
  id: string;
  application_number: string;
  programme_type: string;
  programme_name: string;
  status: string;
  progress_percentage: number;
  submission_date: string;
  next_step: string;
}

export function ApplicationTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);

  const searchApplication = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter an application number");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('application_number', searchTerm.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error("Application not found");
          setApplication(null);
        } else {
          throw error;
        }
      } else {
        setApplication(data);
        toast.success("Application found");
      }
    } catch (error) {
      console.error('Error searching application:', error);
      toast.error("Error searching application");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'under_review':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'draft':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return <FileText className="h-4 w-4" />;
      case 'under_review':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Application Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder="Enter application number (e.g., APP-2025-001)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchApplication()}
          />
          <Button onClick={searchApplication} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {application && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{application.application_number}</h3>
                  <p className="text-sm text-muted-foreground">
                    {application.programme_type} - {application.programme_name}
                  </p>
                </div>
                <Badge className={getStatusColor(application.status)}>
                  {getStatusIcon(application.status)}
                  <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Application Progress</span>
                    <span>{application.progress_percentage}% Complete</span>
                  </div>
                  <Progress value={application.progress_percentage} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">Submission Date</label>
                    <p>{new Date(application.submission_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Next Step</label>
                    <p>{application.next_step || 'Under review'}</p>
                  </div>
                </div>

                {application.status === 'submitted' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Status Update:</strong> Your application has been submitted successfully 
                      and is currently under review by our evaluation team.
                    </p>
                  </div>
                )}

                {application.status === 'under_review' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Status Update:</strong> Your application is currently being reviewed. 
                      You will be notified of any updates via email.
                    </p>
                  </div>
                )}

                {application.status === 'approved' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Congratulations!</strong> Your application has been approved. 
                      Check your email for next steps.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!application && searchTerm && !loading && (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No application found with this number</p>
            <p className="text-sm">Please check the application number and try again</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}