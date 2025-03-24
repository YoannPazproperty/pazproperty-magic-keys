
import { z } from "zod";

export const formSchema = z.object({
  nif: z.string().min(1, {
    message: "NIF é obrigatório.",
  }),
  firstName: z.string().min(1, {
    message: "Nome é obrigatório.",
  }),
  lastName: z.string().min(1, {
    message: "Sobrenome é obrigatório.",
  }),
  telefone: z.string().min(9, {
    message: "Insira um número de telefone válido.",
  }),
  email: z.string().email({
    message: "Insira um endereço de email válido.",
  }),
  confirmEmail: z.string().email({
    message: "Insira um endereço de email válido.",
  }),
  addressLine1: z.string().min(1, {
    message: "Endereço é obrigatório.",
  }),
  addressLine2: z.string().optional(),
  city: z.string().min(1, {
    message: "Cidade é obrigatória.",
  }),
  state: z.string().min(1, {
    message: "Estado/Província/Região é obrigatório.",
  }),
  postalCode: z.string().min(1, {
    message: "Código postal é obrigatório.",
  }),
  problemType: z.enum(["canalização", "eletricidade", "predial", "outro"], {
    message: "Selecione um tipo de problema.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Os emails não correspondem",
  path: ["confirmEmail"],
});

export type FormValues = z.infer<typeof formSchema>;

export const mapIssueTypeToMondayFormat = (problemType: string): string => {
  const mapping: Record<string, string> = {
    "canalização": "plomberie",
    "eletricidade": "electricite",
    "predial": "menuiserie",
    "outro": "other"
  };
  
  return mapping[problemType] || problemType;
};
