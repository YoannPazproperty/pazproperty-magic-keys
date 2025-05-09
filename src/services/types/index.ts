
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
  created_at?: string;
}

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
  mediaFiles: string[] | null; // URLs des fichiers médias
  status: "Novo" | "Transmitido" | "Orçamento recebido" | "Em curso de reparação" | "Resolvido" | null;
  submittedAt: string | null;
  mondayId?: string | null;
  prestador_id?: string | null;
  prestador_assigned_at?: string | null;
};

// Export affaires types after defining the basic types to avoid circular dependencies
export * from "./affaires";
