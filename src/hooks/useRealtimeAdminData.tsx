import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Application {
  id: string;
  application_number: string;
  institute_id: string;
  status: string;
  programme_type: string;
  programme_name: string;
  submission_date: string;
  progress_percentage: number;
  ai_score: number | null;
  evaluator_id: string | null;
  payment_status: string;
  institute?: {
    institute_name: string;
    director_name: string;
    city: string;
    state: string;
  };
}

export interface AdminStats {
  totalApplications: number;
  approvedToday: number;
  rejectedToday: number;
  pendingReview: number;
  avgProcessingTime: string;
  processingEfficiency: number;
}

export function useRealtimeAdminData() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalApplications: 0,
    approvedToday: 0,
    rejectedToday: 0,
    pendingReview: 0,
    avgProcessingTime: "0 Days",
    processingEfficiency: 0
  });
  const [loading, setLoading] = useState(true);

  // Calculate stats from applications data
  const calculateStats = (apps: Application[]): AdminStats => {
    const today = new Date().toDateString();
    const approvedToday = apps.filter(app => 
      app.status === 'approved' && 
      new Date(app.submission_date).toDateString() === today
    ).length;
    
    const rejectedToday = apps.filter(app => 
      app.status === 'rejected' && 
      new Date(app.submission_date).toDateString() === today
    ).length;
    
    const pendingReview = apps.filter(app => 
      ['submitted', 'under_review', 'document_review'].includes(app.status)
    ).length;

    const efficiency = apps.length > 0 ? Math.round((approvedToday / apps.length) * 100) : 0;

    return {
      totalApplications: apps.length,
      approvedToday,
      rejectedToday,
      pendingReview,
      avgProcessingTime: "2.3 Days", // This would need more complex calculation based on actual processing times
      processingEfficiency: efficiency
    };
  };

  // Fetch initial data
  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          institutes!inner(
            institute_name,
            director_name,
            city,
            state
          )
        `)
        .order('submission_date', { ascending: false });

      if (error) throw error;

      const formattedApps = data?.map(app => ({
        ...app,
        institute: app.institutes
      })) || [];

      setApplications(formattedApps);
      setStats(calculateStats(formattedApps));
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    // Set up realtime subscriptions
    const applicationsChannel = supabase
      .channel('admin-applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        (payload) => {
          console.log('Application change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch the new application with institute data
            supabase
              .from('applications')
              .select(`
                *,
                institutes!inner(
                  institute_name,
                  director_name,
                  city,
                  state
                )
              `)
              .eq('id', payload.new.id)
              .single()
              .then(({ data, error }) => {
                if (!error && data) {
                  const newApp = { ...data, institute: data.institutes };
                  setApplications(prev => {
                    const updated = [newApp, ...prev];
                    setStats(calculateStats(updated));
                    return updated;
                  });
                  toast.success(`New application submitted: ${data.application_number}`);
                }
              });
          } else if (payload.eventType === 'UPDATE') {
            setApplications(prev => {
              const updated = prev.map(app => 
                app.id === payload.new.id 
                  ? { ...app, ...payload.new }
                  : app
              );
              setStats(calculateStats(updated));
              
              // Show toast for status changes
              if (payload.old.status !== payload.new.status) {
                toast.info(`Application ${payload.new.application_number} status changed to ${payload.new.status}`);
              }
              
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            setApplications(prev => {
              const updated = prev.filter(app => app.id !== payload.old.id);
              setStats(calculateStats(updated));
              return updated;
            });
          }
        }
      )
      .subscribe();

    // Subscribe to institute changes to update application data
    const institutesChannel = supabase
      .channel('admin-institutes-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'institutes'
        },
        (payload) => {
          console.log('Institute change detected:', payload);
          setApplications(prev => 
            prev.map(app => 
              app.institute_id === payload.new.id
                ? { 
                    ...app, 
                    institute: {
                      ...app.institute!,
                      institute_name: payload.new.institute_name,
                      director_name: payload.new.director_name,
                      city: payload.new.city,
                      state: payload.new.state
                    }
                  }
                : app
            )
          );
        }
      )
      .subscribe();

    // Subscribe to workflow changes for application tracking
    const workflowChannel = supabase
      .channel('admin-workflow-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'application_workflow'
        },
        (payload) => {
          console.log('Workflow change detected:', payload);
          toast.info(`Application workflow updated: ${payload.new.from_status} → ${payload.new.to_status}`);
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(applicationsChannel);
      supabase.removeChannel(institutesChannel);
      supabase.removeChannel(workflowChannel);
    };
  }, []);

  return {
    applications,
    stats,
    loading,
    refreshData: fetchApplications
  };
}