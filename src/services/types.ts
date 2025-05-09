
// Types pour les prestataires de services
export interface ServiceProvider {
  id: string;
  empresa: string;
  nome_gerente: string;
  email: string;
  telefone?: string | null;
  cidade?: string | null;
  endereco?: string | null;
  codigo_postal?: string | null;
  nif?: string | null;
  tipo_de_obras: "Eletricidade" | "Canalização" | "Alvenaria" | "Caixilharias" | "Obras gerais";
  created_at: string;
  deleted_at?: string | null;
}

// Types pour les déclarations
export interface Declaration {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  nif: string | null;
  property: string | null;
  city: string | null;
  postalCode: string | null;
  issueType: string | null;
  urgency: string | null;
  description: string | null;
  mediaFiles: string[] | null;
  submittedAt: string | null;
  status: "Novo" | "Em espera do encontro de diagnostico" | "Encontramento de diagnostico planeado" | "Orçamento recebido" | "Em curso de reparação" | "Resolvido" | "Annulé" | "Transmitido";
  mondayId: string | null;
  prestador_id: string | null;
  prestador_assigned_at: string | null;
  meeting_date?: string | null;
  meeting_notes?: string | null;
  quote_file_path?: string | null;
  quote_amount?: number | null;
  quote_approved?: boolean | null;
  quote_rejection_reason?: string | null;
  quote_response_date?: string | null;
}

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

// Types pour les contacts commerciaux
export interface CommercialContact {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  tipo: "Proprietario" | "Inquilino" | "Outros" | "Agente Imobiliario";
  mensagem: string;
  created_at: string;
}

// Type pour les préférences de notification
export interface NotificationPreference {
  id: string;
  email: boolean;
  push: boolean | null;
  sms: boolean | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
}

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

// Types pour les rapports techniciens
export interface TechnicianReport {
  interventionId: number;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  address: string | null;
  needsIntervention: boolean | null;
  problemCategory: string | null;
  diagnoseDescription: string | null;
  estimateAmount: string | null;
  workDescription: string | null;
  date: string | null;
}

export interface TechnicianReportResult {
  success: boolean;
  message: string;
  reportId?: string;
}

// Fonction pour envoyer des notifications par email - updated to match usage
export const sendNotificationEmail = async (
  to: string, 
  subject: string, 
  content: string
): Promise<boolean> => {
  // Cette fonction est un placeholder, elle sera implémentée ailleurs
  console.log(`Sending email to ${to} with subject ${subject}`);
  return true;
};

// N'effacer pas le bloc de commentaire suivant, c'est important pour le fonctionnement du type d'extension
// Ce fichier n'étant pas disponible en édition directe, nous allons ajouter une définition de type pour deleted_at

// Extension du type ServiceProvider pour inclure le champ deleted_at
declare module '@/services/types' {
  interface ServiceProvider {
    deleted_at?: string;
  }
}
