
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormHeader from "./form-sections/FormHeader";
import PersonalInfoFields from "./form-sections/PersonalInfoFields";
import AddressFields from "./form-sections/AddressFields";
import ProblemTypeField from "./form-sections/ProblemTypeField";
import DescriptionField from "./form-sections/DescriptionField";
import MediaUploadField from "./form-sections/MediaUploadField";
import { formSchema, FormValues, mapIssueTypeToMondayFormat } from "./schema";
import { addWithMedia, sendToExternalService } from "@/services/declarationService";

interface DeclarationFormProps {
  onSuccess: () => void;
}

const DeclarationForm: React.FC<DeclarationFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

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

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("Form data:", values);
      console.log("Media files:", mediaFiles);
      
      const fullAddress = `${values.addressLine1}${values.addressLine2 ? ', ' + values.addressLine2 : ''}`;
      
      const declarationData = {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.telefone,
        property: fullAddress,
        city: values.city,
        postalCode: values.postalCode,
        issueType: mapIssueTypeToMondayFormat(values.problemType),
        description: values.description,
        urgency: "medium", // Default urgency as it's not in the form
        nif: values.nif,
      };
      
      const newDeclaration = await addWithMedia(declarationData, mediaFiles);
      console.log("Declaration saved locally:", newDeclaration);
      
      // Always attempt to send to Monday without config check
      try {
        console.log("Sending declaration to Monday:", newDeclaration);
        const mondayResult = await sendToExternalService(newDeclaration);
        
        if (mondayResult) {
          toast.success("Declaração enviada para Monday.com", {
            description: "Sua declaração foi registrada com sucesso no nosso sistema."
          });
        } else {
          toast.error("Erro na integração com Monday.com", {
            description: "Sua declaração foi salva localmente, mas não foi enviada para Monday.com."
          });
        }
      } catch (error) {
        console.error("Error sending to Monday.com:", error);
        toast.error("Erro ao enviar para Monday.com", {
          description: "Sua declaração foi salva localmente, mas houve um erro ao enviá-la para Monday.com."
        });
      }
      
      form.reset();
      setMediaFiles([]);
      onSuccess();
      
      toast.success("Declaração enviada com sucesso!", {
        description: "Entraremos em contato em breve sobre o seu problema."
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erro ao enviar", {
        description: "Ocorreu um erro ao enviar sua declaração. Por favor, tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (files: File[]) => {
    setMediaFiles(files);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <FormHeader />
      
      <FormProvider {...form}>
        <Form>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
