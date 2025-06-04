
import { z } from "zod";
import type { CompanyUserLevel } from "../../../../services/admin/company-users/types";

export const userFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  level: z.enum(["admin", "user"] as const),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

export const validateForm = (data: any): { isValid: boolean; errors: string[] } => {
  try {
    userFormSchema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => err.message)
      };
    }
    return {
      isValid: false,
      errors: ['Erreur de validation inconnue']
    };
  }
};
