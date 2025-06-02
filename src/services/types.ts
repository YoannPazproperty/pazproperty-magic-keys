
/**
 * Types globaux pour les déclarations et notifications
 */

// Structure d'une déclaration (extrait, à compléter selon projet réel)
export interface Declaration {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  property?: string | null;
  city?: string | null;
  postalCode?: string | null;
  status: string;
  issueType?: string | null;
  description?: string | null;
  urgency?: string | null;
  mediaFiles?: string[] | null;
  prestador_id?: string | null;
  prestador_assigned_at?: string | null;
  meeting_date?: string | null;
  meeting_notes?: string | null;
  quote_amount?: number | null;
  quote_approved?: boolean | null;
  quote_rejection_reason?: string | null;
  quote_file_path?: string | null;
  submittedAt?: string | null;
}

// Type pour une notification logguée (localStorage ou Supabase)
export interface NotificationLog {
  id?: string;
  declaration_id: string;
  type?: string;
  status?: string;
  email?: string;
  message_content?: string;
  recipient_email?: string;
  recipient_type?: string;
  sent_at?: string;
  success?: boolean;
  error_message?: string;
}

export type ServiceProvider = {
  id: string;
  empresa: string;
  nome_gerente: string;
  tipo_de_obras: string;
  telefone?: string | null;
  email?: string | null;
};

export type UserRole =
  | "admin"
  | "manager"
  | "user"
  | "provider"
  | "customer"
  | "employee";
