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
      affaires: {
        Row: {
          client_email: string | null
          client_nom: string
          client_telephone: string | null
          contact_id: string
          created_at: string
          date_paiement: string | null
          description: string | null
          honoraires_percus: number | null
          id: string
          notes: string | null
          remuneration_payee: number | null
          remuneration_prevue: number | null
          statut: string
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_nom: string
          client_telephone?: string | null
          contact_id: string
          created_at?: string
          date_paiement?: string | null
          description?: string | null
          honoraires_percus?: number | null
          id?: string
          notes?: string | null
          remuneration_payee?: number | null
          remuneration_prevue?: number | null
          statut?: string
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_nom?: string
          client_telephone?: string | null
          contact_id?: string
          created_at?: string
          date_paiement?: string | null
          description?: string | null
          honoraires_percus?: number | null
          id?: string
          notes?: string | null
          remuneration_payee?: number | null
          remuneration_prevue?: number | null
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affaires_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contactos_comerciais"
            referencedColumns: ["id"]
          },
        ]
      }
      company_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          level: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          level: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          level?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      company_users_old: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          email: string
          id: string
          level: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          email: string
          id: string
          level: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          id?: string
          level?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contactos_comerciais: {
        Row: {
          created_at: string
          email: string
          id: string
          mensagem: string
          nome: string
          telefone: string | null
          tipo: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          mensagem: string
          nome: string
          telefone?: string | null
          tipo: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          mensagem?: string
          nome?: string
          telefone?: string | null
          tipo?: string
        }
        Relationships: []
      }
      declaration_files: {
        Row: {
          declaration_id: string
          file_name: string
          file_path: string
          file_type: string
          id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          declaration_id: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          declaration_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "declaration_files_declaration_id_fkey"
            columns: ["declaration_id"]
            isOneToOne: false
            referencedRelation: "declarations"
            referencedColumns: ["id"]
          },
        ]
      }
      declarations: {
        Row: {
          city: string | null
          description: string | null
          email: string | null
          id: string
          issueType: string | null
          mediaFiles: string | null
          meeting_date: string | null
          meeting_notes: string | null
          mondayId: string | null
          name: string
          nif: string | null
          phone: string | null
          postalCode: string | null
          prestador_assigned_at: string | null
          prestador_id: string | null
          property: string | null
          quote_amount: number | null
          quote_approved: boolean | null
          quote_file_path: string | null
          quote_rejection_reason: string | null
          quote_response_date: string | null
          status: Database["public"]["Enums"]["declaration_status"] | null
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
          meeting_date?: string | null
          meeting_notes?: string | null
          mondayId?: string | null
          name: string
          nif?: string | null
          phone?: string | null
          postalCode?: string | null
          prestador_assigned_at?: string | null
          prestador_id?: string | null
          property?: string | null
          quote_amount?: number | null
          quote_approved?: boolean | null
          quote_file_path?: string | null
          quote_rejection_reason?: string | null
          quote_response_date?: string | null
          status?: Database["public"]["Enums"]["declaration_status"] | null
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
          meeting_date?: string | null
          meeting_notes?: string | null
          mondayId?: string | null
          name?: string
          nif?: string | null
          phone?: string | null
          postalCode?: string | null
          prestador_assigned_at?: string | null
          prestador_id?: string | null
          property?: string | null
          quote_amount?: number | null
          quote_approved?: boolean | null
          quote_file_path?: string | null
          quote_rejection_reason?: string | null
          quote_response_date?: string | null
          status?: Database["public"]["Enums"]["declaration_status"] | null
          submittedAt?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "declarations_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestadores_de_servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      historique_actions: {
        Row: {
          action: string
          affaire_id: string
          created_at: string
          date: string
          id: string
          notes: string | null
          utilisateur: string | null
        }
        Insert: {
          action: string
          affaire_id: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          utilisateur?: string | null
        }
        Update: {
          action?: string
          affaire_id?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          utilisateur?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historique_actions_affaire_id_fkey"
            columns: ["affaire_id"]
            isOneToOne: false
            referencedRelation: "affaires"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
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
      notification_logs: {
        Row: {
          declaration_id: string
          error_message: string | null
          id: string
          message_content: string
          notification_type: string
          recipient_email: string
          recipient_type: string
          sent_at: string | null
          success: boolean
        }
        Insert: {
          declaration_id: string
          error_message?: string | null
          id?: string
          message_content: string
          notification_type: string
          recipient_email: string
          recipient_type: string
          sent_at?: string | null
          success: boolean
        }
        Update: {
          declaration_id?: string
          error_message?: string | null
          id?: string
          message_content?: string
          notification_type?: string
          recipient_email?: string
          recipient_type?: string
          sent_at?: string | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_declaration_id_fkey"
            columns: ["declaration_id"]
            isOneToOne: false
            referencedRelation: "declarations"
            referencedColumns: ["id"]
          },
        ]
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
      notifications: {
        Row: {
          declaration_id: string | null
          email: string | null
          id: string
          sent_at: string
          status: string | null
          type: string
        }
        Insert: {
          declaration_id?: string | null
          email?: string | null
          id?: string
          sent_at?: string
          status?: string | null
          type: string
        }
        Update: {
          declaration_id?: string | null
          email?: string | null
          id?: string
          sent_at?: string
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_declaration_id_fkey"
            columns: ["declaration_id"]
            isOneToOne: false
            referencedRelation: "declarations"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      prestadores_de_servicos: {
        Row: {
          cidade: string | null
          codigo_postal: string | null
          created_at: string
          email: string
          empresa: string
          endereco: string | null
          id: string
          nif: string | null
          nome_gerente: string
          telefone: string | null
          tipo_de_obras: string
        }
        Insert: {
          cidade?: string | null
          codigo_postal?: string | null
          created_at?: string
          email: string
          empresa: string
          endereco?: string | null
          id?: string
          nif?: string | null
          nome_gerente: string
          telefone?: string | null
          tipo_de_obras: string
        }
        Update: {
          cidade?: string | null
          codigo_postal?: string | null
          created_at?: string
          email?: string
          empresa?: string
          endereco?: string | null
          id?: string
          nif?: string | null
          nome_gerente?: string
          telefone?: string | null
          tipo_de_obras?: string
        }
        Relationships: []
      }
      prestadores_de_servicos_old: {
        Row: {
          cidade: string | null
          codigo_postal: string | null
          created_at: string
          deleted_at: string
          email: string
          empresa: string
          endereco: string | null
          id: string
          nif: string | null
          nome_gerente: string
          telefone: string | null
          tipo_de_obras: string
        }
        Insert: {
          cidade?: string | null
          codigo_postal?: string | null
          created_at: string
          deleted_at?: string
          email: string
          empresa: string
          endereco?: string | null
          id: string
          nif?: string | null
          nome_gerente: string
          telefone?: string | null
          tipo_de_obras: string
        }
        Update: {
          cidade?: string | null
          codigo_postal?: string | null
          created_at?: string
          deleted_at?: string
          email?: string
          empresa?: string
          endereco?: string | null
          id?: string
          nif?: string | null
          nome_gerente?: string
          telefone?: string | null
          tipo_de_obras?: string
        }
        Relationships: []
      }
      prestadores_roles: {
        Row: {
          created_at: string
          id: string
          nivel: string
          prestador_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nivel?: string
          prestador_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nivel?: string
          prestador_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prestadores_roles_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "prestadores_de_servicos"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_company_user: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      create_password_reset_tokens_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      ensure_prestadores_roles: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      fix_confirmation_tokens: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      handle_password_reset: {
        Args: { email: string }
        Returns: boolean
      }
      has_role: {
        Args:
          | {
              _user_id: string
              _role: Database["public"]["Enums"]["user_role"]
            }
          | { _user_id: string; _role: string }
          | { role_name: string }
        Returns: boolean
      }
      is_company_email: {
        Args: { email: string }
        Returns: boolean
      }
      is_prestador: {
        Args: Record<PropertyKey, never> | { _user_id: string }
        Returns: boolean
      }
      lv_prestador: {
        Args: { _user_id: string }
        Returns: boolean
      }
      lv_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      lv_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      restore_provider: {
        Args: Record<PropertyKey, never> | { provider_id: string }
        Returns: boolean
      }
      set_auth_security_settings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      store_password_reset_token: {
        Args: {
          user_id_param: string
          token_param: string
          expires_at_param?: string
        }
        Returns: boolean
      }
      update_auth_security_settings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_auth_settings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      verify_password_reset_token: {
        Args: { token_param: string }
        Returns: {
          user_id: string
          user_email: string
        }[]
      }
      version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      declaration_status:
        | "Novo"
        | "Transmitido"
        | "Orçamento recebido"
        | "Em curso de reparação"
        | "Resolvido"
        | "Em espera do encontro de diagnostico"
        | "Encontramento de diagnostico planeado"
        | "Annulé"
      user_role: "admin" | "manager" | "user" | "provider"
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
    Enums: {
      declaration_status: [
        "Novo",
        "Transmitido",
        "Orçamento recebido",
        "Em curso de reparação",
        "Resolvido",
        "Em espera do encontro de diagnostico",
        "Encontramento de diagnostico planeado",
        "Annulé",
      ],
      user_role: ["admin", "manager", "user", "provider"],
    },
  },
} as const
