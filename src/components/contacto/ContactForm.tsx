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
      
      // Call the Edge function with form data - ensuring we're sending a proper JSON body
      const response = await supabase.functions.invoke('send-contact-form', {
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Resposta completa da função:", response);
      
      // Check for errors in the response
      if (response.error) {
        console.error("Erro na resposta da função:", response.error);
        throw new Error(`Erro: ${response.error.message || "Erro desconhecido"}`);
      }
      
      const data = response.data;
      
      if (data && data.success) {
        toast.success("Mensagem enviada com sucesso! Entraremos em contacto consigo em breve.");
        
        // Reset form
        setFormData({
          nome: "",
          email: "",
          telefone: "",
          tipo: "proprietario",
          mensagem: "",
        });
      } else {
        // Handle unexpected response format
        console.error("Resposta inesperada:", data);
        throw new Error("Resposta inesperada do servidor");
      }
    } catch (error: any) {
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
        {/* Nome */}
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
        
        {/* Email */}
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
        
        {/* Telefone */}
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
        
        {/* Tipo de usuário */}
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
        
        {/* Mensagem */}
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
        
        {/* Botão de envio */}
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
