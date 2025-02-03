export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          created_at: string
          current_status: string | null
          details: string
          email: string | null
          id: string
          item_name: string
          previous_status: string | null
          room_number: string
          user_id: string | null
          username: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          current_status?: string | null
          details: string
          email?: string | null
          id?: string
          item_name: string
          previous_status?: string | null
          room_number: string
          user_id?: string | null
          username?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          current_status?: string | null
          details?: string
          email?: string | null
          id?: string
          item_name?: string
          previous_status?: string | null
          room_number?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      currentitem: {
        Row: {
          created_at: string
          id: string
          maintenance_count: number
          name: string
          quantity: number
          replacement_count: number
          room_number: string
          status: Database["public"]["Enums"]["item_status"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          maintenance_count?: number
          name: string
          quantity?: number
          replacement_count?: number
          room_number: string
          status?: Database["public"]["Enums"]["item_status"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          maintenance_count?: number
          name?: string
          quantity?: number
          replacement_count?: number
          room_number?: string
          status?: Database["public"]["Enums"]["item_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      itemhistory: {
        Row: {
          changed_at: string | null
          id: string
          item_id: string | null
          name: string
          quantity: number
          room_number: string
          status: Database["public"]["Enums"]["item_status"] | null
        }
        Insert: {
          changed_at?: string | null
          id?: string
          item_id?: string | null
          name: string
          quantity: number
          room_number: string
          status?: Database["public"]["Enums"]["item_status"] | null
        }
        Update: {
          changed_at?: string | null
          id?: string
          item_id?: string | null
          name?: string
          quantity?: number
          room_number?: string
          status?: Database["public"]["Enums"]["item_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "items_history_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "currentitem"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_check: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      count_items_by_room: {
        Args: Record<PropertyKey, never>
        Returns: {
          room_number: string
          total_count: number
          good_count: number
          maintenance_count: number
          replacement_count: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "faculty" | "it_office" | "property_custodian"
      item_status: "good" | "maintenance" | "low"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
