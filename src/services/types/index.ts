

export * from "./affaires";

export type CommercialContact = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  tipo: "Proprietario" | "Inquilino" | "Outros" | "Agente Imobiliario";
  mensagem: string;
  created_at: string;
};

// Export CommercialContact as Contact for compatibility with affaires types
export type Contact = CommercialContact;

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
