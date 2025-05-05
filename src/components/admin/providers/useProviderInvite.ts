
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProviderInvite = () => {
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [emailError, setEmailError] = useState<{ message: string, code: string } | null>(null);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [technicalError, setTechnicalError] = useState<string | null>(null);

  const sendProviderInvite = async (providerId: string): Promise<{
    success: boolean;
    emailSent: boolean;
    emailError: { message: string, code: string } | null;
    isNewUser?: boolean;
    message?: string;
  }> => {
    if (!providerId) {
      return { 
        success: false, 
        emailSent: false,
        emailError: { message: "ID du prestador não encontrado", code: "MISSING_ID" }
      };
    }
    
    try {
      console.log("Sending invite to provider:", providerId);
      
      const requestBody = { providerId };
      console.log("Request body:", requestBody);
      
      // Get the Supabase Functions URL from environment
      const SUPABASE_URL = "https://ubztjjxmldogpwawcnrj.supabase.co";
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/send-provider-invite`;
      console.log("Using Edge function URL:", edgeFunctionUrl);
      
      // Get the current session for authentication
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token || '';

      // Get the anon key for authentication
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVienRqanhtbGRvZ3B3YXdjbnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODU4MjMsImV4cCI6MjA1OTg2MTgyM30.779CoUY0U1WO7RXXx9OWV1axrXS-UYXuleh_NvH0V8U";
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);

      if (!response.ok) {
        console.error("Error status from Edge function:", response.status, response.statusText);
        let errorText = "";
        try {
          errorText = await response.text();
        } catch (textError) {
          console.error("Could not read response text:", textError);
        }
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Invite response:", data);

      if (!data.success) {
        console.error("Error in response data:", data.error);
        throw new Error(data.error || "Erro ao processar convite");
      }

      return {
        success: true,
        emailSent: data.emailSent || false,
        emailError: data.emailError,
        isNewUser: data.isNewUser,
        message: data.message
      };
      
    } catch (error: any) {
      console.error('Error sending invite:', error);
      return { 
        success: false, 
        emailSent: false,
        emailError: {
          message: error.message || "Erro desconhecido",
          code: "UNKNOWN"
        }
      };
    }
  };

  const handleInvite = async (providerId: string) => {
    if (!providerId) {
      return {
        success: false,
        emailSent: false,
        emailError: { message: "ID do prestador não encontrado", code: "MISSING_ID" }
      };
    }
    
    setIsSendingInvite(true);
    setEmailError(null);
    setTechnicalError(null);
    setInviteStatus("Enviando convite...");
    
    const inviteResult = await sendProviderInvite(providerId);
    
    if (inviteResult.success) {
      if (inviteResult.emailSent) {
        setInviteStatus("Convite enviado com sucesso");
      } else {
        setInviteStatus("Permissões atualizadas, mas erro no envio de email");
      }
      
      if (inviteResult.emailError) {
        setEmailError(inviteResult.emailError);
      }
    } else {
      setInviteStatus("Erro no envio do convite");
      setTechnicalError(inviteResult.emailError?.message || "Erro desconhecido");
    }
    
    setIsSendingInvite(false);
    return inviteResult;
  };

  return {
    isSendingInvite,
    emailError,
    inviteStatus,
    technicalError,
    handleInvite,
    setEmailError,
    setInviteStatus,
    setTechnicalError
  };
};
