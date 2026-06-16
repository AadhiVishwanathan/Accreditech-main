import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  FileText, 
  Clock,
  Download,
  Calendar
} from "lucide-react";

export function DashboardReportingModule() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const stats = {
    totalApplications: 1847,
    approvedToday: 67,
    processingTime: 2.3,
    evaluatorWorkload: 85
  };

  const applicationsByStatus = [
    { status: 'Submitted', count: 234, color: 'bg-blue-500' },
    { status: 'In Review', count: 156, color: 'bg-yellow-500' },
    { status: 'Approved', count: 892, color: 'bg-green-500' },
    { status: 'Rejected', count: 89, color: 'bg-red-500' }
  ];

  const monthlyTrends = [
    { month: 'Jan', applications: 120, approvals: 95 },
    { month: 'Feb', applications: 145, approvals: 118 },
    { month: 'Mar', applications: 167, approvals: 142 },
    { month: 'Apr', applications: 189, approvals: 156 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Dashboard and Reporting Module
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visual progress charts, analytics, and comprehensive reporting for all user types
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalApplications}</p>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">{stats.approvedToday}</p>
              <p className="text-sm text-muted-foreground">Approved Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold">{stats.processingTime}d</p>
              <p className="text-sm text-muted-foreground">Avg Processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-info" />
              <p className="text-2xl font-bold">{stats.evaluatorWorkload}%</p>
              <p className="text-sm text-muted-foreground">Evaluator Load</p>
            </CardContent>
          </Card>
        </div>

        {/* Application Status Distribution */}
        <div className="space-y-4">
          <h4 className="font-medium">Application Status Distribution</h4>
          <div className="space-y-3">
            {applicationsByStatus.map((item) => (
              <div key={item.status} className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded ${item.color}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{item.status}</span>
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                  </div>
                  <Progress 
                    value={(item.count / stats.totalApplications) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Monthly Trends</h4>
            <div className="flex gap-2">
              {['week', 'month', 'quarter'].map((period) => (
                <Button
                  key={period}
                  size="sm"
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {monthlyTrends.map((trend) => (
              <Card key={trend.month}>
                <CardContent className="p-4 text-center">
                  <p className="font-medium">{trend.month}</p>
                  <p className="text-lg font-bold text-primary">{trend.applications}</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <Badge variant="outline" className="mt-1">
                    {Math.round((trend.approvals / trend.applications) * 100)}% approved
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </Button>
          <Button size="sm" variant="outline">
            <Calendar className="h-4 w-4 mr-1" />
            Schedule Report
          </Button>
          <Button size="sm" variant="outline">
            <PieChart className="h-4 w-4 mr-1" />
            Detailed Analytics
          </Button>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Reporting Features</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">Visual Charts</p>
              <p className="text-muted-foreground">Interactive progress visualization</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Summary Cards</p>
              <p className="text-muted-foreground">Key metrics at a glance</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Workload Views</p>
              <p className="text-muted-foreground">Evaluator capacity management</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Admin Insights</p>
              <p className="text-muted-foreground">System performance analytics</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}