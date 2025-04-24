
export interface ProviderInviteRequest {
  providerId: string;
}

export interface ProviderData {
  id: string;
  empresa: string;
  tipo_de_obras: string;
  nome_gerente: string;
  telefone: string | null;
  email: string;
  endereco: string | null;
  codigo_postal: string | null;
  cidade: string | null;
  nif: string | null;
}

export interface ProcessResult {
  success: boolean;
  error?: string;
  details?: any;
}
