
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePasswordSettingsState = (user: User | null) => {
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isPasswordChangeRequired, setIsPasswordChangeRequired] = useState(false);
  
  // Check if user hasn't set a password yet
  useEffect(() => {
    // If user just registered and hasn't set a password yet
    // Or if user is coming from a password reset
    if (user && user.user_metadata) {
      const metadata = user.user_metadata;
      console.log("User metadata in ExtranetTechnique:", metadata);
      
      if (metadata.first_login || metadata.password_reset_required) {
        console.log("Password change required based on metadata:", metadata);
        setIsPasswordChangeRequired(true);
        setIsSettingsDialogOpen(true);
        
        // Display a toast message to inform the user
        if (metadata.first_login) {
          toast.info("Bem-vindo ao Extranet Técnica!", {
            description: "Por favor, defina uma nova senha para continuar."
          });
        } else {
          toast.info("Redefinição de senha necessária", {
            description: "Por favor, atualize sua senha para continuar."
          });
        }
      }
    }
  }, [user]);
  
  // Handle dialog close attempt
  const handleDialogOpenChange = (open: boolean) => {
    // If password change is required, don't allow closing the dialog
    if (isPasswordChangeRequired && !open) {
      toast.warning("Alteração de senha necessária", {
        description: "Você deve alterar sua senha antes de continuar."
      });
      return;
    }
    
    setIsSettingsDialogOpen(open);
  };
  
  // Handle successful password change
  const handlePasswordChangeSuccess = async () => {
    try {
      console.log("Processando sucesso de alteração de senha...");
      
      // Update user metadata to remove password reset flags
      const updateResult = await supabase.auth.updateUser({
        data: {
          first_login: false,
          password_reset_required: false,
          password_reset_at: new Date().toISOString()
        }
      });
      
      console.log("Resultado da atualização de metadados após alteração de senha:", updateResult);
      
      if (updateResult.error) {
        console.error("Erro ao atualizar metadados após alteração de senha:", updateResult.error);
        // Warn but continue
        toast.warning("Aviso", {
          description: "A senha foi alterada, mas houve um erro ao atualizar os metadados do usuário."
        });
      }
      
      // Verify the user session and metadata after update
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Sessão após atualização de senha:", sessionData);
      
      setIsPasswordChangeRequired(false);
      setIsSettingsDialogOpen(false);
      
      toast.success("Senha alterada com sucesso", {
        description: "Você agora pode acessar todas as funcionalidades."
      });
    } catch (error) {
      console.error("Erro ao atualizar metadados após alteração de senha:", error);
      // Allow the user to continue even if metadata update fails
      setIsPasswordChangeRequired(false);
      setIsSettingsDialogOpen(false);
      
      toast.warning("Aviso", {
        description: "A senha foi alterada, mas houve um erro ao finalizar o processo."
      });
    }
  };

  return {
    isSettingsDialogOpen,
    isPasswordChangeRequired,
    handleDialogOpenChange,
    handlePasswordChangeSuccess,
    setIsSettingsDialogOpen
  };
};
