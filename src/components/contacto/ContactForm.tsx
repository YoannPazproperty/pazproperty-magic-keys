
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, User, Mail, Phone, Home, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipo: "proprietario", // Default value: proprietário
    mensagem: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    try {
      console.log("Enviando formulário:", formData);
      
      const response = await supabase.functions.invoke('send-contact-form', {
        body: formData,
      });
      
      console.log("Resposta completa da função:", response);
      
      if (response.error) {
        throw new Error(`Erro: ${response.error.message || "Erro desconhecido"}`);
      }
      
      const data = response.data;
      
      // Handle success, even if partial
      if (data.success) {
        toast.success("Mensagem enviada com sucesso! Entraremos em contacto consigo em breve.");
        
        if (data.partialSuccess) {
          console.warn("Algumas operações falharam:", data);
          
          if (!data.email.success) {
            console.error("Problemas com o envio de emails:", data.email.error);
            toast.warning("O formulário foi recebido, mas houve um problema no envio do email de confirmação.");
          }
          
          if (!data.database.success) {
            console.error("Problemas com o salvamento na base de dados:", data.database.error);
          }
        }
        
        // Reset form
        setFormData({
          nome: "",
          email: "",
          telefone: "",
          tipo: "proprietario",
          mensagem: "",
        });
      } else {
        // Complete failure
        throw new Error("Ambas as operações falharam: " + 
          (data.email.error || "Erro no email") + ", " + 
          (data.database.error || "Erro na base de dados"));
      }
    } catch (error) {
      console.error("Erro detalhado ao enviar formulário:", error);
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
          <Label htmlFor="nome" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Nome Completo
          </Label>
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
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email
          </Label>
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
          <Label htmlFor="telefone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" /> Telefone
          </Label>
          <Input
            id="telefone"
            name="telefone"
            placeholder="Seu telefone"
            value={formData.telefone}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="tipo-usuario" className="flex items-center gap-2">
            <Home className="h-4 w-4" /> É proprietário ou inquilino?
          </Label>
          <RadioGroup 
            id="tipo-usuario"
            defaultValue="proprietario"
            value={formData.tipo}
            onValueChange={handleRadioChange}
            className="flex flex-col space-y-1 sm:flex-row sm:space-x-6 sm:space-y-0"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="proprietario" id="proprietario" />
              <Label htmlFor="proprietario">Proprietário</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inquilino" id="inquilino" />
              <Label htmlFor="inquilino">Inquilino</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mensagem" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Mensagem
          </Label>
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
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              A enviar...
            </span>
          ) : (
            <span className="flex items-center">
              <Send className="mr-2 h-4 w-4" /> 
              Enviar Mensagem
            </span>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ContactForm;
