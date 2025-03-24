
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormHeader from "./form-sections/FormHeader";
import PersonalInfoFields from "./form-sections/PersonalInfoFields";
import AddressFields from "./form-sections/AddressFields";
import ProblemTypeField from "./form-sections/ProblemTypeField";
import DescriptionField from "./form-sections/DescriptionField";
import MediaUploadField from "./form-sections/MediaUploadField";
import { formSchema, FormValues } from "./schema";
import { useDeclarationForm } from "./hooks/useDeclarationForm";

interface DeclarationFormProps {
  onSuccess: () => void;
}

const DeclarationForm: React.FC<DeclarationFormProps> = ({ onSuccess }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nif: "",
      firstName: "",
      lastName: "",
      telefone: "",
      email: "",
      confirmEmail: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      problemType: "canalização",
      description: "",
    },
  });

  const { 
    isSubmitting, 
    handleFileChange, 
    handleSubmit 
  } = useDeclarationForm({ 
    form, 
    onSuccess 
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <FormHeader />
      
      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <PersonalInfoFields />
            <AddressFields />
            <ProblemTypeField />
            <DescriptionField />
            <MediaUploadField onChange={handleFileChange} />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-brand-blue hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Declaração"}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
};

export default DeclarationForm;
