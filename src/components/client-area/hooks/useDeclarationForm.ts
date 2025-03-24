
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
      
      const declarationData = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.telefone,
        property: fullAddress,
        city: values.city,
        postalCode: values.postalCode,
        issueType: mapIssueTypeToMondayFormat(values.problemType),
        description: values.description,
        urgency: "medium", // Default urgency as it's not in the form
        nif: values.nif,
      };
      
      const newDeclaration = await addWithMedia(declarationData, mediaFiles);
      console.log("Declaration saved locally:", newDeclaration);
      
      // Always attempt to send to Monday without config check
      try {
        console.log("Sending declaration to Monday:", newDeclaration);
        const mondayResult = await sendToExternalService(newDeclaration);
        
        if (mondayResult) {
          toast.success("Declaração enviada para Monday.com", {
            description: "Sua declaração foi registrada com sucesso no nosso sistema."
          });
        } else {
          toast.error("Erro na integração com Monday.com", {
            description: "Sua declaração foi salva localmente, mas não foi enviada para Monday.com."
          });
        }
      } catch (error) {
        console.error("Error sending to Monday.com:", error);
        toast.error("Erro ao enviar para Monday.com", {
          description: "Sua declaração foi salva localmente, mas houve um erro ao enviá-la para Monday.com."
        });
      }
      
      form.reset();
      setMediaFiles([]);
      onSuccess();
      
      toast.success("Declaração enviada com sucesso!", {
        description: "Entraremos em contato em breve sobre o seu problema."
      });
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
