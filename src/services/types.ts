
/**
 * Types globaux pour les déclarations, notifications et affaires
 */

// --- Statuts de déclaration normalisés
export type DeclarationStatus =
  | "NEW"
  | "TRANSMITTED"
  | "AWAITING_DIAGNOSTIC"
  | "DIAGNOSTIC_SCHEDULED"
  | "CANCELLED"
  | "QUOTE_RECEIVED"
  | "IN_REPAIR"
  | "RESOLVED"
  | "Novo"
  | "Transmitido"
  | "Orçamento recebido"
  | "Em curso de reparação"
  | "Resolvido"
  | "Em espera do encontro de diagnostico"
  | "Encontramento de diagnostico planeado"
  | "Annulé"
  | string;

// --- Prestataires de services
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
  tipo_de_obras: "Eletricidade" | "Canalização" | "Alvenaria" | "Caixilharias" | "Obras gerais" | string;
  created_at?: string;
  deleted_at?: string | null;
}

// --- Déclarations de sinistre
export interface Declaration {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  property?: string | null;
  city?: string | null;
  postalCode?: string | null;
  status: DeclarationStatus;
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
  quote_response_date?: string | null;
  submittedAt?: string | null;
  mondayId?: string | null;
  nif?: string | null;
}

// --- Fichiers liés aux déclarations
export type DeclarationFile = {
  id: string;
  declaration_id: string;
  file_path: string;
  file_type: "quote" | "image" | "video" | string;
  file_name: string;
  uploaded_at?: string | null;
  uploaded_by?: string | null;
};

// --- Contacts commerciaux
export interface CommercialContact {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  tipo: "Proprietario" | "Inquilino" | "Outros" | "Agente Imobiliario" | string;
  mensagem: string;
  created_at: string;
}

// --- Préférences de notification
export interface NotificationPreference {
  id: string;
  email: boolean;
  push: boolean | null;
  sms: boolean | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
}

// --- Logs de notification
export type NotificationLog = {
  id: string;
  declaration_id: string;
  notification_type: string;
  recipient_email?: string | null;
  recipient_type?: string | null;
  sent_at: string;
  success?: boolean;
  error_message?: string | null;
  message_content?: string | null;
  // Legacy properties for backward compatibility
  email?: string | null;
  type?: string;
  status?: string | null;
};

// --- Rapports techniciens
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

// --- Types et constantes AFFAIRE ---
// Statut unique et centralisé pour toutes les affaires métiers
export type StatutAffaire =
  | "Initial"
  | "En discussion"
  | "Proposition faite"
  | "Contrat signé"
  | "En cours"
  | "Achevé"
  | "Annulé"
  | string;

export const STATUTS_AFFAIRES: StatutAffaire[] = [
  "Initial",
  "En discussion",
  "Proposition faite",
  "Contrat signé",
  "En cours",
  "Achevé",
  "Annulé"
];

// --- Affaire
export interface Affaire {
  id: string;
  contact_id: string;
  client_nom: string;
  client_email: string | null;
  client_telephone: string | null;
  description: string | null;
  statut: StatutAffaire;
  honoraires_percus: number | null;
  remuneration_prevue: number | null;
  remuneration_payee: number | null;
  date_paiement: string | null;
  notes: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AffaireFormData {
  contact_id: string;
  client_nom: string;
  client_email: string | null;
  client_telephone: string | null;
  description: string | null;
  statut: StatutAffaire;
  honoraires_percus: number | null;
  remuneration_prevue: number | null;
  remuneration_payee: number | null;
  date_paiement: string | null;
  notes: string | null;
}

export interface HistoriqueAction {
  id: string;
  affaire_id: string;
  action: string;
  date: string;
  utilisateur: string | null;
  notes: string | null;
}

export interface HistoriqueActionFormData {
  affaire_id: string;
  action: string;
  date: string;
  utilisateur: string | null;
  notes: string | null;
}

// --- Fonction notification email mock (laisse-la ici pour la compatibilité)
export const sendNotificationEmail = async (
  to: string,
  subject: string,
  content: string
): Promise<boolean> => {
  console.log(`Sending email to ${to} with subject ${subject}`);
  return true;
};
