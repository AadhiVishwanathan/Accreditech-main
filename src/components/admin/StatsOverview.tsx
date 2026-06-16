import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, Target, AlertCircle } from "lucide-react";
import { useRealtimeApplications } from "@/hooks/useRealtimeApplications";
import { calculateAICTECompliance } from "@/utils/aiInsights";

export function StatsOverview() {
  const { applications, loading } = useRealtimeApplications();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            System Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate analytics from applications
  const analysisResults = applications.map(app => ({
    ...app,
    analysis: calculateAICTECompliance(app)
  }));

  const totalApplications = analysisResults.length;
  const highCompliance = analysisResults.filter(app => app.analysis.overallScore >= 80).length;
  const mediumCompliance = analysisResults.filter(app => app.analysis.overallScore >= 60 && app.analysis.overallScore < 80).length;
  const lowCompliance = analysisResults.filter(app => app.analysis.overallScore < 60).length;

  const avgFacultyScore = totalApplications > 0 
    ? analysisResults.reduce((sum, app) => sum + app.analysis.facultyScore, 0) / totalApplications 
    : 0;
  const avgInfraScore = totalApplications > 0 
    ? analysisResults.reduce((sum, app) => sum + app.analysis.infrastructureScore, 0) / totalApplications 
    : 0;
  const avgEquipmentScore = totalApplications > 0 
    ? analysisResults.reduce((sum, app) => sum + app.analysis.equipmentScore, 0) / totalApplications 
    : 0;

  // Common compliance issues
  const commonIssues = analysisResults.reduce((issues, app) => {
    app.analysis.weaknesses.forEach(weakness => {
      issues[weakness] = (issues[weakness] || 0) + 1;
    });
    return issues;
  }, {} as Record<string, number>);

  const topIssues = Object.entries(commonIssues)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          System Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Compliance Distribution */}
        <div>
          <h4 className="font-semibold mb-3">AICTE Compliance Distribution</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{highCompliance}</div>
              <div className="text-sm text-muted-foreground">High Compliance</div>
              <div className="text-xs text-muted-foreground">(≥80%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{mediumCompliance}</div>
              <div className="text-sm text-muted-foreground">Medium Compliance</div>
              <div className="text-xs text-muted-foreground">(60-79%)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{lowCompliance}</div>
              <div className="text-sm text-muted-foreground">Low Compliance</div>
              <div className="text-xs text-muted-foreground">(&lt;60%)</div>
            </div>
          </div>
        </div>

        {/* Average Scores by Category */}
        <div>
          <h4 className="font-semibold mb-3">Average Compliance Scores</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Faculty Compliance</span>
                <span className={avgFacultyScore >= 80 ? "text-green-600" : avgFacultyScore >= 60 ? "text-yellow-600" : "text-red-600"}>
                  {avgFacultyScore.toFixed(1)}%
                </span>
              </div>
              <Progress value={avgFacultyScore} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Infrastructure Compliance</span>
                <span className={avgInfraScore >= 80 ? "text-green-600" : avgInfraScore >= 60 ? "text-yellow-600" : "text-red-600"}>
                  {avgInfraScore.toFixed(1)}%
                </span>
              </div>
              <Progress value={avgInfraScore} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Equipment Compliance</span>
                <span className={avgEquipmentScore >= 80 ? "text-green-600" : avgEquipmentScore >= 60 ? "text-yellow-600" : "text-red-600"}>
                  {avgEquipmentScore.toFixed(1)}%
                </span>
              </div>
              <Progress value={avgEquipmentScore} className="h-2" />
            </div>
          </div>
        </div>

        {/* Top Compliance Issues */}
        {topIssues.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Most Common Issues
            </h4>
            <div className="space-y-2">
              {topIssues.map(([issue, count]) => (
                <div key={issue} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-sm">{issue}</span>
                  <Badge variant="outline">{count} apps</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Trends */}
        <div>
          <h4 className="font-semibold mb-3">Performance Indicators</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded">
              <Target className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium">AICTE Standards Met</div>
                <div className="text-xs text-muted-foreground">
                  {totalApplications > 0 ? ((highCompliance / totalApplications) * 100).toFixed(1) : 0}% of applications
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">Quality Score</div>
                <div className="text-xs text-muted-foreground">
                  {((avgFacultyScore + avgInfraScore + avgEquipmentScore) / 3).toFixed(1)}% average
                </div>
              </div>
            </div>
          </div>
        </div>

        {totalApplications === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No applications available for analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}