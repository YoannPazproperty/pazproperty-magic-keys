
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MessageSquare } from "lucide-react";
import FormField from "./form/FormField";
import RadioFieldGroup from "./form/RadioFieldGroup";
import SubmitButton from "./form/SubmitButton";
import ErrorDisplay from "./form/ErrorDisplay";
import { useContactForm } from "./hooks/useContactForm";

const ContactForm = () => {
  const { 
    formData, 
    isSubmitting, 
    error, 
    handleChange, 
    handleRadioChange, 
    handleSubmit 
  } = useContactForm();

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">Envie-nos uma Mensagem</h2>
      
      <ErrorDisplay error={error} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <FormField id="nome" label="Nome Completo" icon={<User className="h-4 w-4" />}>
          <Input
            id="nome"
            name="nome"
            placeholder="Seu nome completo"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </FormField>
        
        {/* Email */}
        <FormField id="email" label="Email" icon={<Mail className="h-4 w-4" />}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Seu email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormField>
        
        {/* Telefone */}
        <FormField id="telefone" label="Telefone" icon={<Phone className="h-4 w-4" />}>
          <Input
            id="telefone"
            name="telefone"
            placeholder="Seu telefone"
            value={formData.telefone}
            onChange={handleChange}
          />
        </FormField>
        
        {/* Tipo de usuário */}
        <RadioFieldGroup value={formData.tipo} onChange={handleRadioChange} />
        
        {/* Mensagem */}
        <FormField id="mensagem" label="Mensagem" icon={<MessageSquare className="h-4 w-4" />}>
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
        </FormField>
        
        {/* Botão de envio */}
        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
};

export default ContactForm;
