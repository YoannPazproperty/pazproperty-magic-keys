import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import type { CommercialContact } from "../../services/types";
import { createContact, updateContact } from "../../services/contacts/contactQueries";

// Define the form schema with required fields matching CommercialContact requirements
const contactFormSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  telefone: z.string().optional(),
  tipo: z.enum(["Proprietario", "Inquilino", "Outros", "Agente Imobiliario"]),
  mensagem: z.string().min(1, { message: "Mensagem é obrigatória" }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contactToEdit?: CommercialContact;
}

export function ContactFormDialog({ isOpen, onClose, onSuccess, contactToEdit }: ContactFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!contactToEdit;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      nome: contactToEdit?.nome || "",
      email: contactToEdit?.email || "",
      telefone: contactToEdit?.telefone || "",
      tipo: (contactToEdit?.tipo as any) || "Outros",
      mensagem: contactToEdit?.mensagem || "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    
    try {
      if (isEditing && contactToEdit) {
        const updatedContact = await updateContact(contactToEdit.id, data);
        
        if (updatedContact) {
          toast.success("Contato atualizado com sucesso");
          onSuccess();
        } else {
          toast.error("Erro ao atualizar contato");
        }
      } else {
        // Ensure all required fields are present for create operation
        const newContact = await createContact({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone || null,
          tipo: data.tipo,
          mensagem: data.mensagem
        });
        
        if (newContact) {
          toast.success("Contato criado com sucesso");
          onSuccess();
        } else {
          toast.error("Erro ao criar contato");
        }
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Erro ao processar o formulário");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar contato" : "Adicionar novo contato"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
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
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Proprietario">Proprietário</SelectItem>
                      <SelectItem value="Inquilino">Inquilino</SelectItem>
                      <SelectItem value="Agente Imobiliario">Agente Imobiliário</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mensagem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Adicione informações adicionais aqui" 
                      className="min-h-[100px]" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
