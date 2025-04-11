
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { FormValues, mapIssueTypeToMondayFormat } from "../schema";
import { addWithMedia, sendToExternalService } from "@/services/declarationService";
import { isSupabaseConnected, createBucketIfNotExists } from "@/services/supabaseService";

interface UseDeclarationFormProps {
  form: UseFormReturn<FormValues>;
  onSuccess: () => void;
}

export const useDeclarationForm = ({ form, onSuccess }: UseDeclarationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<boolean | null>(null);

  // Check Supabase connection status on load
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        console.log("useDeclarationForm: Checking Supabase connection on load...");
        
        // Try to create the declaration-media bucket if it doesn't exist yet
        console.log("useDeclarationForm: Creating bucket if it doesn't exist...");
        await createBucketIfNotExists('declaration-media');
        
        // Check Supabase connection
        const connected = await isSupabaseConnected();
        console.log("useDeclarationForm: Supabase connection status:", connected);
        setSupabaseStatus(connected);
        
        if (connected) {
          toast.success("Conectado ao Supabase", { 
            description: "Seus dados serão salvos na nuvem."
          });
        } else {
          toast.warning("Modo offline ativo", { 
            description: "Seus dados serão salvos localmente e sincronizados mais tarde."
          });
        }
      } catch (error) {
        console.error("useDeclarationForm: Error checking Supabase connection:", error);
        setSupabaseStatus(false);
        toast.error("Erro ao verificar conexão", { 
          description: "O aplicativo funcionará no modo offline."
        });
      }
    };
    
    checkSupabaseConnection();
  }, []);

  const handleFileChange = (files: File[]) => {
    console.log("useDeclarationForm: Files changed:", files);
    setMediaFiles(files);
  };

  const handleSubmit = async (values: FormValues) => {
    console.log("useDeclarationForm: Form submission started");
    setIsSubmitting(true);
    
    try {
      console.log("useDeclarationForm: Form data:", values);
      console.log("useDeclarationForm: Media files:", mediaFiles);
      
      // First, create/check bucket and verify connection before submission
      console.log("useDeclarationForm: Ensuring bucket exists before submission...");
      await createBucketIfNotExists('declaration-media');
      
      const currentSupabaseStatus = await isSupabaseConnected();
      setSupabaseStatus(currentSupabaseStatus);
      console.log("useDeclarationForm: Current Supabase connection before submission:", currentSupabaseStatus);
      
      // Prepare declaration data
      const fullAddress = `${values.addressLine1}${values.addressLine2 ? ', ' + values.addressLine2 : ''}`;
      const issueType = mapIssueTypeToMondayFormat(values.problemType);
      
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
      
      console.log("useDeclarationForm: Submitting declaration data:", declarationData);
      
      // Add declaration with media files
      const newDeclaration = await addWithMedia(declarationData, mediaFiles);
      console.log("useDeclarationForm: Declaration saved:", newDeclaration);
      
      // Send to Monday.com with improved error handling
      try {
        console.log("useDeclarationForm: Sending to Monday.com:", newDeclaration);
        const mondayResult = await sendToExternalService(newDeclaration);
        
        if (mondayResult) {
          toast.success("Enviado para Monday.com", {
            description: `ID: ${mondayResult}`
          });
          console.log("useDeclarationForm: Successfully sent to Monday.com with ID:", mondayResult);
        } else {
          toast.warning("Não enviado para Monday.com", {
            description: "Será processado manualmente pela equipe."
          });
          console.error("useDeclarationForm: Failed to send to Monday.com");
        }
      } catch (mondayError) {
        console.error("useDeclarationForm: Error sending to Monday.com:", mondayError);
        toast.warning("Erro ao enviar para Monday.com", {
          description: "Será processado manualmente pela equipe."
        });
      }
      
      // Reset form and media files
      form.reset();
      setMediaFiles([]);
      
      // Trigger success callback with delay to ensure states are updated
      console.log("useDeclarationForm: Triggering onSuccess with 500ms delay...");
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess();
        console.log("useDeclarationForm: onSuccess executed");
      }, 500);
      
    } catch (error) {
      console.error("useDeclarationForm: Error submitting form:", error);
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
