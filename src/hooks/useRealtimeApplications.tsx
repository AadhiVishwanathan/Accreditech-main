import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealtimeApplication {
  id: string;
  institute_id: string;
  application_number: string;
  programme_name: string;
  programme_type: string;
  status: string;
  payment_status: string;
  progress_percentage: number;
  ai_score: number | null;
  submission_date: string;
  created_at: string;
  updated_at: string;
  institute: {
    institute_name: string;
    director_name: string;
    email: string;
    user_id: string;
  } | null;
}

export function useRealtimeApplications() {
  const [applications, setApplications] = useState<RealtimeApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchApplications = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            id,
            institute_id,
            application_number,
            programme_name,
            programme_type,
            status,
            payment_status,
            progress_percentage,
            ai_score,
            submission_date,
            created_at,
            updated_at,
            institute:institutes(
              institute_name,
              director_name,
              email,
              user_id
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setApplications(data || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();

    // Set up realtime subscription
    const channel = supabase
      .channel('admin-applications')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'applications'
        },
        async (payload) => {
          console.log('Application realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch the full record with institute data
            const { data: newApp } = await supabase
              .from('applications')
              .select(`
                id,
                institute_id,
                application_number,
                programme_name,
                programme_type,
                status,
                payment_status,
                progress_percentage,
                ai_score,
                submission_date,
                created_at,
                updated_at,
                institute:institutes(
                  institute_name,
                  director_name,
                  email,
                  user_id
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (newApp) {
              setApplications(prev => [newApp, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            // Fetch the updated record with institute data
            const { data: updatedApp } = await supabase
              .from('applications')
              .select(`
                id,
                institute_id,
                application_number,
                programme_name,
                programme_type,
                status,
                payment_status,
                progress_percentage,
                ai_score,
                submission_date,
                created_at,
                updated_at,
                institute:institutes(
                  institute_name,
                  director_name,
                  email,
                  user_id
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (updatedApp) {
              setApplications(prev => 
                prev.map(app => app.id === updatedApp.id ? updatedApp : app)
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setApplications(prev => 
              prev.filter(app => app.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { applications, loading, error };
}