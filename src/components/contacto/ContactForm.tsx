
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MessageSquare } from "lucide-react";
import FormField from "./form/FormField";
import RadioFieldGroup from "./form/RadioFieldGroup";
import SubmitButton from "./form/SubmitButton";
import ErrorDisplay from "./form/ErrorDisplay";
import { useContactForm } from "./hooks/useContactForm";
import { useLanguage } from "@/contexts/LanguageContext";

const ContactForm = () => {
  const { 
    formData, 
    isSubmitting, 
    error, 
    handleChange, 
    handleRadioChange, 
    handleSubmit 
  } = useContactForm();
  const { t } = useLanguage();

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">{t('contact.form.title')}</h2>
      
      <ErrorDisplay error={error} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <FormField id="nome" label={t('contact.form.name')} icon={<User className="h-4 w-4" />}>
          <Input
            id="nome"
            name="nome"
            placeholder={t('contact.form.name.placeholder')}
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </FormField>
        
        {/* Email */}
        <FormField id="email" label={t('contact.form.email')} icon={<Mail className="h-4 w-4" />}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t('contact.form.email.placeholder')}
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormField>
        
        {/* Telefone */}
        <FormField id="telefone" label={t('contact.form.phone')} icon={<Phone className="h-4 w-4" />}>
          <Input
            id="telefone"
            name="telefone"
            placeholder={t('contact.form.phone.placeholder')}
            value={formData.telefone}
            onChange={handleChange}
          />
        </FormField>
        
        {/* Tipo de usuário */}
        <RadioFieldGroup value={formData.tipo} onChange={handleRadioChange} />
        
        {/* Mensagem */}
        <FormField id="mensagem" label={t('contact.form.message')} icon={<MessageSquare className="h-4 w-4" />}>
          <Textarea
            id="mensagem"
            name="mensagem"
            placeholder={t('contact.form.message.placeholder')}
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
