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
      declarations: {
        Row: {
          city: string | null
          description: string | null
          email: string | null
          id: string
          issueType: string | null
          mediaFiles: string | null
          mondayId: string | null
          name: string
          nif: string | null
          phone: string | null
          postalCode: string | null
          property: string | null
          status: string | null
          submittedAt: string | null
          urgency: string | null
        }
        Insert: {
          city?: string | null
          description?: string | null
          email?: string | null
          id: string
          issueType?: string | null
          mediaFiles?: string | null
          mondayId?: string | null
          name: string
          nif?: string | null
          phone?: string | null
          postalCode?: string | null
          property?: string | null
          status?: string | null
          submittedAt?: string | null
          urgency?: string | null
        }
        Update: {
          city?: string | null
          description?: string | null
          email?: string | null
          id?: string
          issueType?: string | null
          mediaFiles?: string | null
          mondayId?: string | null
          name?: string
          nif?: string | null
          phone?: string | null
          postalCode?: string | null
          property?: string | null
          status?: string | null
          submittedAt?: string | null
          urgency?: string | null
        }
        Relationships: []
      }
      media_files: {
        Row: {
          createdAt: string | null
          declarationId: string | null
          id: string
          name: string
          type: string | null
          url: string | null
        }
        Insert: {
          createdAt?: string | null
          declarationId?: string | null
          id?: string
          name: string
          type?: string | null
          url?: string | null
        }
        Update: {
          createdAt?: string | null
          declarationId?: string | null
          id?: string
          name?: string
          type?: string | null
          url?: string | null
        }
        Relationships: []
      }
      monday_configs: {
        Row: {
          apiKey: string
          boardId: string | null
          eventosGroupId: string | null
          id: string
          techBoardId: string | null
        }
        Insert: {
          apiKey: string
          boardId?: string | null
          eventosGroupId?: string | null
          id?: string
          techBoardId?: string | null
        }
        Update: {
          apiKey?: string
          boardId?: string | null
          eventosGroupId?: string | null
          id?: string
          techBoardId?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          email: boolean
          id: string
          push: boolean | null
          recipientEmail: string | null
          recipientPhone: string | null
          sms: boolean | null
        }
        Insert: {
          email: boolean
          id?: string
          push?: boolean | null
          recipientEmail?: string | null
          recipientPhone?: string | null
          sms?: boolean | null
        }
        Update: {
          email?: boolean
          id?: string
          push?: boolean | null
          recipientEmail?: string | null
          recipientPhone?: string | null
          sms?: boolean | null
        }
        Relationships: []
      }
      technician_reports: {
        Row: {
          address: string | null
          clientEmail: string | null
          clientName: string
          clientPhone: string | null
          date: string | null
          diagnoseDescription: string | null
          estimateAmount: string | null
          interventionId: number
          needsIntervention: boolean | null
          problemCategory: string | null
          workDescription: string | null
        }
        Insert: {
          address?: string | null
          clientEmail?: string | null
          clientName: string
          clientPhone?: string | null
          date?: string | null
          diagnoseDescription?: string | null
          estimateAmount?: string | null
          interventionId?: number
          needsIntervention?: boolean | null
          problemCategory?: string | null
          workDescription?: string | null
        }
        Update: {
          address?: string | null
          clientEmail?: string | null
          clientName?: string
          clientPhone?: string | null
          date?: string | null
          diagnoseDescription?: string | null
          estimateAmount?: string | null
          interventionId?: number
          needsIntervention?: boolean | null
          problemCategory?: string | null
          workDescription?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
