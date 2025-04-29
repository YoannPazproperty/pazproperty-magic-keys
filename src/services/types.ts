
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
  deleted_at?: string;
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
  mediaFiles: string[] | null;  // Changé de string à string[]
  submittedAt: string | null;
  status: "Novo" | "Transmitido" | "Orçamento recebido" | "Em curso de reparação" | "Resolvido";
  mondayId: string | null;
  prestador_id: string | null;
  prestador_assigned_at: string | null;
}

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
