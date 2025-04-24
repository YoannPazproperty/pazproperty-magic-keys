import { useState } from "react";
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
  const isEditing = !!providerToEdit;

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      empresa: providerToEdit?.empresa || "",
      tipo_de_obras: providerToEdit?.tipo_de_obras || "Obras gerais",
      nome_gerente: providerToEdit?.nome_gerente || "",
      telefone: providerToEdit?.telefone || "",
      email: providerToEdit?.email || "",
      endereco: providerToEdit?.endereco || "",
      codigo_postal: providerToEdit?.codigo_postal || "",
      cidade: providerToEdit?.cidade || "",
      nif: providerToEdit?.nif || "",
    },
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
    try {
      const response = await supabase.functions.invoke('send-provider-invite', {
        body: { providerId }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("Convite enviado com sucesso");
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error("Erro ao enviar convite: " + (error.message || 'Tente novamente'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar prestador" : "Adicionar novo prestador"}
          </DialogTitle>
        </DialogHeader>
        
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
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <div className="flex gap-2">
                {isEditing && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleInvite(providerToEdit.id)}
                    disabled={isSubmitting}
                  >
                    Enviar Convite
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
