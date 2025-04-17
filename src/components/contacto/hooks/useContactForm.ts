
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
      console.log("Enviando formulário:", formData);
      
      // Validate required fields
      if (!formData.nome || !formData.email || !formData.mensagem) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }
      
      // Create a copy of the form data to send
      const dataToSend = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || null,
        tipo: formData.tipo,
        mensagem: formData.mensagem
      };
      
      // Call the Edge function with the proper headers and JSON body
      const response = await supabase.functions.invoke('send-contact-form', {
        body: dataToSend,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Log the complete response for debugging
      console.log("Resposta completa da função:", response);
      
      if (response.error) {
        console.error("Erro na resposta da função:", response.error);
        throw new Error(`Erro na função: ${response.error.message || "Erro desconhecido"}`);
      }
      
      const data = response.data;
      
      if (data && data.success) {
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
        console.error("Resposta inesperada:", data);
        throw new Error(data?.error || "Resposta inesperada do servidor");
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
