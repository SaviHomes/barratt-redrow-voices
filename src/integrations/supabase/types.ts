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
      evidence: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          severity: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          severity: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          severity?: string
          title?: string
          updated_at?: string
          user_id?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      rating_value: "1" | "2" | "3" | "4" | "5"
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
      rating_value: ["1", "2", "3", "4", "5"],
    },
  },
} as const
