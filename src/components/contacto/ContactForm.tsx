
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    mensagem: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log("Enviando formulário:", formData);
      
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke('send-contact-form', {
        body: formData,
      });
      
      if (error) throw new Error(error.message);
      
      console.log("Resposta da função:", data);
      
      if (data.details) {
        console.log("Détails des emails:", data.details);
      }
      
      // Show success message
      toast.success("Mensagem enviada com sucesso! Entraremos em contacto consigo em breve.");
      
      // Reset form
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        mensagem: "",
      });
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error("Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">Envie-nos uma Mensagem</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            name="nome"
            placeholder="Seu nome completo"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Seu email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            name="telefone"
            placeholder="Seu telefone"
            value={formData.telefone}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mensagem">Mensagem</Label>
          <Textarea
            id="mensagem"
            name="mensagem"
            placeholder="Como podemos ajudar?"
            value={formData.mensagem}
            onChange={handleChange}
            rows={5}
            className="w-full"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-brand-blue hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>Enviando...</>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Enviar Mensagem
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;
