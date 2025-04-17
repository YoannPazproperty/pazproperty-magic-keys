
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
        // Si la réponse n'est pas OK, vérifier les détails
        const errorMessage = responseData.error || 
                            (responseData.email?.error ? `Erreur email: ${responseData.email.error}` : null) ||
                            (responseData.database?.error ? `Erreur base de données: ${responseData.database.error}` : null) ||
                            response.statusText;
        
        throw new Error(`Erro na função: ${errorMessage}`);
      }
      
      // Si les emails ont été envoyés avec succès, même si la sauvegarde en base a échoué
      if (responseData.success || (responseData.email && responseData.email.success)) {
        toast.success("Mensagem enviada com sucesso! Entraremos em contacto consigo em breve.");
        
        // Reset the form after successful submission
        setFormData({
          nome: "",
          email: "",
          telefone: "",
          tipo: "proprietario",
          mensagem: "",
        });
        
        // Si sauvegarde en BDD a échoué mais emails envoyés, afficher une notification
        if (responseData.database && !responseData.database.success) {
          console.warn("Atenção: Email enviado com sucesso, mas falha ao salvar na base de dados", responseData.database);
          toast.info("Email enviado, mas houve um problema ao salvar seus dados.");
        }
      } else {
        console.error("Resposta inesperada:", responseData);
        throw new Error(responseData?.error || "Resposta inesperada do servidor");
      }
    } catch (error: any) {
      console.error("Erro detalhado ao enviar formulário:", error);
      
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
