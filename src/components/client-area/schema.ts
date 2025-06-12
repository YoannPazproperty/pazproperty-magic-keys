import { z } from "zod";

export const declarationFormSchema = z
  .object({
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
    postalCode: z.string().min(1, {
      message: "Código postal é obrigatório.",
    }),
    problemType: z.enum(["canalização", "eletricidade", "predial", "outro"], {
      message: "Selecione um tipo de problema.",
    }),
    description: z.string().min(10, {
      message: "A descrição deve ter pelo menos 10 caracteres.",
    }),
    urgency: z.enum(["low", "medium", "high", "emergency"], {
      message: "Selecione um nível de urgência.",
    }),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: "Os emails não correspondem",
    path: ["confirmEmail"],
  });
