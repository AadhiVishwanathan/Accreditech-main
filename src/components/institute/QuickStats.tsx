import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function QuickStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: "Total Applications", value: "0", icon: FileText, color: "text-primary" },
    { label: "In Progress", value: "0", icon: Clock, color: "text-warning" },
    { label: "Approved", value: "0", icon: CheckCircle, color: "text-success" },
    { label: "Pending Action", value: "0", icon: AlertCircle, color: "text-destructive" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const { data: instituteData } = await supabase
          .from('institutes')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!instituteData) return;

        const { data: applications } = await supabase
          .from('applications')
          .select('status')
          .eq('institute_id', instituteData.id);

        if (!applications) return;

        const total = applications.length;
        const approved = applications.filter(app => app.status === 'approved').length;
        const inProgress = applications.filter(app => 
          ['submitted', 'under_review', 'document_review'].includes(app.status)
        ).length;
        const pendingAction = applications.filter(app => 
          app.status === 'pending_action'
        ).length;

        setStats([
          { label: "Total Applications", value: total.toString(), icon: FileText, color: "text-primary" },
          { label: "In Progress", value: inProgress.toString(), icon: Clock, color: "text-warning" },
          { label: "Approved", value: approved.toString(), icon: CheckCircle, color: "text-success" },
          { label: "Pending Action", value: pendingAction.toString(), icon: AlertCircle, color: "text-destructive" },
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();

    // Set up real-time subscription
    const channel = supabase
      .channel('applications-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4 text-center">
            <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}