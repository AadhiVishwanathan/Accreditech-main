import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, UserCheck, XCircle, Loader2, Download, Filter, Users, CheckCircle } from "lucide-react";
import { useRealtimeApplications } from "@/hooks/useRealtimeApplications";
import { formatDistanceToNow } from "date-fns";
import { ApplicationDetailsModal } from "@/components/application/ApplicationDetailsModal";
import EVCAssignmentModal from "./EVCAssignmentModal";
import { AIScoreIndicator } from "./AIScoreIndicator";
import { RecalculateScoresButton } from "./RecalculateScoresButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { useState } from "react";

interface ApplicationsTableProps {
  searchTerm: string;
  statusFilter: string;
  onExport: () => void;
}

export function ApplicationsTable({ searchTerm, statusFilter, onExport }: ApplicationsTableProps) {
  const { applications, loading, error } = useRealtimeApplications();
  const [showEVCModal, setShowEVCModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.institute?.institute_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.application_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.programme_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'processing': return 'secondary';
      case 'document_review': return 'secondary';
      case 'evaluation': return 'secondary';
      default: return 'outline';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const handleApprove = async (applicationId: string, instituteUserId: string) => {
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Create notification for institute
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          title: 'Application Approved',
          message: 'Your application has been approved and expert visit has been scheduled.',
          type: 'success',
          user_id: instituteUserId,
          application_id: applicationId
        });

      if (notificationError) throw notificationError;

      toast.success('Application approved successfully');
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve application');
    }
  };

  const handleReject = async (applicationId: string, instituteUserId: string) => {
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Create notification for institute
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          title: 'Application Rejected',
          message: 'Your application has been rejected. Please review the feedback and resubmit if necessary.',
          type: 'error',
          user_id: instituteUserId,
          application_id: applicationId
        });

      if (notificationError) throw notificationError;

      toast.success('Application rejected');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const handleExportToExcel = () => {
    if (filteredApplications.length === 0) {
      toast.error('No data to export');
      return;
    }

    const exportData = filteredApplications.map(app => ({
      'Application Number': app.application_number,
      'Institute Name': app.institute?.institute_name || 'Unknown',
      'Director Name': app.institute?.director_name || 'N/A',
      'Programme Name': app.programme_name,
      'Programme Type': app.programme_type,
      'Status': app.status.toUpperCase(),
      'AI Score': app.ai_score ? `${app.ai_score}%` : 'N/A',
      'Progress': `${app.progress_percentage}%`,
      'Payment Status': app.payment_status || 'N/A',
      'Submission Date': new Date(app.submission_date).toLocaleDateString(),
      'Created At': new Date(app.created_at).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');

    // Auto-adjust column widths
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const columnWidths = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      let maxWidth = 10;
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        if (cell && cell.v) {
          const cellValue = cell.v.toString();
          maxWidth = Math.max(maxWidth, cellValue.length);
        }
      }
      columnWidths.push({ width: Math.min(maxWidth + 2, 50) });
    }
    worksheet['!cols'] = columnWidths;

    const fileName = `applications_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success(`Exported ${exportData.length} applications to ${fileName}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading applications...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-destructive">
        Error loading applications: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredApplications.length} of {applications.length} applications
          <span className="ml-2 inline-flex items-center gap-1">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            Live Updates
          </span>
        </div>
        <div className="flex items-center gap-2">
          <RecalculateScoresButton />
          <Button
            onClick={handleExportToExcel}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">Application #</th>
              <th className="text-left p-3">Institute</th>
              <th className="text-left p-3">Program</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">AI Score</th>
              <th className="text-left p-3">Progress</th>
              <th className="text-left p-3">Submitted</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr key={app.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="p-3 font-mono text-sm">{app.application_number}</td>
                <td className="p-3">
                  <div>
                    <div className="font-medium">{app.institute?.institute_name || 'Unknown Institute'}</div>
                    <div className="text-sm text-muted-foreground">{app.institute?.director_name}</div>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <div className="font-medium">{app.programme_name}</div>
                    <div className="text-sm text-muted-foreground">{app.programme_type}</div>
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant={getStatusColor(app.status)}>
                    {app.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {app.payment_status && (
                    <div className="text-xs mt-1 text-muted-foreground">
                      Payment: {app.payment_status}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <AIScoreIndicator 
                    score={app.ai_score} 
                    applicationId={app.id}
                    showRefresh={true}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${app.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{app.progress_percentage}%</span>
                  </div>
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(app.submission_date), { addSuffix: true })}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <ApplicationDetailsModal 
                      application={app}
                      trigger={
                        <Button size="sm" variant="outline" title="View Application">
                          <Eye className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Assign Expert Committee"
                      onClick={() => {
                        setSelectedApplication(app);
                        setShowEVCModal(true);
                      }}
                      disabled={app.status === 'rejected'}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Approve Application"
                      onClick={() => handleApprove(app.id, app.institute?.user_id)}
                      disabled={app.status === 'approved' || app.status === 'rejected'}
                      className="text-success hover:text-success hover:bg-success/10"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Reject Application"
                      onClick={() => handleReject(app.id, app.institute?.user_id)}
                      disabled={app.status === 'approved' || app.status === 'rejected'}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredApplications.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No applications found matching your criteria
          </div>
        )}
      </div>

      {showEVCModal && selectedApplication && (
        <EVCAssignmentModal
          isOpen={showEVCModal}
          onClose={() => {
            setShowEVCModal(false);
            setSelectedApplication(null);
          }}
          applicationId={selectedApplication.id}
          instituteName={selectedApplication.institute?.institute_name || 'Unknown Institute'}
        />
      )}
    </div>
  );
}