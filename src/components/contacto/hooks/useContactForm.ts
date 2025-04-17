
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ContactFormData {
  nome: string;
  email: string;
  telefone: string;
  tipo: string;
  mensagem: string;
}

interface UseContactFormReturn {
  formData: ContactFormData;
  isSubmitting: boolean;
  error: string | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleRadioChange: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useContactForm(): UseContactFormReturn {
  const [formData, setFormData] = useState<ContactFormData>({
    nome: "",
    email: "",
    telefone: "",
    tipo: "proprietario",
    mensagem: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipo: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Log the form data for debugging
      console.log("Preparando para enviar formulário:", formData);
      
      // Validate required fields
      if (!formData.nome || !formData.email || !formData.mensagem) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Por favor, forneça um endereço de email válido");
      }
      
      // Create a copy of the form data to send
      const dataToSend = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || null,
        tipo: formData.tipo,
        mensagem: formData.mensagem
      };
      
      console.log("Dados preparados para envio:", dataToSend);
      
      // Test connection to Edge Function with CORS preflight
      console.log("Testando conexão com Edge Function via CORS preflight...");
      
      try {
        const testResponse = await fetch("https://ubztjjxmldogpwawcnrj.supabase.co/functions/v1/send-contact-form", {
          method: "OPTIONS",
          headers: {
            "Content-Type": "application/json"
          }
        });
        console.log("Resposta do teste CORS:", testResponse.status);
      } catch (testError) {
        console.error("Erro ao testar conexão:", testError);
      }
      
      // FIXED: Using fetch directly with proper headers and token acquisition
      console.log("Enviando dados para Edge Function via fetch...");
      
      // Get the session token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || "";
      
      const response = await fetch("https://ubztjjxmldogpwawcnrj.supabase.co/functions/v1/send-contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(dataToSend)
      });
      
      // Log the response
      const responseData = await response.json();
      console.log("Resposta completa da função:", responseData);
      
      if (!response.ok) {
        throw new Error(`Erro na função: ${responseData.error || response.statusText}`);
      }
      
      if (responseData && responseData.success) {
        toast.success("Mensagem enviada com sucesso! Entraremos em contacto consigo em breve.");
        
        // Reset the form after successful submission
        setFormData({
          nome: "",
          email: "",
          telefone: "",
          tipo: "proprietario",
          mensagem: "",
        });
      } else {
        console.error("Resposta inesperada:", responseData);
        throw new Error(responseData?.error || "Resposta inesperada do servidor");
      }
    } catch (error: any) {
      console.error("Erro detalhado ao enviar formulário:", error);
      
      // Log stack trace if available
      if (error.stack) {
        console.error("Stack trace:", error.stack);
      }
      
      setError(error.message || "Erro desconhecido");
      toast.error(`Ocorreu um erro ao enviar a mensagem: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    error,
    handleChange,
    handleRadioChange,
    handleSubmit
  };
}
