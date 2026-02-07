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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      api_usage_logs: {
        Row: {
          api_name: string
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          model_name: string | null
          request_type: string | null
          response_time_ms: number | null
          status: string
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          api_name: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          model_name?: string | null
          request_type?: string | null
          response_time_ms?: number | null
          status?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          api_name?: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          model_name?: string | null
          request_type?: string | null
          response_time_ms?: number | null
          status?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      presentation_shares: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          permission: string
          presentation_id: string
          share_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          permission?: string
          presentation_id: string
          share_token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          permission?: string
          presentation_id?: string
          share_token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "presentation_shares_presentation_id_fkey"
            columns: ["presentation_id"]
            isOneToOne: false
            referencedRelation: "presentations"
            referencedColumns: ["id"]
          },
        ]
      }
      presentations: {
        Row: {
          animation_style: string | null
          audience: string | null
          content_depth: string | null
          created_at: string | null
          id: string
          language: string | null
          notes: string | null
          slide_count: number | null
          status: string | null
          theme_id: string | null
          thumbnail_url: string | null
          title: string
          tone: string | null
          topic: string | null
          updated_at: string | null
          user_id: string
          visual_density: string | null
        }
        Insert: {
          animation_style?: string | null
          audience?: string | null
          content_depth?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          notes?: string | null
          slide_count?: number | null
          status?: string | null
          theme_id?: string | null
          thumbnail_url?: string | null
          title?: string
          tone?: string | null
          topic?: string | null
          updated_at?: string | null
          user_id: string
          visual_density?: string | null
        }
        Update: {
          animation_style?: string | null
          audience?: string | null
          content_depth?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          notes?: string | null
          slide_count?: number | null
          status?: string | null
          theme_id?: string | null
          thumbnail_url?: string | null
          title?: string
          tone?: string | null
          topic?: string | null
          updated_at?: string | null
          user_id?: string
          visual_density?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          content: string | null
          created_at: string | null
          file_url: string | null
          id: string
          name: string
          presentation_id: string
          resource_type: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          name: string
          presentation_id: string
          resource_type: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          name?: string
          presentation_id?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_presentation_id_fkey"
            columns: ["presentation_id"]
            isOneToOne: false
            referencedRelation: "presentations"
            referencedColumns: ["id"]
          },
        ]
      }
      slides: {
        Row: {
          animation: string | null
          background_color: string | null
          bullets: Json | null
          created_at: string | null
          id: string
          image_prompt: string | null
          image_url: string | null
          layout: string | null
          order_index: number
          presentation_id: string
          slide_type: string | null
          speaker_notes: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          animation?: string | null
          background_color?: string | null
          bullets?: Json | null
          created_at?: string | null
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          layout?: string | null
          order_index?: number
          presentation_id: string
          slide_type?: string | null
          speaker_notes?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          animation?: string | null
          background_color?: string | null
          bullets?: Json | null
          created_at?: string | null
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          layout?: string | null
          order_index?: number
          presentation_id?: string
          slide_type?: string | null
          speaker_notes?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slides_presentation_id_fkey"
            columns: ["presentation_id"]
            isOneToOne: false
            referencedRelation: "presentations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          features: Json | null
          id: string
          max_presentations_per_month: number | null
          max_slides: number
          plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          features?: Json | null
          id?: string
          max_presentations_per_month?: number | null
          max_slides?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          features?: Json | null
          id?: string
          max_presentations_per_month?: number | null
          max_slides?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_shared_presentation: {
        Args: { share_token_param: string }
        Returns: {
          permission: string
          presentation_id: string
          theme_id: string
          title: string
        }[]
      }
      get_shared_slides: {
        Args: { share_token_param: string }
        Returns: {
          animation: string
          bullets: Json
          id: string
          image_url: string
          layout: string
          order_index: number
          slide_type: string
          speaker_notes: string
          subtitle: string
          title: string
        }[]
      }
      get_user_max_slides: { Args: { _user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      subscription_plan: "free" | "pro" | "enterprise"
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
      subscription_plan: ["free", "pro", "enterprise"],
    },
  },
} as const
