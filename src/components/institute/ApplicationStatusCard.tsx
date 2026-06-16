import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Application {
  id: string;
  program: string;
  submittedDate: string;
  status: string;
  progress: number;
  nextStep: string;
  aiScore: number;
  applicationData?: any;
  rawData?: any; // Add raw data from database
}

interface ApplicationStatusCardProps {
  application: Application;
  onView: (application: Application) => void;
  onTrack?: (application: Application) => void;
}

export function ApplicationStatusCard({ application, onView, onTrack }: ApplicationStatusCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">{application.program}</h3>
            <p className="text-sm text-muted-foreground">ID: {application.id}</p>
          </div>
          <Badge variant={application.status === "submitted" ? "default" : "secondary"}>
            {application.status}
          </Badge>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{application.progress}%</span>
            </div>
            <Progress value={application.progress} className="h-2" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Next: {application.nextStep}</span>
            <div className="flex gap-2">
              {onTrack && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onTrack(application)}
                  className="text-primary hover:text-primary-glow"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onView(application)}
              >
                View
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}