
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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

  // Fonction pour gérer la soumission du formulaire
  const onSubmit = async (values: FormValues) => {
    console.log("Formulaire soumis, traitement en cours...");
    await handleSubmit(values);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <FormHeader />
      
      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PersonalInfoFields />
            <AddressFields />
            <ProblemTypeField />
            <DescriptionField />
            <MediaUploadField onChange={handleFileChange} />
            
            {isSubmitting && (
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <AlertTitle className="text-blue-700">Enviando sua declaração...</AlertTitle>
                <AlertDescription className="text-blue-600">
                  Por favor, aguarde enquanto processamos sua declaração.
                </AlertDescription>
              </Alert>
            )}
            
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
