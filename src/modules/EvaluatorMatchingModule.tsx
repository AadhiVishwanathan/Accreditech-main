import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  Users, 
  UserCheck, 
  Clock, 
  MapPin, 
  GraduationCap, 
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EvaluatorMatchingProps {
  applicationId: string;
  programmeType: string;
}

interface EvaluatorData {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  experience_years: number;
  location: string;
  workload: number;
  max_workload: number;
  match_score?: number;
  distance?: number;
  is_available: boolean;
}

export function EvaluatorMatchingModule({ applicationId, programmeType }: EvaluatorMatchingProps) {
  const { toast } = useToast();
  const [evaluators, setEvaluators] = useState<EvaluatorData[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [selectedEvaluator, setSelectedEvaluator] = useState<string | null>(null);

  const mockEvaluators: EvaluatorData[] = [
    {
      id: '1',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@aicte.gov.in',
      expertise: ['Computer Science', 'Artificial Intelligence', 'Data Science'],
      experience_years: 15,
      location: 'Delhi',
      workload: 3,
      max_workload: 8,
      match_score: 0.95,
      distance: 150,
      is_available: true
    },
    {
      id: '2',
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@aicte.gov.in',
      expertise: ['Information Technology', 'Software Engineering', 'Database Systems'],
      experience_years: 12,
      location: 'Mumbai',
      workload: 6,
      max_workload: 10,
      match_score: 0.87,
      distance: 75,
      is_available: true
    },
    {
      id: '3',
      name: 'Prof. Amit Verma',
      email: 'amit.verma@aicte.gov.in',
      expertise: ['Electronics', 'VLSI Design', 'Computer Networks'],
      experience_years: 20,
      location: 'Bangalore',
      workload: 8,
      max_workload: 8,
      match_score: 0.72,
      distance: 200,
      is_available: false
    }
  ];

  const performEvaluatorMatching = async () => {
    setIsMatching(true);
    setMatchingProgress(0);

    try {
      // Simulate matching algorithm with progress updates
      const steps = [
        { progress: 20, message: "Loading evaluator profiles..." },
        { progress: 40, message: "Calculating expertise similarity..." },
        { progress: 60, message: "Analyzing workload distribution..." },
        { progress: 80, message: "Computing location proximity..." },
        { progress: 100, message: "Generating recommendations..." }
      ];

      for (const step of steps) {
        setMatchingProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Mock cosine similarity calculation for expertise matching
      const programmeKeywords = programmeType.toLowerCase().split(' ');
      const matchedEvaluators = mockEvaluators.map(evaluator => {
        // Calculate expertise match score using cosine similarity
        const expertiseString = evaluator.expertise.join(' ').toLowerCase();
        const matchScore = programmeKeywords.reduce((score, keyword) => {
          return expertiseString.includes(keyword) ? score + 0.3 : score;
        }, 0.4);

        // Factor in workload availability
        const workloadScore = Math.max(0, (evaluator.max_workload - evaluator.workload) / evaluator.max_workload);
        
        // Combined score
        const finalScore = (matchScore * 0.6) + (workloadScore * 0.3) + (evaluator.experience_years / 25 * 0.1);
        
        return {
          ...evaluator,
          match_score: Math.min(finalScore, 1.0)
        };
      }).sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

      setEvaluators(matchedEvaluators);

      toast({
        title: "Matching Complete",
        description: `Found ${matchedEvaluators.filter(e => e.is_available).length} available evaluators.`
      });

    } catch (error) {
      console.error('Evaluator matching error:', error);
      toast({
        title: "Matching Failed",
        description: "Error during evaluator matching process.",
        variant: "destructive"
      });
    } finally {
      setIsMatching(false);
      setMatchingProgress(0);
    }
  };

  const assignEvaluator = async (evaluatorId: string) => {
    try {
      // Update application with assigned evaluator
      await supabase
        .from('applications')
        .update({ 
          evaluator_id: evaluatorId,
          status: 'assigned_for_review',
          next_step: 'Expert Review Scheduled'
        })
        .eq('id', applicationId);

      // Update evaluator workload
      const evaluator = evaluators.find(e => e.id === evaluatorId);
      if (evaluator) {
        await supabase
          .from('evaluators')
          .update({ workload: evaluator.workload + 1 })
          .eq('id', evaluatorId);

        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: evaluator.id,
            application_id: applicationId,
            title: 'New Application Assigned',
            message: `You have been assigned to evaluate application ${applicationId}`,
            type: 'assignment'
          });
      }

      setSelectedEvaluator(evaluatorId);
      
      toast({
        title: "Evaluator Assigned",
        description: `${evaluator?.name} has been assigned to this application.`
      });

    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Assignment Failed",
        description: "Error assigning evaluator to application.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    setEvaluators(mockEvaluators);
  }, []);

  const getWorkloadPercentage = (workload: number, maxWorkload: number) => {
    return (workload / maxWorkload) * 100;
  };

  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 70) return 'text-warning';
    return 'text-success';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Evaluator Matching Module
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered assignment based on expertise, workload, and location using cosine similarity
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={performEvaluatorMatching}
            disabled={isMatching}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isMatching ? 'animate-spin' : ''}`} />
            Find Best Match
          </Button>
          <div className="text-sm text-muted-foreground">
            Programme: <span className="font-medium">{programmeType}</span>
          </div>
        </div>

        {isMatching && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Matching Evaluators...</span>
              <span>{matchingProgress}%</span>
            </div>
            <Progress value={matchingProgress} className="h-2" />
          </div>
        )}

        <div className="space-y-3">
          {evaluators.map((evaluator) => {
            const workloadPercentage = getWorkloadPercentage(evaluator.workload, evaluator.max_workload);
            const workloadColor = getWorkloadColor(workloadPercentage);
            
            return (
              <div key={evaluator.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserCheck className={`h-5 w-5 ${evaluator.is_available ? 'text-success' : 'text-muted-foreground'}`} />
                    <div>
                      <h4 className="font-medium">{evaluator.name}</h4>
                      <p className="text-sm text-muted-foreground">{evaluator.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {evaluator.match_score && (
                      <Badge variant="outline">
                        {(evaluator.match_score * 100).toFixed(0)}% match
                      </Badge>
                    )}
                    <Badge variant={evaluator.is_available ? 'default' : 'secondary'}>
                      {evaluator.is_available ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      <span className="font-medium">Experience</span>
                    </div>
                    <p className="text-muted-foreground">{evaluator.experience_years} years</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Location</span>
                    </div>
                    <p className="text-muted-foreground">
                      {evaluator.location}
                      {evaluator.distance && ` (${evaluator.distance}km)`}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Workload</span>
                    </div>
                    <p className={workloadColor}>
                      {evaluator.workload}/{evaluator.max_workload} ({workloadPercentage.toFixed(0)}%)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-sm">Expertise Areas:</p>
                  <div className="flex flex-wrap gap-1">
                    {evaluator.expertise.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    disabled={!evaluator.is_available || selectedEvaluator === evaluator.id}
                    onClick={() => assignEvaluator(evaluator.id)}
                  >
                    {selectedEvaluator === evaluator.id ? 'Assigned' : 'Assign Evaluator'}
                  </Button>
                  {evaluator.match_score && evaluator.match_score > 0.8 && (
                    <Badge variant="outline" className="text-success">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Best Match
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">Matching Algorithm</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">Expertise Matching (60%)</p>
              <p className="text-muted-foreground">Cosine similarity with programme requirements</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Workload Balancing (30%)</p>
              <p className="text-muted-foreground">Distribute assignments evenly</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Experience Factor (10%)</p>
              <p className="text-muted-foreground">Consider years of evaluation experience</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Location Proximity</p>
              <p className="text-muted-foreground">Optimize for site visit convenience</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}