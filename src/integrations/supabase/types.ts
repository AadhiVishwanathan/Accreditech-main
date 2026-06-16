export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      application_workflow: {
        Row: {
          application_id: string
          changed_at: string
          changed_by: string | null
          comments: string | null
          from_status: string | null
          id: string
          metadata: Json | null
          to_status: string
        }
        Insert: {
          application_id: string
          changed_at?: string
          changed_by?: string | null
          comments?: string | null
          from_status?: string | null
          id?: string
          metadata?: Json | null
          to_status: string
        }
        Update: {
          application_id?: string
          changed_at?: string
          changed_by?: string | null
          comments?: string | null
          from_status?: string | null
          id?: string
          metadata?: Json | null
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_workflow_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          ai_score: number | null
          application_data: Json | null
          application_number: string
          created_at: string
          documents: Json | null
          evaluator_id: string | null
          faculty_data: Json | null
          financial_data: Json | null
          id: string
          infrastructure_data: Json | null
          institute_id: string
          next_step: string | null
          payment_status: string | null
          payment_utr: string | null
          programme_name: string
          programme_type: string
          progress_percentage: number | null
          status: string
          submission_date: string
          updated_at: string
        }
        Insert: {
          ai_score?: number | null
          application_data?: Json | null
          application_number: string
          created_at?: string
          documents?: Json | null
          evaluator_id?: string | null
          faculty_data?: Json | null
          financial_data?: Json | null
          id?: string
          infrastructure_data?: Json | null
          institute_id: string
          next_step?: string | null
          payment_status?: string | null
          payment_utr?: string | null
          programme_name: string
          programme_type: string
          progress_percentage?: number | null
          status?: string
          submission_date?: string
          updated_at?: string
        }
        Update: {
          ai_score?: number | null
          application_data?: Json | null
          application_number?: string
          created_at?: string
          documents?: Json | null
          evaluator_id?: string | null
          faculty_data?: Json | null
          financial_data?: Json | null
          id?: string
          infrastructure_data?: Json | null
          institute_id?: string
          next_step?: string | null
          payment_status?: string | null
          payment_utr?: string | null
          programme_name?: string
          programme_type?: string
          progress_percentage?: number | null
          status?: string
          submission_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "evaluators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      document_verification: {
        Row: {
          application_id: string
          created_at: string
          document_name: string
          document_url: string
          fraud_checks: Json | null
          id: string
          ocr_text: string | null
          verification_score: number | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          application_id: string
          created_at?: string
          document_name: string
          document_url: string
          fraud_checks?: Json | null
          id?: string
          ocr_text?: string | null
          verification_score?: number | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string
          document_name?: string
          document_url?: string
          fraud_checks?: Json | null
          id?: string
          ocr_text?: string | null
          verification_score?: number | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_verification_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluators: {
        Row: {
          created_at: string
          email: string
          experience_years: number | null
          expertise: string[]
          id: string
          is_active: boolean | null
          location: string | null
          max_workload: number | null
          name: string
          phone: string | null
          updated_at: string
          user_id: string
          workload: number | null
        }
        Insert: {
          created_at?: string
          email: string
          experience_years?: number | null
          expertise?: string[]
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_workload?: number | null
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
          workload?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          experience_years?: number | null
          expertise?: string[]
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_workload?: number | null
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          workload?: number | null
        }
        Relationships: []
      }
      evc_assignments: {
        Row: {
          application_id: string
          assigned_at: string
          assigned_by: string
          assignment_type: string
          evc_member_id: string
          id: string
          status: string
          visit_date: string | null
        }
        Insert: {
          application_id: string
          assigned_at?: string
          assigned_by: string
          assignment_type?: string
          evc_member_id: string
          id?: string
          status?: string
          visit_date?: string | null
        }
        Update: {
          application_id?: string
          assigned_at?: string
          assigned_by?: string
          assignment_type?: string
          evc_member_id?: string
          id?: string
          status?: string
          visit_date?: string | null
        }
        Relationships: []
      }
      evc_chairman_credentials: {
        Row: {
          application_id: string
          created_at: string
          evc_member_id: string
          id: string
          is_active: boolean
          password_hash: string
          updated_at: string
          username: string
        }
        Insert: {
          application_id: string
          created_at?: string
          evc_member_id: string
          id?: string
          is_active?: boolean
          password_hash: string
          updated_at?: string
          username: string
        }
        Update: {
          application_id?: string
          created_at?: string
          evc_member_id?: string
          id?: string
          is_active?: boolean
          password_hash?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      evc_members: {
        Row: {
          created_at: string
          current_assignments: number
          email: string | null
          experience_years: number
          id: string
          is_active: boolean
          is_available: boolean
          max_assignments: number
          name: string
          phone: string | null
          position: string
          specialization: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_assignments?: number
          email?: string | null
          experience_years: number
          id?: string
          is_active?: boolean
          is_available?: boolean
          max_assignments?: number
          name: string
          phone?: string | null
          position: string
          specialization: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_assignments?: number
          email?: string | null
          experience_years?: number
          id?: string
          is_active?: boolean
          is_available?: boolean
          max_assignments?: number
          name?: string
          phone?: string | null
          position?: string
          specialization?: string
          updated_at?: string
        }
        Relationships: []
      }
      evc_teams: {
        Row: {
          application_id: string
          chairman_id: string | null
          created_at: string
          id: string
          required_members: number
          status: string
          team_name: string
          total_members: number
          updated_at: string
          visit_scheduled_date: string | null
        }
        Insert: {
          application_id: string
          chairman_id?: string | null
          created_at?: string
          id?: string
          required_members?: number
          status?: string
          team_name: string
          total_members?: number
          updated_at?: string
          visit_scheduled_date?: string | null
        }
        Update: {
          application_id?: string
          chairman_id?: string | null
          created_at?: string
          id?: string
          required_members?: number
          status?: string
          team_name?: string
          total_members?: number
          updated_at?: string
          visit_scheduled_date?: string | null
        }
        Relationships: []
      }
      infrastructure_validation: {
        Row: {
          application_id: string
          calculated_area: number | null
          compliance_score: number | null
          compliance_status: string | null
          created_at: string
          facility_type: string
          id: string
          image_url: string
          validated_at: string | null
          validated_by: string | null
          validation_metadata: Json | null
        }
        Insert: {
          application_id: string
          calculated_area?: number | null
          compliance_score?: number | null
          compliance_status?: string | null
          created_at?: string
          facility_type: string
          id?: string
          image_url: string
          validated_at?: string | null
          validated_by?: string | null
          validation_metadata?: Json | null
        }
        Update: {
          application_id?: string
          calculated_area?: number | null
          compliance_score?: number | null
          compliance_status?: string | null
          created_at?: string
          facility_type?: string
          id?: string
          image_url?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_validation_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      institutes: {
        Row: {
          address: string
          affiliation_number: string | null
          city: string
          created_at: string
          director_email: string
          director_name: string
          director_phone: string
          email: string
          establishment_year: number | null
          id: string
          institute_name: string
          institute_type: string
          nodal_officer_email: string
          nodal_officer_name: string
          nodal_officer_phone: string
          phone: string
          pincode: string
          state: string
          status: string | null
          university_name: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address: string
          affiliation_number?: string | null
          city: string
          created_at?: string
          director_email: string
          director_name: string
          director_phone: string
          email: string
          establishment_year?: number | null
          id?: string
          institute_name: string
          institute_type: string
          nodal_officer_email: string
          nodal_officer_name: string
          nodal_officer_phone: string
          phone: string
          pincode: string
          state: string
          status?: string | null
          university_name?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string
          affiliation_number?: string | null
          city?: string
          created_at?: string
          director_email?: string
          director_name?: string
          director_phone?: string
          email?: string
          establishment_year?: number | null
          id?: string
          institute_name?: string
          institute_type?: string
          nodal_officer_email?: string
          nodal_officer_name?: string
          nodal_officer_phone?: string
          phone?: string
          pincode?: string
          state?: string
          status?: string | null
          university_name?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          application_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          institute_name: string | null
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          institute_name?: string | null
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          institute_name?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      visit_evaluations: {
        Row: {
          application_id: string
          cons: string[] | null
          created_at: string
          evaluation_status: string
          evc_chairman_id: string
          faculty_rating: number | null
          id: string
          infrastructure_rating: number | null
          is_approved: boolean | null
          new_proposed_date: string | null
          overall_rating: number | null
          pros: string[] | null
          remarks: string | null
          requires_rescheduling: boolean | null
          reschedule_reason: string | null
          updated_at: string
          visit_date: string | null
        }
        Insert: {
          application_id: string
          cons?: string[] | null
          created_at?: string
          evaluation_status?: string
          evc_chairman_id: string
          faculty_rating?: number | null
          id?: string
          infrastructure_rating?: number | null
          is_approved?: boolean | null
          new_proposed_date?: string | null
          overall_rating?: number | null
          pros?: string[] | null
          remarks?: string | null
          requires_rescheduling?: boolean | null
          reschedule_reason?: string | null
          updated_at?: string
          visit_date?: string | null
        }
        Update: {
          application_id?: string
          cons?: string[] | null
          created_at?: string
          evaluation_status?: string
          evc_chairman_id?: string
          faculty_rating?: number | null
          id?: string
          infrastructure_rating?: number | null
          is_approved?: boolean | null
          new_proposed_date?: string | null
          overall_rating?: number | null
          pros?: string[] | null
          remarks?: string | null
          requires_rescheduling?: boolean | null
          reschedule_reason?: string | null
          updated_at?: string
          visit_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_application_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_evc_assignment_and_application: {
        Args: { p_application_id: string; p_evc_member_id: string }
        Returns: {
          address: string
          application_id: string
          application_number: string
          application_status: string
          assignment_id: string
          assignment_status: string
          assignment_type: string
          city: string
          director_email: string
          director_name: string
          director_phone: string
          email: string
          establishment_year: number
          institute_id: string
          institute_name: string
          institute_type: string
          nodal_officer_email: string
          nodal_officer_name: string
          nodal_officer_phone: string
          phone: string
          pincode: string
          programme_name: string
          programme_type: string
          state: string
          submission_date: string
          visit_date: string
          website: string
        }[]
      }
      get_evc_session_details: {
        Args: { p_application_id: string; p_evc_member_id: string }
        Returns: {
          application_number: string
          institute_name: string
          member_name: string
          member_position: string
          specialization: string
        }[]
      }
      get_evc_team_members: {
        Args: { p_application_id: string }
        Returns: {
          assignment_type: string
          experience_years: number
          member_id: string
          member_name: string
          member_position: string
          specialization: string
        }[]
      }
      get_infrastructure_photos: {
        Args: { p_application_id: string }
        Returns: {
          calculated_area: number
          compliance_score: number
          compliance_status: string
          facility_type: string
          image_url: string
          photo_id: string
        }[]
      }
      submit_evc_evaluation: {
        Args: {
          p_application_id: string
          p_cons: string[]
          p_evaluation_status: string
          p_evc_chairman_id: string
          p_faculty_rating: number
          p_infrastructure_rating: number
          p_is_approved: boolean
          p_new_proposed_date?: string
          p_overall_rating: number
          p_pros: string[]
          p_remarks: string
          p_requires_rescheduling: boolean
          p_reschedule_reason?: string
          p_visit_date: string
        }
        Returns: {
          eval_application_id: string
          eval_cons: string[]
          eval_created_at: string
          eval_evaluation_status: string
          eval_evc_chairman_id: string
          eval_faculty_rating: number
          eval_id: string
          eval_infrastructure_rating: number
          eval_is_approved: boolean
          eval_new_proposed_date: string
          eval_overall_rating: number
          eval_pros: string[]
          eval_remarks: string
          eval_requires_rescheduling: boolean
          eval_reschedule_reason: string
          eval_updated_at: string
          eval_visit_date: string
        }[]
      }
      verify_evc_credentials: {
        Args: { p_password: string; p_username: string }
        Returns: {
          application_id: string
          evc_member_id: string
          id: string
          username: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
