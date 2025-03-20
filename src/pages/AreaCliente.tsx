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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import declarationService from "@/services/declarationService";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Insira um endereço de email válido.",
  }),
  phone: z.string().min(9, {
    message: "Insira um número de telefone válido.",
  }),
  property: z.string().min(1, {
    message: "Selecione uma propriedade.",
  }),
  issueType: z.string().min(1, {
    message: "Selecione um tipo de problema.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  urgency: z.string().min(1, {
    message: "Selecione o nível de urgência.",
  }),
});

const AreaCliente = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      property: "",
      issueType: "",
      description: "",
      urgency: "medium",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      console.log("Form data:", values);
      
      const newDeclaration = declarationService.add(values);
      
      await declarationService.sendToExternalService(newDeclaration);
      
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="seu.email@exemplo.com" {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="+351 912 345 678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="property"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Propriedade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione sua propriedade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="avenida-lisboa-1">Avenida de Lisboa, 1</SelectItem>
                              <SelectItem value="rua-comercio-23">Rua do Comércio, 23</SelectItem>
                              <SelectItem value="praca-rossio-45">Praça do Rossio, 45</SelectItem>
                              <SelectItem value="rua-augusta-78">Rua Augusta, 78</SelectItem>
                              <SelectItem value="avenida-liberdade-102">Avenida da Liberdade, 102</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="issueType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Problema</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de problema" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="plumbing">Encanamento</SelectItem>
                              <SelectItem value="electrical">Elétrico</SelectItem>
                              <SelectItem value="appliance">Eletrodomésticos</SelectItem>
                              <SelectItem value="heating">Aquecimento/Refrigeração</SelectItem>
                              <SelectItem value="structural">Estrutural</SelectItem>
                              <SelectItem value="pest">Pragas</SelectItem>
                              <SelectItem value="other">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nível de Urgência</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o nível de urgência" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Baixa - Pode esperar</SelectItem>
                              <SelectItem value="medium">Média - Precisa de atenção nos próximos dias</SelectItem>
                              <SelectItem value="high">Alta - Precisa de atenção nas próximas 24h</SelectItem>
                              <SelectItem value="emergency">Emergência - Precisa de atenção imediata</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição do Problema</FormLabel>
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
