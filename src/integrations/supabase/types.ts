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
      claims: {
        Row: {
          additional_notes: string | null
          claim_description: string
          claim_title: string
          completion_date: string | null
          costs_incurred: number | null
          created_at: string
          defects_categories: string[] | null
          development_name: string | null
          email: string
          estimated_damages: number | null
          first_name: string
          id: string
          issues_discovered_date: string | null
          last_name: string
          legal_representation: boolean | null
          phone: string | null
          previous_contact_with_redrow: boolean | null
          property_address: string
          property_type: string | null
          purchase_date: string | null
          receipts_available: boolean | null
          repair_quotes_obtained: boolean | null
          status: string | null
          supporting_documents: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          claim_description: string
          claim_title: string
          completion_date?: string | null
          costs_incurred?: number | null
          created_at?: string
          defects_categories?: string[] | null
          development_name?: string | null
          email: string
          estimated_damages?: number | null
          first_name: string
          id?: string
          issues_discovered_date?: string | null
          last_name: string
          legal_representation?: boolean | null
          phone?: string | null
          previous_contact_with_redrow?: boolean | null
          property_address: string
          property_type?: string | null
          purchase_date?: string | null
          receipts_available?: boolean | null
          repair_quotes_obtained?: boolean | null
          status?: string | null
          supporting_documents?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          claim_description?: string
          claim_title?: string
          completion_date?: string | null
          costs_incurred?: number | null
          created_at?: string
          defects_categories?: string[] | null
          development_name?: string | null
          email?: string
          estimated_damages?: number | null
          first_name?: string
          id?: string
          issues_discovered_date?: string | null
          last_name?: string
          legal_representation?: boolean | null
          phone?: string | null
          previous_contact_with_redrow?: boolean | null
          property_address?: string
          property_type?: string | null
          purchase_date?: string | null
          receipts_available?: boolean | null
          repair_quotes_obtained?: boolean | null
          status?: string | null
          supporting_documents?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      development_ratings: {
        Row: {
          build_quality_rating: number | null
          created_at: string
          customer_service_rating: number | null
          development_name: string
          id: string
          overall_rating: number | null
          review_text: string | null
          updated_at: string
          user_id: string
          value_for_money_rating: number | null
          would_recommend: boolean | null
        }
        Insert: {
          build_quality_rating?: number | null
          created_at?: string
          customer_service_rating?: number | null
          development_name: string
          id?: string
          overall_rating?: number | null
          review_text?: string | null
          updated_at?: string
          user_id: string
          value_for_money_rating?: number | null
          would_recommend?: boolean | null
        }
        Update: {
          build_quality_rating?: number | null
          created_at?: string
          customer_service_rating?: number | null
          development_name?: string
          id?: string
          overall_rating?: number | null
          review_text?: string | null
          updated_at?: string
          user_id?: string
          value_for_money_rating?: number | null
          would_recommend?: boolean | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          recipients: string[]
          resend_email_id: string | null
          sent_at: string | null
          sent_by: string | null
          status: string | null
          subject: string
          template_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recipients: string[]
          resend_email_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject: string
          template_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recipients?: string[]
          resend_email_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject?: string
          template_type?: string
        }
        Relationships: []
      }
      email_preferences: {
        Row: {
          created_at: string | null
          evidence_notifications: boolean | null
          glo_updates: boolean | null
          id: string
          newsletter_enabled: boolean | null
          unsubscribed_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          evidence_notifications?: boolean | null
          glo_updates?: boolean | null
          id?: string
          newsletter_enabled?: boolean | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          evidence_notifications?: boolean | null
          glo_updates?: boolean | null
          id?: string
          newsletter_enabled?: boolean | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      email_template_audit_log: {
        Row: {
          action: string
          id: string
          metadata: Json | null
          performed_at: string | null
          performed_by: string | null
          template_id: string
        }
        Insert: {
          action: string
          id?: string
          metadata?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          template_id: string
        }
        Update: {
          action?: string
          id?: string
          metadata?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          template_id?: string
        }
        Relationships: []
      }
      email_template_backups: {
        Row: {
          backed_up_at: string | null
          backed_up_by: string | null
          backup_notes: string | null
          backup_reason: string | null
          category: string | null
          created_at: string | null
          description: string | null
          display_name: string
          html_content: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          original_created_at: string | null
          original_updated_at: string | null
          preview_data: Json | null
          subject_template: string
          template_id: string
          variables: Json | null
        }
        Insert: {
          backed_up_at?: string | null
          backed_up_by?: string | null
          backup_notes?: string | null
          backup_reason?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          html_content: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          original_created_at?: string | null
          original_updated_at?: string | null
          preview_data?: Json | null
          subject_template: string
          template_id: string
          variables?: Json | null
        }
        Update: {
          backed_up_at?: string | null
          backed_up_by?: string | null
          backup_notes?: string | null
          backup_reason?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          html_content?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          original_created_at?: string | null
          original_updated_at?: string | null
          preview_data?: Json | null
          subject_template?: string
          template_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          display_name: string
          html_content: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          preview_data: Json | null
          subject_template: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name: string
          html_content: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          preview_data?: Json | null
          subject_template: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name?: string
          html_content?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          preview_data?: Json | null
          subject_template?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      email_triggers: {
        Row: {
          conditions: Json | null
          created_at: string | null
          delay_minutes: number | null
          event_type: Database["public"]["Enums"]["trigger_event"]
          id: string
          is_enabled: boolean | null
          recipient_config: Json | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          delay_minutes?: number | null
          event_type: Database["public"]["Enums"]["trigger_event"]
          id?: string
          is_enabled?: boolean | null
          recipient_config?: Json | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          delay_minutes?: number | null
          event_type?: Database["public"]["Enums"]["trigger_event"]
          id?: string
          is_enabled?: boolean | null
          recipient_config?: Json | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_triggers_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence: {
        Row: {
          category: string
          created_at: string
          description: string | null
          featured_image_index: number | null
          id: string
          is_public: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_status:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          rejection_reason: string | null
          severity: string
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          featured_image_index?: number | null
          id?: string
          is_public?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          rejection_reason?: string | null
          severity: string
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          featured_image_index?: number | null
          id?: string
          is_public?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?:
            | Database["public"]["Enums"]["moderation_status"]
            | null
          rejection_reason?: string | null
          severity?: string
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      evidence_comments: {
        Row: {
          comment_text: string
          commenter_email: string
          commenter_name: string
          created_at: string | null
          evidence_id: string
          id: string
          ip_address: unknown
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: string
          rejection_reason: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          comment_text: string
          commenter_email: string
          commenter_name: string
          created_at?: string | null
          evidence_id: string
          id?: string
          ip_address?: unknown
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string
          rejection_reason?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          comment_text?: string
          commenter_email?: string
          commenter_name?: string
          created_at?: string | null
          evidence_id?: string
          id?: string
          ip_address?: unknown
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string
          rejection_reason?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_comments_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_photo_captions: {
        Row: {
          caption: string | null
          created_at: string | null
          evidence_id: string | null
          id: string
          label: string | null
          order_index: number | null
          photo_path: string
          poster_url: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          evidence_id?: string | null
          id?: string
          label?: string | null
          order_index?: number | null
          photo_path: string
          poster_url?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          evidence_id?: string | null
          id?: string
          label?: string | null
          order_index?: number | null
          photo_path?: string
          poster_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_photo_captions_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidence"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          id: string
          is_published: boolean
          order_index: number
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      glo_interest: {
        Row: {
          additional_comments: string | null
          contact_consent: boolean
          created_at: string
          defect_categories: string[] | null
          development_name: string | null
          email: string
          estimated_damages: number | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          property_address: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_comments?: string | null
          contact_consent?: boolean
          created_at?: string
          defect_categories?: string[] | null
          development_name?: string | null
          email: string
          estimated_damages?: number | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          property_address?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_comments?: string | null
          contact_consent?: boolean
          created_at?: string
          defect_categories?: string[] | null
          development_name?: string | null
          email?: string
          estimated_damages?: number | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          property_address?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      photo_comments: {
        Row: {
          comment_text: string
          commenter_email: string
          commenter_name: string
          created_at: string | null
          id: string
          ip_address: unknown
          moderated_at: string | null
          moderated_by: string | null
          moderation_status: string
          photo_caption_id: string
          rejection_reason: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          comment_text: string
          commenter_email: string
          commenter_name: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string
          photo_caption_id: string
          rejection_reason?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          comment_text?: string
          commenter_email?: string
          commenter_name?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_status?: string
          photo_caption_id?: string
          rejection_reason?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_comments_photo_caption_id_fkey"
            columns: ["photo_caption_id"]
            isOneToOne: false
            referencedRelation: "evidence_photo_captions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          advice_to_others: string | null
          build_style: string | null
          county: string
          created_at: string
          decision_influenced: boolean | null
          development_name: string | null
          first_name: string
          home_tel: string | null
          id: string
          last_name: string
          mobile_tel: string | null
          nhbc_contact: boolean | null
          postcode: string
          property_number: string | null
          social_media_consent: boolean | null
          street_name: string
          town_city: string
          updated_at: string
          user_id: string
          whatsapp_consent: boolean
        }
        Insert: {
          advice_to_others?: string | null
          build_style?: string | null
          county: string
          created_at?: string
          decision_influenced?: boolean | null
          development_name?: string | null
          first_name: string
          home_tel?: string | null
          id?: string
          last_name: string
          mobile_tel?: string | null
          nhbc_contact?: boolean | null
          postcode: string
          property_number?: string | null
          social_media_consent?: boolean | null
          street_name: string
          town_city: string
          updated_at?: string
          user_id: string
          whatsapp_consent?: boolean
        }
        Update: {
          advice_to_others?: string | null
          build_style?: string | null
          county?: string
          created_at?: string
          decision_influenced?: boolean | null
          development_name?: string | null
          first_name?: string
          home_tel?: string | null
          id?: string
          last_name?: string
          mobile_tel?: string | null
          nhbc_contact?: boolean | null
          postcode?: string
          property_number?: string | null
          social_media_consent?: boolean | null
          street_name?: string
          town_city?: string
          updated_at?: string
          user_id?: string
          whatsapp_consent?: boolean
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_analytics: {
        Row: {
          city: string | null
          country: string | null
          detection_method: string | null
          id: string
          ip_address: unknown
          is_lovable_infrastructure: boolean | null
          page_path: string | null
          referrer: string | null
          region: string | null
          request_headers: Json | null
          request_timing_ms: number | null
          session_duration_ms: number | null
          session_id: string | null
          timezone: string | null
          traffic_type: string | null
          user_agent: string | null
          visited_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          detection_method?: string | null
          id?: string
          ip_address: unknown
          is_lovable_infrastructure?: boolean | null
          page_path?: string | null
          referrer?: string | null
          region?: string | null
          request_headers?: Json | null
          request_timing_ms?: number | null
          session_duration_ms?: number | null
          session_id?: string | null
          timezone?: string | null
          traffic_type?: string | null
          user_agent?: string | null
          visited_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          detection_method?: string | null
          id?: string
          ip_address?: unknown
          is_lovable_infrastructure?: boolean | null
          page_path?: string | null
          referrer?: string | null
          region?: string | null
          request_headers?: Json | null
          request_timing_ms?: number | null
          session_duration_ms?: number | null
          session_id?: string | null
          timezone?: string | null
          traffic_type?: string | null
          user_agent?: string | null
          visited_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_by_admin: { Args: { target_user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      restore_email_template: {
        Args: { backup_id: string; restore_as_new?: boolean }
        Returns: string
      }
      update_email_template_html: {
        Args: { new_html_content: string; template_name: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      moderation_status: "pending" | "approved" | "rejected"
      rating_value: "1" | "2" | "3" | "4" | "5"
      trigger_event:
        | "user_registered"
        | "evidence_approved"
        | "evidence_rejected"
        | "evidence_submitted"
        | "claim_submitted"
        | "glo_registered"
        | "manual"
        | "comment_submitted"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      moderation_status: ["pending", "approved", "rejected"],
      rating_value: ["1", "2", "3", "4", "5"],
      trigger_event: [
        "user_registered",
        "evidence_approved",
        "evidence_rejected",
        "evidence_submitted",
        "claim_submitted",
        "glo_registered",
        "manual",
        "comment_submitted",
      ],
    },
  },
} as const
