
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { FormValues, mapIssueTypeToMondayFormat } from "../schema";
import { addWithMedia, sendToExternalService } from "@/services/declarationService";
import { isSupabaseConnected, isStorageConnected } from "@/services/supabaseService";

interface ConnectionStatus {
  initialized: boolean;
  database: boolean;
  storage: boolean;
}

interface UseDeclarationFormProps {
  form: UseFormReturn<FormValues>;
  onSuccess: () => void;
  connectionStatus?: ConnectionStatus;
}

export const useDeclarationForm = ({ form, onSuccess, connectionStatus }: UseDeclarationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    database: boolean;
    storage: boolean;
  } | null>(connectionStatus ? {
    database: connectionStatus.database,
    storage: connectionStatus.storage
  } : null);

  // Update local state when connectionStatus changes
  useEffect(() => {
    if (connectionStatus) {
      setSupabaseStatus({
        database: connectionStatus.database,
        storage: connectionStatus.storage
      });
    }
  }, [connectionStatus]);

  // Check Supabase connection status on load if not provided
  useEffect(() => {
    if (!connectionStatus) {
      const checkSupabaseConnection = async () => {
        try {
          console.log("useDeclarationForm: Checking Supabase connection on load...");
          
          // Check database connection
          const dbConnected = await isSupabaseConnected();
          console.log("useDeclarationForm: Database connection status:", dbConnected);
          
          // Check storage connection
          const storageConnected = await isStorageConnected();
          console.log("useDeclarationForm: Storage connection status:", storageConnected);
          
          setSupabaseStatus({
            database: dbConnected,
            storage: storageConnected
          });
          
          if (dbConnected && storageConnected) {
            toast.success("Conectado ao Supabase", { 
              description: "Banco de dados e armazenamento operacionais."
            });
          } else if (dbConnected) {
            toast.info("Conectado parcialmente ao Supabase", { 
              description: "Banco de dados conectado, armazenamento pode estar limitado."
            });
          } else {
            toast.error("Erro de conexão", { 
              description: "Não é possível usar o aplicativo sem conexão ao Supabase."
            });
          }
        } catch (error) {
          console.error("useDeclarationForm: Error checking Supabase connection:", error);
          setSupabaseStatus({
            database: false,
            storage: false
          });
          toast.error("Erro ao verificar conexão", { 
            description: "Não é possível usar o aplicativo sem conexão ao Supabase."
          });
        }
      };
      
      checkSupabaseConnection();
    }
  }, [connectionStatus]);

  const handleFileChange = (files: File[]) => {
    console.log("useDeclarationForm: Files changed:", files);
    setMediaFiles(files);
  };

  const handleSubmit = async (values: FormValues) => {
    console.log("useDeclarationForm: Form submission started");
    setIsSubmitting(true);
    
    try {
      // Vérifier si Supabase est connecté avant de soumettre
      if (!supabaseStatus?.database || !supabaseStatus?.storage) {
        toast.error("Sem conexão ao Supabase", { 
          description: "Não é possível enviar o formulário sem conexão ao Supabase."
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("useDeclarationForm: Form data:", values);
      console.log("useDeclarationForm: Media files:", mediaFiles);
      console.log("useDeclarationForm: Supabase status:", supabaseStatus);
      
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
        mediaFiles: null,        // Ajout des champs manquants
        mondayId: null,          // avec des valeurs null par défaut
        prestador_id: null,      // pour satisfaire le type
        prestador_assigned_at: null
      };
      
      console.log("useDeclarationForm: Submitting declaration data:", declarationData);
      
      try {
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
      } catch (declarationError) {
        console.error("useDeclarationForm: Error creating declaration:", declarationError);
        setIsSubmitting(false);
      }
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
