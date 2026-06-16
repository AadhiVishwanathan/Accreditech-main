import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  Building, 
  Monitor,
  FileText,
  Eye,
  Download
} from "lucide-react";
import { calculateAICTECompliance, type AICTEAnalysis } from "@/utils/aiInsights";

interface ApplicationInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

export function ApplicationInsightsModal({ isOpen, onClose, application }: ApplicationInsightsModalProps) {
  const [insights, setInsights] = useState<AICTEAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && application) {
      setLoading(true);
      // Calculate insights
      const analysisResults = calculateAICTECompliance(application);
      setInsights(analysisResults);
      setLoading(false);
    }
  }, [isOpen, application]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (loading || !insights) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Application Analysis & Insights
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            AI-powered compliance analysis based on AICTE norms
          </p>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="faculty">Faculty Analysis</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Score Card */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Overall AICTE Compliance Score</span>
                  <Badge variant={getScoreBadgeVariant(insights.overallScore)} className="text-lg px-3 py-1">
                    {insights.overallScore.toFixed(1)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={insights.overallScore} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  {insights.overallScore >= 80 ? "Excellent compliance with AICTE norms" :
                   insights.overallScore >= 60 ? "Good compliance with scope for improvement" :
                   "Requires significant improvements to meet AICTE standards"}
                </p>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4" />
                    Faculty Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${getScoreColor(insights.facultyScore)}`}>
                      {insights.facultyScore.toFixed(1)}%
                    </span>
                    {insights.facultyScore >= 70 ? 
                      <CheckCircle className="h-5 w-5 text-success" /> : 
                      <AlertCircle className="h-5 w-5 text-warning" />
                    }
                  </div>
                  <Progress value={insights.facultyScore} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Faculty-student ratio, qualifications, and cadre compliance
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building className="h-4 w-4" />
                    Infrastructure Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${getScoreColor(insights.infrastructureScore)}`}>
                      {insights.infrastructureScore.toFixed(1)}%
                    </span>
                    {insights.infrastructureScore >= 70 ? 
                      <CheckCircle className="h-5 w-5 text-success" /> : 
                      <AlertCircle className="h-5 w-5 text-warning" />
                    }
                  </div>
                  <Progress value={insights.infrastructureScore} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Land area, built-up area, classrooms, and laboratory facilities
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Monitor className="h-4 w-4" />
                    Equipment Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${getScoreColor(insights.equipmentScore)}`}>
                      {insights.equipmentScore.toFixed(1)}%
                    </span>
                    {insights.equipmentScore >= 70 ? 
                      <CheckCircle className="h-5 w-5 text-success" /> : 
                      <AlertCircle className="h-5 w-5 text-warning" />
                    }
                  </div>
                  <Progress value={insights.equipmentScore} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Computing infrastructure, laboratory equipment, and resources
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-success/20 bg-success/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <TrendingUp className="h-4 w-4" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-warning/20 bg-warning/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <TrendingDown className="h-4 w-4" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {insights.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="faculty" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Faculty Analysis Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Faculty-Student Ratio</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      AICTE Requirement: 1:15 for Engineering & Technology
                    </p>
                    <Progress value={insights.facultyScore} className="h-2" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Cadre Distribution</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Required Ratio: 1 Professor : 2 Associate : 6 Assistant
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Professors</span>
                        <span>Check compliance</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Associate Professors</span>
                        <span>Check compliance</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Assistant Professors</span>
                        <span>Check compliance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure Analysis Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Land & Building</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Land Area (min 5000 sq m)</span>
                        <Badge variant="outline">Verify</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Built-up Area (min 3000 sq m)</span>
                        <Badge variant="outline">Verify</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Facilities</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Classrooms (min 6)</span>
                        <Badge variant="outline">Verify</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Laboratories (min 8)</span>
                        <Badge variant="outline">Verify</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  AI-Generated Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {insights.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Close Analysis
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button className="bg-gradient-primary">
              <Eye className="h-4 w-4 mr-2" />
              View Full Application
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}