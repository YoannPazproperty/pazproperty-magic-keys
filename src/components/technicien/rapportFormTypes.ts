
import { z } from "zod";

export const formSchema = z.object({
  categorieProbleme: z.string().min(1, "Veuillez sélectionner une catégorie"),
  description: z.string().min(10, "Veuillez fournir une description détaillée"),
  interventionNecessaire: z.boolean(),
  montantDevis: z.string().optional(),
  travauxRealises: z.string().optional(),
}).refine(data => {
  if (data.interventionNecessaire && (!data.travauxRealises || data.travauxRealises.length < 10)) {
    return false;
  }
  return true;
}, {
  message: "Veuillez décrire les travaux à réaliser (minimum 10 caractères)",
  path: ["travauxRealises"]
});

export type RapportFormValues = z.infer<typeof formSchema>;

export interface TechnicienRapportFormProps {
  interventionId: number;
  intervention: {
    id: number;
    date: string;
    client: string;
    adresse: string;
    telephone: string;
    email: string;
    probleme: string;
    description: string;
    statut: string;
  };
  onSubmitSuccess: () => void;
  onCancel: () => void;
}
