import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  GitBranch, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight, 
  History,
  Calendar,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WorkflowManagementProps {
  applicationId: string;
}

interface WorkflowStep {
  id: string;
  step_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  deadline?: string;
  assigned_to?: string;
  completed_at?: string;
  comments?: string;
  is_current: boolean;
}

interface AuditLogEntry {
  id: string;
  from_status?: string;
  to_status: string;
  changed_by: string;
  changed_at: string;
  comments?: string;
  metadata?: any;
}

export function WorkflowManagementModule({ applicationId }: WorkflowManagementProps) {
  const { toast } = useToast();
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mockWorkflowSteps: WorkflowStep[] = [
    {
      id: '1',
      step_name: 'Application Submission',
      status: 'completed',
      deadline: '2024-09-01T00:00:00Z',
      completed_at: '2024-08-30T14:30:00Z',
      comments: 'All required documents submitted',
      is_current: false
    },
    {
      id: '2', 
      step_name: 'Document Verification',
      status: 'completed',
      deadline: '2024-09-05T00:00:00Z',
      assigned_to: 'AI System',
      completed_at: '2024-09-02T10:15:00Z',
      comments: 'OCR verification completed with 92% confidence',
      is_current: false
    },
    {
      id: '3',
      step_name: 'Infrastructure Validation',
      status: 'in_progress',
      deadline: '2024-09-25T00:00:00Z',
      assigned_to: 'Dr. Rajesh Kumar',
      comments: 'Image analysis in progress',
      is_current: true
    },
    {
      id: '4',
      step_name: 'Expert Review',
      status: 'pending',
      deadline: '2024-10-05T00:00:00Z',
      is_current: false
    },
    {
      id: '5',
      step_name: 'Final Approval',
      status: 'pending',
      deadline: '2024-10-15T00:00:00Z',
      is_current: false
    }
  ];

  const mockAuditLog: AuditLogEntry[] = [
    {
      id: '1',
      from_status: null,
      to_status: 'submitted',
      changed_by: 'Tech Institute of Excellence',
      changed_at: '2024-08-30T14:30:00Z',
      comments: 'Initial application submission'
    },
    {
      id: '2',
      from_status: 'submitted',
      to_status: 'document_verification',
      changed_by: 'AI System',
      changed_at: '2024-08-30T15:00:00Z',
      comments: 'Automatic transition to document verification'
    },
    {
      id: '3',
      from_status: 'document_verification',
      to_status: 'infrastructure_validation',
      changed_by: 'Dr. Priya Sharma',
      changed_at: '2024-09-02T10:15:00Z',
      comments: 'Documents verified successfully'
    }
  ];

  const transitionToNextStep = async (currentStepId: string, nextStatus: string) => {
    setIsLoading(true);
    
    try {
      const currentStep = workflowSteps.find(step => step.id === currentStepId);
      
      // Create workflow log entry
      await supabase
        .from('application_workflow')
        .insert({
          application_id: applicationId,
          from_status: currentStep?.step_name,
          to_status: nextStatus,
          changed_by: 'current_user_id', // Replace with actual user ID
          comments: `Transition from ${currentStep?.step_name} to ${nextStatus}`
        });

      // Update application status
      await supabase
        .from('applications')
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      // Update local state
      const updatedSteps = workflowSteps.map(step => {
        if (step.id === currentStepId) {
          return {
            ...step,
            status: 'completed' as const,
            completed_at: new Date().toISOString(),
            is_current: false
          };
        }
        // Set next step as current
        const stepIndex = workflowSteps.findIndex(s => s.id === step.id);
        const currentIndex = workflowSteps.findIndex(s => s.id === currentStepId);
        if (stepIndex === currentIndex + 1) {
          return {
            ...step,
            status: 'in_progress' as const,
            is_current: true
          };
        }
        return step;
      });

      setWorkflowSteps(updatedSteps);

      toast({
        title: "Workflow Updated",
        description: `Application moved to ${nextStatus} stage.`
      });

    } catch (error) {
      console.error('Workflow transition error:', error);
      toast({
        title: "Transition Failed",
        description: "Error updating workflow status.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
    return (completedSteps / workflowSteps.length) * 100;
  };

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'in_progress': return 'text-primary';
      case 'rejected': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Clock;
      case 'rejected': return AlertCircle;
      default: return Clock;
    }
  };

  useEffect(() => {
    setWorkflowSteps(mockWorkflowSteps);
    setAuditLog(mockAuditLog);
  }, [applicationId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Workflow Management Module
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage application lifecycle with state transitions, deadlines, and audit trails
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span>{calculateProgress().toFixed(0)}% Complete</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4">
          <h4 className="font-medium">Application Workflow</h4>
          <div className="space-y-3">
            {workflowSteps.map((step, index) => {
              const StepIcon = getStepIcon(step.status);
              const daysUntilDeadline = getDaysUntilDeadline(step.deadline);
              const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0;
              
              return (
                <div key={step.id} className={`border rounded-lg p-4 ${step.is_current ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <StepIcon className={`h-5 w-5 ${getStepStatusColor(step.status)}`} />
                      <div>
                        <h5 className="font-medium">{step.step_name}</h5>
                        {step.assigned_to && (
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {step.assigned_to}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        step.status === 'completed' ? 'default' :
                        step.status === 'in_progress' ? 'secondary' :
                        step.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {step.status.replace('_', ' ')}
                      </Badge>
                      {step.is_current && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          Current
                        </Badge>
                      )}
                    </div>
                  </div>

                  {step.deadline && (
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Deadline: {new Date(step.deadline).toLocaleDateString()}
                        {daysUntilDeadline !== null && (
                          <span className={`ml-2 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                            ({isOverdue ? `${Math.abs(daysUntilDeadline)} days overdue` : `${daysUntilDeadline} days remaining`})
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {step.comments && (
                    <p className="text-sm text-muted-foreground mb-3">{step.comments}</p>
                  )}

                  {step.completed_at && (
                    <p className="text-xs text-muted-foreground">
                      Completed: {new Date(step.completed_at).toLocaleString()}
                    </p>
                  )}

                  {step.is_current && step.status === 'in_progress' && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button 
                        size="sm"
                        onClick={() => transitionToNextStep(step.id, 'completed')}
                        disabled={isLoading}
                      >
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Complete Step
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => transitionToNextStep(step.id, 'requires_revision')}
                        disabled={isLoading}
                      >
                        Request Revision
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Trail */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <History className="h-4 w-4" />
            Audit Trail
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {auditLog.map((entry) => (
              <div key={entry.id} className="border-l-2 border-muted pl-4 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {entry.from_status ? `${entry.from_status} → ${entry.to_status}` : entry.to_status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.changed_at).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">By: {entry.changed_by}</p>
                {entry.comments && (
                  <p className="text-xs text-muted-foreground mt-1">{entry.comments}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">Workflow Features</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">State Transitions</p>
              <p className="text-muted-foreground">Automated workflow progression</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Deadline Tracking</p>
              <p className="text-muted-foreground">Monitor due dates and overdue items</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Audit Logging</p>
              <p className="text-muted-foreground">Complete history of all changes</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Revision Handling</p>
              <p className="text-muted-foreground">Request and track revisions</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}