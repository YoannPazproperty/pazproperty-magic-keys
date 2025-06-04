
import { z } from "zod";
import type { CompanyUserLevel } from "../../../../services/admin/company-users/types";

export const userFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  level: z.enum(["admin", "user"] as const),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;
