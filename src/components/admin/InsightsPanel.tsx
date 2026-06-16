import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown, Zap, Clock } from "lucide-react";
import { useRealtimeApplications } from "@/hooks/useRealtimeApplications";
import { calculateAICTECompliance } from "@/utils/aiInsights";
import { useEffect, useState, useMemo } from "react";

export function InsightsPanel() {
  const { applications, loading } = useRealtimeApplications();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  // Update timestamp when applications change
  useEffect(() => {
    if (!loading && applications.length > 0) {
      setLastUpdated(new Date());
    }
  }, [applications, loading]);

  // Calculate analysis results with memoization for performance
  const analysisResults = useMemo(() => {
    if (loading || applications.length === 0) return [];
    
    setIsAnalyzing(true);
    const results = applications.map(app => ({
      ...app,
      analysis: calculateAICTECompliance(app)
    }));
    
    // Simulate brief analysis time for visual feedback
    setTimeout(() => setIsAnalyzing(false), 300);
    
    return results;
  }, [applications, loading]);

  const averageScore = useMemo(() => {
    return analysisResults.length > 0 
      ? analysisResults.reduce((sum, app) => sum + app.analysis.overallScore, 0) / analysisResults.length 
      : 0;
  }, [analysisResults]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            AI Insights
            <Badge variant="outline" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              Loading...
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p className="text-muted-foreground">Analyzing applications in real-time...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className={`h-5 w-5 ${isAnalyzing ? 'animate-pulse text-primary' : ''}`} />
          AI Insights
          <Badge variant="outline" className="ml-auto">
            <Zap className="h-3 w-3 mr-1 text-green-500" />
            Real-time
          </Badge>
        </CardTitle>
        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="text-sm text-muted-foreground">
            Average Compliance Score: 
            <span className={`ml-1 font-semibold ${getScoreColor(averageScore)}`}>
              {averageScore.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {analysisResults.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No applications to analyze</p>
            <p className="text-sm">New applications will appear here automatically</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {analysisResults.map((app) => (
              <Card key={app.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{app.application_number}</h4>
                    <p className="text-sm text-muted-foreground">{app.institute?.institute_name}</p>
                  </div>
                  <Badge variant={getScoreBadgeVariant(app.analysis.overallScore)}>
                    {app.analysis.overallScore.toFixed(1)}% Compliant
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Compliance</span>
                      <span className={getScoreColor(app.analysis.overallScore)}>
                        {app.analysis.overallScore.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={app.analysis.overallScore} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="font-medium">Strengths</span>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {app.analysis.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                        <span className="font-medium">Areas for Improvement</span>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {app.analysis.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <TrendingDown className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="font-medium">Faculty Score</div>
                      <div className={getScoreColor(app.analysis.facultyScore)}>
                        {app.analysis.facultyScore.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="font-medium">Infrastructure</div>
                      <div className={getScoreColor(app.analysis.infrastructureScore)}>
                        {app.analysis.infrastructureScore.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded">
                      <div className="font-medium">Equipment</div>
                      <div className={getScoreColor(app.analysis.equipmentScore)}>
                        {app.analysis.equipmentScore.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}