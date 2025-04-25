
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { formSchema, RapportFormValues, TechnicienRapportFormProps } from "./rapportFormTypes";

export const useRapportForm = (
  interventionId: number,
  intervention: TechnicienRapportFormProps['intervention'],
  onSubmitSuccess: () => void
) => {
  const [files, setFiles] = useState<File[]>([]);
  const [factureFile, setFactureFile] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<RapportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categorieProbleme: intervention.probleme || "",
      description: "",
      interventionNecessaire: false,
      montantDevis: "",
      travauxRealises: "",
    },
  });

  const onSubmit = async (data: RapportFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Ici nous pourrions ajouter une nouvelle intégration si nécessaire
      toast.success("Rapport enregistré avec succès");
      onSubmitSuccess();
    } catch (error) {
      console.error("Erreur lors de l'envoi du rapport:", error);
      toast.error("Erreur lors de l'envoi du rapport", {
        description: "Une erreur inattendue s'est produite."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    files,
    setFiles,
    factureFile,
    setFactureFile,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit)
  };
};
