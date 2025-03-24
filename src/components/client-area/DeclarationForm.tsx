
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import FileUpload from "@/components/FileUpload";
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
      <h2 className="text-2xl font-bold mb-6">Formulário de Declaração de Ocorrência</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-700">Importante</h3>
            <p className="text-blue-700 text-sm">
              Para emergências que exigem atenão imediata (como vazamentos graves ou falta de energia), 
              por favor ligue para +351 912 345 678 além de preencher este formulário.
            </p>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nif"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIF *</FormLabel>
                <FormControl>
                  <Input placeholder="Número de Identificação Fiscal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="First" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>&nbsp;</FormLabel>
                  <FormControl>
                    <Input placeholder="Last" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone *</FormLabel>
                <FormControl>
                  <Input placeholder="+351 912 345 678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>&nbsp;</FormLabel>
                  <FormControl>
                    <Input placeholder="Confirm Email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço *</FormLabel>
                  <FormControl>
                    <Input placeholder="Address Line 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Address Line 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="State / Province / Region" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="w-full md:w-1/2">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Postal Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="problemType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>De que ordem é o problema? *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="canalização" id="canalização" />
                      <FormLabel htmlFor="canalização" className="font-normal cursor-pointer">
                        Canalização / Fuga de água?
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="eletricidade" id="eletricidade" />
                      <FormLabel htmlFor="eletricidade" className="font-normal cursor-pointer">
                        Eletricidade?
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="predial" id="predial" />
                      <FormLabel htmlFor="predial" className="font-normal cursor-pointer">
                        Problema no prédio?
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="outro" id="outro" />
                      <FormLabel htmlFor="outro" className="font-normal cursor-pointer">
                        Outro tipo de problema?
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Explique-nos o seu problema *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o problema em detalhes. Quanto mais informações fornecer, melhor poderemos ajudar."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <FormLabel>Fotos ou Vídeos do Problema</FormLabel>
            <FormDescription>
              Adicione até 4 arquivos (fotos ou vídeos) que mostrem o problema. Isso ajudará nossa equipe a entender melhor a situação.
            </FormDescription>
            <FileUpload onChange={handleFileChange} maxFiles={4} accept="image/*,video/*" />
          </div>
          
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
    </div>
  );
};

export default DeclarationForm;
