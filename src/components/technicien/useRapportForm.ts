
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { formSchema, RapportFormValues, TechnicienRapportFormProps } from "./rapportFormTypes";
import { sendTechnicianReportToMonday } from "@/services/declarationService";

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
      const reportData = {
        interventionId,
        clientName: intervention.client,
        clientEmail: intervention.email,
        clientPhone: intervention.telephone,
        address: intervention.adresse,
        problemCategory: data.categorieProbleme,
        diagnoseDescription: data.description,
        needsIntervention: data.interventionNecessaire,
        estimateAmount: data.montantDevis || "0",
        workDescription: data.travauxRealises || "",
        date: new Date().toISOString(),
      };

      const result = await sendTechnicianReportToMonday(reportData);
      
      if (result.success) {
        toast.success("Rapport envoyé à Monday.com", {
          description: `ID de l'élément créé: ${result.mondayItemId}`
        });
        onSubmitSuccess();
      } else {
        toast.error("Erreur lors de l'envoi à Monday.com", {
          description: result.message
        });
      }
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
