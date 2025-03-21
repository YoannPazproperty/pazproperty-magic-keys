
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
import { AlertCircle, CheckCircle2 } from "lucide-react";
import declarationService, { Declaration } from "@/services/declarationService";

const formSchema = z.object({
  nif: z.string().min(1, {
    message: "NIF é obrigatório.",
  }),
  firstName: z.string().min(1, {
    message: "Nome é obrigatório.",
  }),
  lastName: z.string().min(1, {
    message: "Sobrenome é obrigatório.",
  }),
  telefone: z.string().min(9, {
    message: "Insira um número de telefone válido.",
  }),
  email: z.string().email({
    message: "Insira um endereço de email válido.",
  }),
  confirmEmail: z.string().email({
    message: "Insira um endereço de email válido.",
  }),
  addressLine1: z.string().min(1, {
    message: "Endereço é obrigatório.",
  }),
  addressLine2: z.string().optional(),
  city: z.string().min(1, {
    message: "Cidade é obrigatória.",
  }),
  state: z.string().min(1, {
    message: "Estado/Província/Região é obrigatório.",
  }),
  postalCode: z.string().min(1, {
    message: "Código postal é obrigatório.",
  }),
  problemType: z.enum(["canalização", "eletricidade", "predial", "outro"], {
    message: "Selecione um tipo de problema.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Os emails não correspondem",
  path: ["confirmEmail"],
});

type FormValues = z.infer<typeof formSchema>;

const AreaCliente = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      
      const fullAddress = `${values.addressLine1}${values.addressLine2 ? ', ' + values.addressLine2 : ''}, ${values.city}, ${values.state}, ${values.postalCode}`;
      
      const newDeclaration = declarationService.add({
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.telefone,
        property: fullAddress,
        issueType: mapIssueTypeToMondayFormat(values.problemType),
        description: values.description,
        urgency: "medium", // Default urgency as it's not in the form
        nif: values.nif, // Ajouter le NIF à la déclaration
      });
      
      const mondayResult = await declarationService.sendToExternalService(newDeclaration);
      
      if (mondayResult) {
        toast.success("Declaração enviada para Monday.com", {
          description: "Sua declaração foi registrada com sucesso no nosso sistema."
        });
      }
      
      setIsSuccess(true);
      form.reset();
      
      toast("Declaração enviada com sucesso!", {
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

  const mapIssueTypeToMondayFormat = (problemType: string): string => {
    const mapping: Record<string, string> = {
      "canalização": "plumbing",
      "eletricidade": "electrical",
      "predial": "structural",
      "outro": "other"
    };
    
    return mapping[problemType] || problemType;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Área de Cliente</h1>
          <p className="text-gray-600 mb-8">
            Bem-vindo à sua área de cliente. Utilize o formulário abaixo para declarar qualquer problema ou necessidade relacionada ao seu imóvel.
          </p>
          
          {isSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500 mr-3" />
                <h2 className="text-xl font-semibold text-green-700">Declaração Enviada com Sucesso!</h2>
              </div>
              <p className="text-green-700 mb-4">
                Obrigado por nos informar sobre o seu problema. Nossa equipe irá analisar sua solicitação e entrar em contato o mais rápido possível.
              </p>
              <Button 
                onClick={() => setIsSuccess(false)}
                className="bg-green-600 hover:bg-green-700"
              >
                Enviar Nova Declaração
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">Formulário de Declaração de Ocorrência</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-700">Importante</h3>
                    <p className="text-blue-700 text-sm">
                      Para emergências que exigem atenção imediata (como vazamentos graves ou falta de energia), 
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
          )}
          
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Informações de Contato</h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Horário de Atendimento</h3>
                  <p className="text-gray-600 mb-2">Segunda a Sexta: 9h às 18h</p>
                  <p className="text-gray-600 mb-2">Sábado: 10h às 14h</p>
                  <p className="text-gray-600">Domingos e Feriados: Emergências apenas</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contatos de Emergência</h3>
                  <p className="text-gray-600 mb-2">Telefone: +351 912 345 678</p>
                  <p className="text-gray-600 mb-2">Email: emergencia@pazproperty.pt</p>
                  <p className="text-gray-600">Fora do horário de expediente: +351 912 987 654</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AreaCliente;
