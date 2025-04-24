
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import type { ServiceProvider } from "@/services/types";
import { createProvider, updateProvider } from "@/services/providers/providerQueries";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const providerFormSchema = z.object({
  empresa: z.string().min(1, { message: "Empresa é obrigatória" }),
  tipo_de_obras: z.enum(["Eletricidade", "Canalização", "Alvenaria", "Caixilharias", "Obras gerais"]),
  nome_gerente: z.string().min(1, { message: "Nome do gerente é obrigatório" }),
  telefone: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }),
  endereco: z.string().optional(),
  codigo_postal: z.string().optional(),
  cidade: z.string().optional(),
  nif: z.string().optional(),
});

type ProviderFormValues = z.infer<typeof providerFormSchema>;

interface ServiceProviderFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  providerToEdit?: ServiceProvider;
}

export function ServiceProviderFormDialog({
  isOpen,
  onClose,
  onSuccess,
  providerToEdit
}: ServiceProviderFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [emailError, setEmailError] = useState<{ message: string, code: string } | null>(null);
  const isEditing = !!providerToEdit;

  // Define default values from providerToEdit or empty values
  const defaultValues: ProviderFormValues = {
    empresa: providerToEdit?.empresa || "",
    tipo_de_obras: providerToEdit?.tipo_de_obras || "Obras gerais",
    nome_gerente: providerToEdit?.nome_gerente || "",
    telefone: providerToEdit?.telefone || "",
    email: providerToEdit?.email || "",
    endereco: providerToEdit?.endereco || "",
    codigo_postal: providerToEdit?.codigo_postal || "",
    cidade: providerToEdit?.cidade || "",
    nif: providerToEdit?.nif || "",
  };

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: defaultValues,
  });

  async function onSubmit(data: ProviderFormValues) {
    setIsSubmitting(true);
    
    try {
      if (isEditing && providerToEdit) {
        const updatedProvider = await updateProvider(providerToEdit.id, data);
        
        if (updatedProvider) {
          toast.success("Prestador atualizado com sucesso");
          onSuccess();
        } else {
          toast.error("Erro ao atualizar prestador");
        }
      } else {
        const newProvider = await createProvider({
          empresa: data.empresa,
          tipo_de_obras: data.tipo_de_obras,
          nome_gerente: data.nome_gerente,
          telefone: data.telefone || null,
          email: data.email,
          endereco: data.endereco || null,
          codigo_postal: data.codigo_postal || null,
          cidade: data.cidade || null,
          nif: data.nif || null,
        });
        
        if (newProvider) {
          toast.success("Prestador criado com sucesso");
          onSuccess();
        } else {
          toast.error("Erro ao criar prestador");
        }
      }
    } catch (error) {
      console.error("Error submitting provider form:", error);
      toast.error("Erro ao processar o formulário");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleInvite = async (providerId: string) => {
    if (!providerId) {
      toast.error("ID do prestador não encontrado");
      return;
    }
    
    setIsSendingInvite(true);
    setEmailError(null);
    
    try {
      console.log("Sending invite to provider:", providerId);
      
      // Debug log pour vérifier la structure de la requête
      console.log("Request body:", { providerId });
      
      // Modifier l'appel de la fonction Edge pour ajouter plus de logging
      const response = await supabase.functions.invoke('send-provider-invite', {
        body: { providerId },
        // Ajouter des options pour éviter les problèmes de cache
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log("Invite response:", response);

      if (response.error) {
        console.error("Error details:", response.error);
        throw new Error(response.error.message || "Erro ao enviar convite");
      }
      
      if (response.data && !response.data.success) {
        console.error("Error in data:", response.data.error);
        throw new Error(response.data.error || "Erro ao processar convite");
      }

      // Set email error if present (email failed but user account was created/updated)
      if (response.data.emailError) {
        setEmailError(response.data.emailError);
      }

      // Check if it's a new user or existing user
      if (response.data && response.data.isNewUser) {
        if (response.data.emailSent) {
          toast.success("Convite enviado com sucesso", {
            description: "Um email com as credenciais foi enviado ao prestador"
          });
        } else {
          toast.warning("Conta criada com sucesso", {
            description: "O provedor foi adicionado ao sistema, mas ocorreu um erro ao enviar o email"
          });
        }
      } else {
        if (response.data.emailSent) {
          toast.success("Convite enviado com sucesso", {
            description: "O prestador já possui uma conta e foi notificado"
          });
        } else {
          toast.warning("Permissões atualizadas", {
            description: "O prestador já possui uma conta e suas permissões foram atualizadas, mas ocorreu um erro ao enviar o email"
          });
        }
      }
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast.error("Erro ao enviar convite", { 
        description: error.message || "Verifique os logs para mais detalhes" 
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  // Reset form when dialog opens/changes provider
  useEffect(() => {
    if (isOpen) {
      if (providerToEdit) {
        form.reset({
          empresa: providerToEdit.empresa || "",
          tipo_de_obras: providerToEdit.tipo_de_obras || "Obras gerais",
          nome_gerente: providerToEdit.nome_gerente || "",
          telefone: providerToEdit.telefone || "",
          email: providerToEdit.email || "",
          endereco: providerToEdit.endereco || "",
          codigo_postal: providerToEdit.codigo_postal || "",
          cidade: providerToEdit.cidade || "",
          nif: providerToEdit.nif || "",
        });
      } else {
        form.reset({
          empresa: "",
          tipo_de_obras: "Obras gerais",
          nome_gerente: "",
          telefone: "",
          email: "",
          endereco: "",
          codigo_postal: "",
          cidade: "",
          nif: "",
        });
      }
      setEmailError(null);
    }
  }, [isOpen, providerToEdit, form]);

  // Close email error alert
  const dismissEmailError = () => setEmailError(null);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar prestador" : "Adicionar novo prestador"}
          </DialogTitle>
        </DialogHeader>
        
        {emailError && (
          <Alert variant="warning" className="mb-4">
            <AlertTitle>Aviso sobre o email</AlertTitle>
            <AlertDescription>
              <p>A conta foi criada ou atualizada com sucesso, mas não foi possível enviar o email.</p>
              <p className="text-sm text-muted-foreground mt-1">
                {emailError.message}
              </p>
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={dismissEmailError}>Entendi</Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="empresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tipo_de_obras"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Obras</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de obras" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Eletricidade">Eletricidade</SelectItem>
                      <SelectItem value="Canalização">Canalização</SelectItem>
                      <SelectItem value="Alvenaria">Alvenaria</SelectItem>
                      <SelectItem value="Caixilharias">Caixilharias</SelectItem>
                      <SelectItem value="Obras gerais">Obras gerais</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nome_gerente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Gerente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="+351 912 345 678" {...field} value={field.value || ''} />
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
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, número" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo_postal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Postal</FormLabel>
                    <FormControl>
                      <Input placeholder="1234-567" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="nif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIF</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting || isSendingInvite}>
                Cancelar
              </Button>
              <div className="flex gap-2">
                {isEditing && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleInvite(providerToEdit!.id)}
                    disabled={isSubmitting || isSendingInvite}
                  >
                    {isSendingInvite ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Enviando...
                      </>
                    ) : "Enviar Convite"}
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting || isSendingInvite}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Salvando...
                    </>
                  ) : isEditing ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
