
export interface ContactFormData {
  nome: string;
  email: string;
  telefone: string | null;
  tipo: string;
  mensagem: string;
}

export interface ProcessResult {
  success: boolean;
  error?: string;
  details?: any;
}
