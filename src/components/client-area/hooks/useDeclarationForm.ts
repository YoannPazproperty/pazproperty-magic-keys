
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { FormValues, mapIssueTypeToMondayFormat } from "../schema";
import { addWithMedia, sendToExternalService } from "@/services/declarationService";
import { isSupabaseConnected } from "@/services/supabaseService";

interface UseDeclarationFormProps {
  form: UseFormReturn<FormValues>;
  onSuccess: () => void;
}

export const useDeclarationForm = ({ form, onSuccess }: UseDeclarationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<boolean | null>(null);

  // Vérifier l'état de la connexion Supabase au chargement
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        console.log("Vérification de la connexion Supabase au chargement...");
        const connected = await isSupabaseConnected();
        console.log("État de la connexion Supabase:", connected);
        setSupabaseStatus(connected);
      } catch (error) {
        console.error("Erreur lors de la vérification de la connexion Supabase:", error);
        setSupabaseStatus(false);
      }
    };
    
    checkSupabaseConnection();
  }, []);

  const handleFileChange = (files: File[]) => {
    setMediaFiles(files);
  };

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    console.log("Début de soumission du formulaire...");
    
    try {
      console.log("Form data:", values);
      console.log("Media files:", mediaFiles);
      
      const fullAddress = `${values.addressLine1}${values.addressLine2 ? ', ' + values.addressLine2 : ''}`;
      
      // Make sure to map the problem type correctly according to Monday.com format
      const issueType = mapIssueTypeToMondayFormat(values.problemType);
      
      // Prepare data matching the Monday.com column structure
      const declarationData = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.telefone,
        property: fullAddress,
        city: values.city,
        postalCode: values.postalCode,
        issueType: issueType,
        description: values.description,
        urgency: values.urgency,
        nif: values.nif,
      };
      
      console.log("Tentative d'enregistrement de la déclaration...");
      console.log("Données à enregistrer:", declarationData);
      
      // Vérifier à nouveau l'état de connexion Supabase avant d'envoyer
      const currentSupabaseStatus = await isSupabaseConnected();
      setSupabaseStatus(currentSupabaseStatus);
      console.log("État de connexion Supabase avant l'envoi:", currentSupabaseStatus);
      
      // Add declaration to local storage with any attached media files
      const newDeclaration = await addWithMedia(declarationData, mediaFiles);
      console.log("Declaration saved:", newDeclaration);
      
      // Create a success toast based on where it was saved
      if (currentSupabaseStatus) {
        toast.success("Declaração salva com sucesso", {
          description: "Sua declaração foi registrada em nosso sistema."
        });
      } else {
        toast.success("Declaração salva localmente", {
          description: "Sua declaração foi registrada localmente. Será sincronizada quando a conexão estiver disponível."
        });
      }
      
      // Send to Monday.com with improved error handling
      try {
        console.log("Sending declaration to Monday:", newDeclaration);
        const mondayResult = await sendToExternalService(newDeclaration);
        
        if (mondayResult) {
          toast.success("Declaração enviada para Monday.com", {
            description: `Sua declaração foi registrada no Monday.com (ID: ${mondayResult})`
          });
          console.log("Successfully sent to Monday.com with ID:", mondayResult);
        } else {
          toast.warning("Declaração não enviada para Monday.com", {
            description: "Sua declaração foi salva, mas não foi enviada para Monday.com. Nossa equipe irá processá-la manualmente."
          });
          console.error("Failed to send to Monday.com");
        }
      } catch (mondayError) {
        console.error("Error sending to Monday.com:", mondayError);
        toast.warning("Erro ao enviar para Monday.com", {
          description: "Sua declaração foi salva, mas houve um erro ao enviá-la para Monday.com. Nossa equipe irá processá-la manualmente."
        });
      }
      
      console.log("Formulaire soumis avec succès, préparation pour appel de onSuccess...");
      
      // Réinitialiser le formulaire
      form.reset();
      setMediaFiles([]);
      
      // Utiliser un délai pour s'assurer que les états sont bien mis à jour avant de déclencher onSuccess
      console.log("Déclenchement de onSuccess avec un délai de 500ms...");
      setTimeout(() => {
        setIsSubmitting(false); // S'assurer que isSubmitting est false avant d'appeler onSuccess
        onSuccess();
        console.log("onSuccess exécuté");
      }, 500);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erro ao enviar", {
        description: "Ocorreu um erro ao enviar sua declaração. Por favor, tente novamente."
      });
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    mediaFiles,
    handleFileChange,
    handleSubmit,
    supabaseStatus
  };
};
