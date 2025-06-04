
import { z } from "zod";
import type { ServiceProvider } from "../../../services/types";

export const providerFormSchema = z.object({
  empresa: z.string().min(1, { message: "Empresa é obrigatória" }),
  tipo_de_obras: z.enum(["Eletricidade", "Canalização", "Alvenaria", "Caixilharias", "Obras gerais"]),
  nome_gerente: z.string().min(1, { message: "Nome do gerente é obrigatório" }),
  telefone: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }),
  endereco: z.string().optional(),
  codigo_postal: z.string().optional(),
  cidade: z.string().optional(),
  nif: z.string().optional(),
});

export type ProviderFormValues = z.infer<typeof providerFormSchema>;

export interface ServiceProviderFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  providerToEdit?: ServiceProvider;
  selectedProvider?: ServiceProvider;
}
