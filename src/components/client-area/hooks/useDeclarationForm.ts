
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { FormValues, mapIssueTypeToMondayFormat } from "../schema";
import { addWithMedia, sendToExternalService } from "@/services/declarationService";

interface UseDeclarationFormProps {
  form: UseFormReturn<FormValues>;
  onSuccess: () => void;
}

export const useDeclarationForm = ({ form, onSuccess }: UseDeclarationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const handleFileChange = (files: File[]) => {
    setMediaFiles(files);
  };

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
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
        urgency: "Média", // Value that matches Monday.com dropdown
        nif: values.nif,
      };
      
      // Add declaration to local storage with any attached media files
      const newDeclaration = await addWithMedia(declarationData, mediaFiles);
      console.log("Declaration saved locally:", newDeclaration);
      
      // Create a success toast for local storage
      toast.success("Declaração salva localmente", {
        description: "Sua declaração foi registrada em nosso sistema."
      });
      
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
            description: "Sua declaração foi salva localmente, mas não foi enviada para Monday.com. Nossa equipe irá processá-la manualmente."
          });
          console.error("Failed to send to Monday.com");
        }
      } catch (mondayError) {
        console.error("Error sending to Monday.com:", mondayError);
        toast.warning("Erro ao enviar para Monday.com", {
          description: "Sua declaração foi salva localmente, mas houve um erro ao enviá-la para Monday.com. Nossa equipe irá processá-la manualmente."
        });
      }
      
      // Even if Monday.com fails, we consider the form submission a success if the local storage worked
      form.reset();
      setMediaFiles([]);
      onSuccess();
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erro ao enviar", {
        description: "Ocorreu um erro ao enviar sua declaração. Por favor, tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    mediaFiles,
    handleFileChange,
    handleSubmit
  };
};
