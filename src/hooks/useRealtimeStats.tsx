import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalApplications: number;
  approvedToday: number;
  rejectedToday: number;
  pendingReviews: number;
  avgProcessingTime: string;
  processingEfficiency: number;
  expertAssignments: number;
}

export function useRealtimeStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    approvedToday: 0,
    rejectedToday: 0,
    pendingReviews: 0,
    avgProcessingTime: '0 Days',
    processingEfficiency: 0,
    expertAssignments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Total applications
      const { count: totalApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });

      // Approved today
      const { count: approvedToday } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('updated_at', today);

      // Rejected today
      const { count: rejectedToday } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected')
        .gte('updated_at', today);

      // Pending reviews
      const { count: pendingReviews } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .in('status', ['submitted', 'document_review', 'processing']);

      // Expert assignments (applications assigned to evaluators)
      const { count: expertAssignments } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .not('evaluator_id', 'is', null)
        .eq('status', 'evaluation');

      // Calculate processing efficiency (approved vs total submitted)
      const { count: totalSubmitted } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'draft');

      const { count: totalApproved } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      const processingEfficiency = totalSubmitted > 0 
        ? Math.round((totalApproved / totalSubmitted) * 100) 
        : 0;

      // Calculate average processing time (simplified - days from submission to approval)
      const { data: approvedApps } = await supabase
        .from('applications')
        .select('submission_date, updated_at')
        .eq('status', 'approved')
        .limit(100);

      let avgProcessingTime = '0 Days';
      if (approvedApps && approvedApps.length > 0) {
        const totalDays = approvedApps.reduce((acc, app) => {
          const submissionDate = new Date(app.submission_date);
          const approvalDate = new Date(app.updated_at);
          const days = Math.ceil((approvalDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
          return acc + days;
        }, 0);
        const avgDays = Math.round(totalDays / approvedApps.length * 10) / 10;
        avgProcessingTime = `${avgDays} Days`;
      }

      setStats({
        totalApplications: totalApplications || 0,
        approvedToday: approvedToday || 0,
        rejectedToday: rejectedToday || 0,
        pendingReviews: pendingReviews || 0,
        avgProcessingTime,
        processingEfficiency,
        expertAssignments: expertAssignments || 0
      });
    } catch (err) {
      console.error('Error calculating stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateStats();

    // Set up realtime subscription to recalculate stats when applications change
    const channel = supabase
      .channel('admin-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        () => {
          console.log('Application changed, recalculating stats');
          calculateStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { stats, loading, error };
}