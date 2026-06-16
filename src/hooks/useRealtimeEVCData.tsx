import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EVCSessionData {
  evc_member_id: string;
  application_id: string;
  username: string;
  member_name: string;
  position: string;
  specialization: string;
  application_number: string;
  institute_name: string;
}

interface InstituteData {
  id: string;
  institute_name: string;
  institute_type: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  director_name: string;
  director_email: string;
  director_phone: string;
  nodal_officer_name: string;
  nodal_officer_email: string;
  nodal_officer_phone: string;
  establishment_year: number;
}

interface ApplicationData {
  id: string;
  application_number: string;
  programme_name: string;
  programme_type: string;
  status: string;
  submission_date: string;
  institute: InstituteData;
}

interface VisitAssignment {
  id: string;
  visit_date: string;
  status: string;
  assignment_type: string;
  application: ApplicationData;
}

interface EVCTeamMember {
  id: string;
  name: string;
  position: string;
  specialization: string;
  experience_years: number;
  assignment_type: string;
}

interface InfrastructurePhoto {
  id: string;
  facility_type: string;
  image_url: string;
  compliance_score: number;
  compliance_status: string;
  calculated_area: number;
}

interface VisitEvaluation {
  id: string;
  evaluation_status: string;
  remarks: string;
  pros: string[];
  cons: string[];
  infrastructure_rating: number;
  faculty_rating: number;
  overall_rating: number;
  is_approved: boolean;
  requires_rescheduling: boolean;
  reschedule_reason: string;
  new_proposed_date: string | null;
  visit_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useRealtimeEVCData = () => {
  const [sessionData, setSessionData] = useState<EVCSessionData | null>(null);
  const [assignment, setAssignment] = useState<VisitAssignment | null>(null);
  const [evaluation, setEvaluation] = useState<VisitEvaluation | null>(null);
  const [teamMembers, setTeamMembers] = useState<EVCTeamMember[]>([]);
  const [infrastructurePhotos, setInfrastructurePhotos] = useState<InfrastructurePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load EVC session data
    const storedSession = localStorage.getItem('evc_session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setSessionData(parsedSession);
      } catch (err) {
        console.error('Error parsing EVC session:', err);
        setError('Invalid session data');
      }
    }
  }, []);

  const fetchAssignmentData = async () => {
    if (!sessionData?.application_id || !sessionData?.evc_member_id) return;

    try {
      console.log('Fetching assignment data for:', { 
        application_id: sessionData.application_id, 
        evc_member_id: sessionData.evc_member_id 
      });

      // Use secure RPC to get assignment and application details
      const { data: assignmentData, error: assignmentError } = await (supabase as any)
        .rpc('get_evc_assignment_and_application', {
          p_evc_member_id: sessionData.evc_member_id,
          p_application_id: sessionData.application_id
        });

      console.log('Assignment RPC result:', { data: assignmentData, error: assignmentError });

      if (assignmentError) {
        console.error('Assignment fetch error:', assignmentError);
        throw assignmentError;
      }

      if (assignmentData && assignmentData.length > 0) {
        const data = assignmentData[0];
        const formattedAssignment: VisitAssignment = {
          id: data.assignment_id,
          visit_date: data.visit_date,
          status: data.assignment_status,
          assignment_type: data.assignment_type,
          application: {
            id: data.application_id,
            application_number: data.application_number,
            programme_name: data.programme_name,
            programme_type: data.programme_type,
            status: data.application_status,
            submission_date: data.submission_date,
            institute: {
              id: data.institute_id,
              institute_name: data.institute_name,
              institute_type: data.institute_type,
              address: data.address,
              city: data.city,
              state: data.state,
              pincode: data.pincode,
              phone: data.phone,
              email: data.email,
              website: data.website,
              director_name: data.director_name,
              director_email: data.director_email,
              director_phone: data.director_phone,
              nodal_officer_name: data.nodal_officer_name,
              nodal_officer_email: data.nodal_officer_email,
              nodal_officer_phone: data.nodal_officer_phone,
              establishment_year: data.establishment_year
            }
          }
        };

        console.log('Formatted assignment:', formattedAssignment);
        setAssignment(formattedAssignment);
        setError(null); // Clear any previous errors
      } else {
        console.log('No assignment data found');
        setError('No assignment found for this EVC member');
      }
    } catch (error) {
      console.error('Error fetching assignment data:', error);
      setError('Failed to fetch assignment data: ' + error.message);
    }
  };

  const fetchTeamMembers = async () => {
    if (!sessionData?.application_id) return;

    try {
      console.log('Fetching team members for application:', sessionData.application_id);

      // Use secure RPC to get team members
      const { data: teamData, error: teamError } = await (supabase as any)
        .rpc('get_evc_team_members', {
          p_application_id: sessionData.application_id
        });

      console.log('Team members RPC result:', { data: teamData, error: teamError });

      if (teamError) {
        console.error('Team members fetch error:', teamError);
        throw teamError;
      }

      const formattedMembers: EVCTeamMember[] = teamData?.map((member: any) => ({
        id: member.member_id,
        name: member.member_name,
        position: member.member_position,
        specialization: member.specialization,
        experience_years: member.experience_years,
        assignment_type: member.assignment_type
      })) || [];

      console.log('Formatted team members:', formattedMembers);
      setTeamMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchInfrastructurePhotos = async () => {
    if (!sessionData?.application_id) return;

    try {
      console.log('Fetching infrastructure photos for application:', sessionData.application_id);

      // Use secure RPC to get infrastructure photos
      const { data: photoData, error: photoError } = await (supabase as any)
        .rpc('get_infrastructure_photos', {
          p_application_id: sessionData.application_id
        });

      console.log('Infrastructure photos RPC result:', { data: photoData, error: photoError });

      if (photoError) {
        console.error('Infrastructure photos fetch error:', photoError);
        throw photoError;
      }

      const formattedPhotos: InfrastructurePhoto[] = photoData?.map((photo: any) => ({
        id: photo.photo_id,
        facility_type: photo.facility_type,
        image_url: photo.image_url,
        compliance_score: photo.compliance_score || 0,
        compliance_status: photo.compliance_status || 'pending',
        calculated_area: photo.calculated_area || 0
      })) || [];

      console.log('Formatted infrastructure photos:', formattedPhotos);
      setInfrastructurePhotos(formattedPhotos);
    } catch (error) {
      console.error('Error fetching infrastructure photos:', error);
    }
  };

  const fetchEvaluation = async () => {
    if (!sessionData?.application_id || !sessionData?.evc_member_id) return;

    try {
      const { data, error } = await supabase
        .from('visit_evaluations')
        .select('*')
        .eq('application_id', sessionData.application_id)
        .eq('evc_chairman_id', sessionData.evc_member_id)
        .maybeSingle();

      if (error) throw error;
      setEvaluation(data);
    } catch (error) {
      console.error('Error fetching evaluation:', error);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchAssignmentData(),
        fetchTeamMembers(),
        fetchInfrastructurePhotos(),
        fetchEvaluation()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!sessionData?.application_id) return;

    console.log('Setting up real-time subscriptions for application:', sessionData.application_id);

    const channel = supabase
      .channel('evc_realtime_' + sessionData.application_id)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visit_evaluations',
          filter: `application_id=eq.${sessionData.application_id}`
        },
        (payload) => {
          console.log('Real-time: visit_evaluations change detected:', payload);
          fetchEvaluation();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evc_assignments',
          filter: `application_id=eq.${sessionData.application_id}`
        },
        (payload) => {
          console.log('Real-time: evc_assignments change detected:', payload);
          fetchAssignmentData();
          fetchTeamMembers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'infrastructure_validation',
          filter: `application_id=eq.${sessionData.application_id}`
        },
        (payload) => {
          console.log('Real-time: infrastructure_validation change detected:', payload);
          fetchInfrastructurePhotos();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(channel);
    };
  };

  const submitEvaluation = async (evaluationData: {
    remarks: string;
    pros: string[];
    cons: string[];
    infrastructure_rating: number;
    faculty_rating: number;
    overall_rating: number;
    is_approved: boolean;
    requires_rescheduling: boolean;
    reschedule_reason?: string;
    new_proposed_date?: string | null;
  }) => {
    if (!sessionData?.application_id || !sessionData?.evc_member_id) return;

    try {
      // Use secure RPC function to submit evaluation
      const { data, error } = await (supabase as any)
        .rpc('submit_evc_evaluation', {
          p_application_id: sessionData.application_id,
          p_evc_chairman_id: sessionData.evc_member_id,
          p_visit_date: assignment?.visit_date,
          p_evaluation_status: evaluationData.is_approved 
            ? 'completed' 
            : evaluationData.requires_rescheduling 
              ? 'requires_rescheduling'
              : 'requires_changes',
          p_remarks: evaluationData.remarks,
          p_pros: evaluationData.pros,
          p_cons: evaluationData.cons,
          p_infrastructure_rating: evaluationData.infrastructure_rating,
          p_faculty_rating: evaluationData.faculty_rating,
          p_overall_rating: evaluationData.overall_rating,
          p_is_approved: evaluationData.is_approved,
          p_requires_rescheduling: evaluationData.requires_rescheduling,
          p_reschedule_reason: evaluationData.reschedule_reason || null,
          p_new_proposed_date: evaluationData.new_proposed_date 
            ? new Date(evaluationData.new_proposed_date).toISOString()
            : null
        });

      if (error) throw error;

      if (data && data.length > 0) {
        // Map the prefixed response back to the expected format
        const evaluation = {
          id: data[0].eval_id,
          application_id: data[0].eval_application_id,
          evc_chairman_id: data[0].eval_evc_chairman_id,
          visit_date: data[0].eval_visit_date,
          evaluation_status: data[0].eval_evaluation_status,
          remarks: data[0].eval_remarks,
          pros: data[0].eval_pros,
          cons: data[0].eval_cons,
          infrastructure_rating: data[0].eval_infrastructure_rating,
          faculty_rating: data[0].eval_faculty_rating,
          overall_rating: data[0].eval_overall_rating,
          is_approved: data[0].eval_is_approved,
          requires_rescheduling: data[0].eval_requires_rescheduling,
          reschedule_reason: data[0].eval_reschedule_reason,
          new_proposed_date: data[0].eval_new_proposed_date,
          created_at: data[0].eval_created_at,
          updated_at: data[0].eval_updated_at
        };
        setEvaluation(evaluation);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('evc_session');
    setSessionData(null);
    setAssignment(null);
    setEvaluation(null);
    setTeamMembers([]);
    setInfrastructurePhotos([]);
    setLoading(false);
    setError(null);
  };

  const refreshData = async () => {
    console.log('Manual data refresh triggered');
    await fetchAllData();
  };

  // Initial data fetch
  useEffect(() => {
    if (sessionData) {
      fetchAllData();
    }
  }, [sessionData]);

  // Real-time subscriptions setup
  useEffect(() => {
    if (sessionData?.application_id) {
      const cleanup = setupRealtimeSubscriptions();
      return cleanup;
    }
  }, [sessionData?.application_id]);

  const isAuthenticated = !!sessionData;

  return {
    sessionData,
    assignment,
    evaluation,
    teamMembers,
    infrastructurePhotos,
    loading,
    error,
    logout,
    refreshData,
    submitEvaluation,
    isAuthenticated
  };
};