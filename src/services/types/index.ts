

// First export the basic types
export type CommercialContact = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  tipo: "Proprietario" | "Inquilino" | "Outros" | "Agente Imobiliario";
  mensagem: string;
  created_at: string;
};

// Then export the alias for backward compatibility
export type Contact = CommercialContact;

// Then export other types
export interface ServiceProvider {
  id: string;
  empresa: string;
  nome_gerente: string;
  tipo_de_obras: string;
  email: string;
  telefone: string | null;
  cidade: string | null;
  endereco?: string | null;
  codigo_postal?: string | null;
  nif?: string | null;
  created_at: string;
  deleted_at?: string | null;
};

// Updated Declaration type with all required properties and status values
export type Declaration = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  property: string | null;
  postalCode: string | null;
  city: string | null;
  description: string | null;
  issueType: string | null;
  urgency: string | null;
  nif: string | null;
  mediaFiles: string[] | null;
  status: "Novo" | "Em espera do encontro de diagnostico" | "Encontramento de diagnostico planeado" | "Orçamento recebido" | "Em curso de reparação" | "Resolvido" | "Annulé" | "Transmitido" | null;
  submittedAt: string | null;
  mondayId?: string | null;
  prestador_id?: string | null;
  prestador_assigned_at?: string | null;
  // Additional fields
  meeting_date?: string | null;
  meeting_notes?: string | null;
  quote_file_path?: string | null;
  quote_amount?: number | null;
  quote_approved?: boolean | null;
  quote_rejection_reason?: string | null;
  quote_response_date?: string | null;
};

// Type for files related to declarations
export type DeclarationFile = {
  id: string;
  declaration_id: string;
  file_path: string;
  file_type: "quote" | "image" | "video" | string;
  file_name: string;
  uploaded_at: string;
  uploaded_by?: string | null;
};

// Type for notification logs
export type NotificationLog = {
  id: string;
  declaration_id: string;
  notification_type: string;
  recipient_email: string;
  recipient_type: "provider" | "tenant" | "admin";
  sent_at: string;
  success: boolean;
  error_message?: string | null;
  message_content: string;
};

// Export affaires types after defining the basic types to avoid circular dependencies
export * from "./affaires";

