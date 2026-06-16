import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, Clock, CheckCircle, XCircle, Search, Filter, BarChart3, TrendingUp, AlertTriangle, Eye, UserCheck, LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { InsightsPanel } from "@/components/admin/InsightsPanel";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeStats } from "@/hooks/useRealtimeStats";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import TestNotificationButton from "@/components/admin/TestNotificationButton";

import CreateEvaluatorsDropdown from "@/components/admin/CreateEvaluatorsDropdown";
import EvaluatorManagementModal from "@/components/admin/EvaluatorManagementModal";
import { EvaluatorMatchingModule } from "@/modules/EvaluatorMatchingModule";
import { toast } from "sonner";
export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    signOut
  } = useAuth();
  const {
    stats,
    loading: statsLoading
  } = useRealtimeStats();
  const {
    unreadCount
  } = useRealtimeNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };
  const dashboardStats = [{
    title: "Total Applications",
    value: statsLoading ? "..." : stats.totalApplications.toLocaleString(),
    change: "+12.5%",
    icon: Building2,
    color: "text-primary"
  }, {
    title: "Approved Today",
    value: statsLoading ? "..." : stats.approvedToday.toString(),
    change: "+8.2%",
    icon: CheckCircle,
    color: "text-success"
  }, {
    title: "Rejected Today",
    value: statsLoading ? "..." : stats.rejectedToday.toString(),
    change: "-15.3%",
    icon: XCircle,
    color: "text-destructive"
  }, {
    title: "Avg Processing Time",
    value: statsLoading ? "..." : stats.avgProcessingTime,
    change: "-25%",
    icon: Clock,
    color: "text-warning"
  }];
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">AICTE Approval Process Management</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Live Updates Active</span>
              </div>
            </div>
            
            {/* Mobile-first button layout */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
              <div className="hidden sm:flex">
                <Badge variant="secondary" className="bg-primary/10 text-primary whitespace-nowrap">
                  AI Processing Active
                </Badge>
              </div>
              
              {/* Top row on mobile, inline on desktop */}
              <div className="flex gap-2 flex-wrap">
                <TestNotificationButton />
                <CreateEvaluatorsDropdown />
              </div>
              
              {/* Bottom row on mobile, inline on desktop */}
              <div className="flex gap-2 flex-wrap">
                <EvaluatorManagementModal
                  trigger={
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Manage Evaluators</span>
                      <span className="sm:hidden">Evaluators</span>
                    </Button>
                  }
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-1 sm:flex-initial"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => <Card key={index} className="hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className={stat.change.startsWith('+') ? 'text-success' : 'text-destructive'}>
                        {stat.change}
                      </span> from last month
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>)}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="applications" className="text-xs sm:text-sm">Applications</TabsTrigger>
            <TabsTrigger value="evaluators" className="text-xs sm:text-sm">Evaluator</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm">Insights</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Application Management
                </CardTitle>
                <CardDescription>
                  Review, approve, or reject institute applications with AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by institute name, ID, or program..." 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                      className="pl-10 text-sm" 
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                      Export
                    </Button>
                  </div>
                </div>

                <ApplicationsTable searchTerm={searchTerm} statusFilter={statusFilter} onExport={() => {}} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evaluators" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Evaluator Assignment
                </CardTitle>
                <CardDescription>
                  AI-powered evaluator matching based on expertise, workload, and location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EvaluatorMatchingModule applicationId="sample-app-001" programmeType="Computer Science & Engineering" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <InsightsPanel />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <StatsOverview />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{statsLoading ? "..." : stats.pendingReviews}</p>
              <p className="text-sm text-muted-foreground">Applications awaiting review</p>
              <Button className="w-full mt-4" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Review Now
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="h-5 w-5 text-primary" />
                Expert Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{statsLoading ? "..." : stats.expertAssignments}</p>
              <p className="text-sm text-muted-foreground">Expert visits to schedule</p>
              <Button className="w-full mt-4" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Assign Experts
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-elegant transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-success" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">{statsLoading ? "..." : stats.processingEfficiency}%</p>
              <p className="text-sm text-muted-foreground">Processing efficiency</p>
              <Button className="w-full mt-4" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>;
}