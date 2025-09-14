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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      credit_packs: {
        Row: {
          created_at: string | null
          credits: number
          description: string | null
          effective_rate: number | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price_inr: number
          sort_order: number | null
          tier: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits: number
          description?: string | null
          effective_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price_inr: number
          sort_order?: number | null
          tier: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits?: number
          description?: string | null
          effective_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price_inr?: number
          sort_order?: number | null
          tier?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          created_at: string | null
          credits_after: number
          credits_before: number
          credits_change: number
          id: string
          metadata: Json | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_after: number
          credits_before: number
          credits_change: number
          id?: string
          metadata?: Json | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_after?: number
          credits_before?: number
          credits_change?: number
          id?: string
          metadata?: Json | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_gpt_generations: {
        Row: {
          created_at: string | null
          custom_gpt_id: string
          generated_image_storage_path: string | null
          generated_image_url: string | null
          id: string
          metadata: Json | null
          prompt: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_gpt_id: string
          generated_image_storage_path?: string | null
          generated_image_url?: string | null
          id?: string
          metadata?: Json | null
          prompt: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_gpt_id?: string
          generated_image_storage_path?: string | null
          generated_image_url?: string | null
          id?: string
          metadata?: Json | null
          prompt?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_gpt_generations_custom_gpt_id_fkey"
            columns: ["custom_gpt_id"]
            isOneToOne: false
            referencedRelation: "custom_gpts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_gpt_generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_gpt_memories: {
        Row: {
          content: Json
          created_at: string | null
          custom_gpt_id: string
          id: string
          memory_type: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          custom_gpt_id: string
          id?: string
          memory_type: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          custom_gpt_id?: string
          id?: string
          memory_type?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_gpt_memories_custom_gpt_id_fkey"
            columns: ["custom_gpt_id"]
            isOneToOne: false
            referencedRelation: "custom_gpts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_gpt_memories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_gpts: {
        Row: {
          conversation_starters: Json | null
          created_at: string | null
          description: string | null
          id: string
          instructions: string
          is_active: boolean | null
          name: string
          reference_image_storage_path: string | null
          reference_image_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_starters?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructions: string
          is_active?: boolean | null
          name: string
          reference_image_storage_path?: string | null
          reference_image_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_starters?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructions?: string
          is_active?: boolean | null
          name?: string
          reference_image_storage_path?: string | null
          reference_image_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_gpts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deleted_users_blacklist: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          email: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          email: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      founding_users: {
        Row: {
          benefits_claimed: Json | null
          created_at: string | null
          id: string
          position: number
          user_id: string
        }
        Insert: {
          benefits_claimed?: Json | null
          created_at?: string | null
          id?: string
          position: number
          user_id: string
        }
        Update: {
          benefits_claimed?: Json | null
          created_at?: string | null
          id?: string
          position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "founding_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_credits: {
        Row: {
          created_at: string | null
          credits_left: number
          id: string
          ip_address: string
          is_exhausted: boolean | null
          max_generations: number | null
          total_generations: number | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          credits_left?: number
          id?: string
          ip_address: string
          is_exhausted?: boolean | null
          max_generations?: number | null
          total_generations?: number | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          credits_left?: number
          id?: string
          ip_address?: string
          is_exhausted?: boolean | null
          max_generations?: number | null
          total_generations?: number | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      images: {
        Row: {
          app: string
          created_at: string | null
          expires_at: string
          id: string
          is_deleted: boolean | null
          metadata: Json | null
          mode: string
          prompt: string
          storage_path: string
          user_id: string
        }
        Insert: {
          app?: string
          created_at?: string | null
          expires_at: string
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          mode: string
          prompt: string
          storage_path: string
          user_id: string
        }
        Update: {
          app?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          mode?: string
          prompt?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referral_credits_given: number | null
          referral_credits_received: number | null
          referred_user_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          referral_credits_given?: number | null
          referral_credits_received?: number | null
          referred_user_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          referral_credits_given?: number | null
          referral_credits_received?: number | null
          referred_user_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          content: string
          created_at: string | null
          featured: boolean | null
          id: string
          rating: number
          status: string | null
          title: string
          updated_at: string | null
          user_avatar_url: string | null
          user_email: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          content: string
          created_at?: string | null
          featured?: boolean | null
          id?: string
          rating: number
          status?: string | null
          title: string
          updated_at?: string | null
          user_avatar_url?: string | null
          user_email?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          content?: string
          created_at?: string | null
          featured?: boolean | null
          id?: string
          rating?: number
          status?: string | null
          title?: string
          updated_at?: string | null
          user_avatar_url?: string | null
          user_email?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          streak_rewards_claimed: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_rewards_claimed?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_rewards_claimed?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          credits_left: number | null
          email: string
          founding_badge_earned: boolean | null
          full_name: string | null
          id: string
          is_founding_user: boolean | null
          last_credit_reset: string | null
          last_daily_bonus_date: string | null
          referral_credits_earned: number | null
          referral_id: string | null
          referred_by: string | null
          total_credits_used: number | null
          updated_at: string | null
          user_tier: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          credits_left?: number | null
          email: string
          founding_badge_earned?: boolean | null
          full_name?: string | null
          id?: string
          is_founding_user?: boolean | null
          last_credit_reset?: string | null
          last_daily_bonus_date?: string | null
          referral_credits_earned?: number | null
          referral_id?: string | null
          referred_by?: string | null
          total_credits_used?: number | null
          updated_at?: string | null
          user_tier?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          credits_left?: number | null
          email?: string
          founding_badge_earned?: boolean | null
          full_name?: string | null
          id?: string
          is_founding_user?: boolean | null
          last_credit_reset?: string | null
          last_daily_bonus_date?: string | null
          referral_credits_earned?: number | null
          referral_id?: string | null
          referred_by?: string | null
          total_credits_used?: number | null
          updated_at?: string | null
          user_tier?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      postgrest_column_cache: {
        Row: {
          column_name: unknown | null
          comment: string | null
          data_type: string | null
          default_value: string | null
          is_generated: boolean | null
          is_identity: boolean | null
          is_nullable: boolean | null
          ordinal_position: number | null
          schema: unknown | null
          table_id: number | null
          table_name: unknown | null
        }
        Relationships: []
      }
      postgrest_function_cache: {
        Row: {
          hasvariadic: boolean | null
          proc_description: string | null
          proc_name: unknown | null
          proc_oid: unknown | null
          proc_schema: unknown | null
          provolatile: unknown | null
          rettype_is_setof: boolean | null
        }
        Relationships: []
      }
      postgrest_table_cache: {
        Row: {
          comment: string | null
          id: number | null
          name: unknown | null
          relkind: unknown | null
          replica_identity: string | null
          rls_enabled: boolean | null
          rls_forced: boolean | null
          schema: unknown | null
        }
        Relationships: []
      }
      timezone_cache: {
        Row: {
          abbrev: string | null
          is_dst: boolean | null
          name: string | null
          utc_offset: unknown | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_credits: {
        Args: {
          credits: number
          metadata?: Json
          transaction_type?: string
          user_id: string
        }
        Returns: Json
      }
      check_credits: {
        Args: { user_uuid: string }
        Returns: Json
      }
      create_clerk_user_profile: {
        Args: {
          clerk_user_id: string
          referral_code?: string
          user_avatar_url?: string
          user_email: string
          user_full_name?: string
        }
        Returns: Json
      }
      create_user_profile: {
        Args: {
          referral_code?: string
          user_avatar_url?: string
          user_email: string
          user_full_name?: string
        }
        Returns: Json
      }
      delete_expired_images: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_cache_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_function_info_fast: {
        Args: Record<PropertyKey, never>
        Returns: {
          is_set_returning: boolean
          proc_description: string
          proc_name: string
          proc_schema: string
        }[]
      }
      get_guest_credit_status: {
        Args: { ip_address: string }
        Returns: Json
      }
      get_table_columns_fast: {
        Args: { table_name_param: string }
        Returns: {
          column_name: string
          data_type: string
          default_value: string
          is_identity: boolean
          is_nullable: boolean
        }[]
      }
      get_table_info_fast: {
        Args: Record<PropertyKey, never>
        Returns: {
          column_count: number
          rls_enabled: boolean
          schema_name: string
          table_comment: string
          table_id: number
          table_name: string
        }[]
      }
      get_timezone_info: {
        Args: { tz_name?: string }
        Returns: {
          abbrev: string
          is_dst: boolean
          name: string
          utc_offset: unknown
        }[]
      }
      get_user_images: {
        Args: { user_uuid: string }
        Returns: {
          app: string
          created_at: string
          expires_at: string
          id: string
          metadata: Json
          mode: string
          prompt: string
          storage_path: string
        }[]
      }
      handle_daily_login_bonus: {
        Args: { user_id_param: string }
        Returns: Json
      }
      handle_streak_reward: {
        Args: { user_id_param: string }
        Returns: Json
      }
      purchase_credit_pack: {
        Args: { pack_uuid: string; user_uuid: string }
        Returns: Json
      }
      refresh_schema_caches: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      refresh_timezone_cache: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      reset_daily_credits: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      use_credits: {
        Args: { credits_to_use?: number; user_uuid: string }
        Returns: Json
      }
      use_credits_atomic: {
        Args: { credits_to_use?: number; user_uuid: string }
        Returns: Json
      }
      use_guest_credit: {
        Args: { p_ip_address: string }
        Returns: Json
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
