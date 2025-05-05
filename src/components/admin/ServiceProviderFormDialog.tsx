
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createProvider, updateProvider } from "@/services/providers/providerQueries";
import { ProviderFormValues, providerFormSchema, ServiceProviderFormDialogProps } from "./providers/types";
import { useProviderInvite } from "./providers/useProviderInvite";
import { ProviderFormAlerts } from "./providers/ProviderFormAlerts";
import { ProviderForm } from "./providers/ProviderForm";

export function ServiceProviderFormDialog({
  isOpen,
  onClose,
  onSuccess,
  providerToEdit
}: ServiceProviderFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!providerToEdit;

  // Use our custom hook for invite functionality
  const {
    isSendingInvite,
    emailError,
    inviteStatus,
    technicalError,
    handleInvite,
    setEmailError,
    setInviteStatus,
    setTechnicalError
  } = useProviderInvite();

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
    setEmailError(null);
    setTechnicalError(null);
    setInviteStatus(null);
    
    try {
      let providerId: string | undefined;
      
      if (isEditing && providerToEdit) {
        const updatedProvider = await updateProvider(providerToEdit.id, data);
        
        if (updatedProvider) {
          toast.success("Prestador atualizado com sucesso");
          providerId = providerToEdit.id;
        } else {
          toast.error("Erro ao atualizar prestador");
        }
      } else {
        // Création d'un nouveau prestataire
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
          providerId = newProvider.id;
          
          // Envoi automatique de l'invitation pour les nouveaux prestataires
          if (providerId) {
            const inviteResult = await handleInvite(providerId);
            
            if (inviteResult && 'success' in inviteResult && inviteResult.success) {
              if ('emailSent' in inviteResult && inviteResult.emailSent) {
                toast.success("Convite enviado com sucesso", {
                  description: 'isNewUser' in inviteResult && inviteResult.isNewUser 
                    ? "Um email com as credenciais foi enviado ao prestador"
                    : "O prestador foi notificado"
                });
              } else {
                toast.warning("Erro no envio do email", {
                  description: "O provedor foi adicionado ao sistema, mas ocorreu um erro ao enviar o email"
                });
              }
            } else {
              const errorMessage = inviteResult && 'emailError' in inviteResult 
                ? inviteResult.emailError?.message 
                : "Verifique os logs para mais detalhes";
              
              toast.error("Erro ao enviar convite", { 
                description: errorMessage
              });
            }
          }
        } else {
          toast.error("Erro ao criar prestador");
        }
      }
      
      // En cas de succès, appeler la fonction onSuccess pour rafraîchir la liste
      onSuccess();
    } catch (error) {
      console.error("Error submitting provider form:", error);
      toast.error("Erro ao processar o formulário");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleProviderInvite = async () => {
    if (isEditing && providerToEdit) {
      const inviteResult = await handleInvite(providerToEdit.id);
      
      if (inviteResult && 'success' in inviteResult && inviteResult.success) {
        if ('emailSent' in inviteResult && inviteResult.emailSent) {
          toast.success("Convite enviado com sucesso", {
            description: 'isNewUser' in inviteResult && inviteResult.isNewUser 
              ? "Um email com as credenciais foi enviado ao prestador" 
              : "O prestador foi notificado"
          });
        } else {
          toast.warning("Permissões atualizadas", {
            description: "O prestador já possui uma conta e suas permissões foram atualizadas, mas ocorreu um erro ao enviar o email"
          });
        }
      } else {
        const errorMessage = inviteResult && 'emailError' in inviteResult 
          ? inviteResult.emailError?.message 
          : "Verifique os logs para mais detalhes";
          
        toast.error("Erro ao enviar convite", { 
          description: errorMessage
        });
      }
    }
  };

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
      setInviteStatus(null);
      setTechnicalError(null);
    }
  }, [isOpen, providerToEdit, form]);

  const dismissEmailError = () => setEmailError(null);
  const dismissTechnicalError = () => setTechnicalError(null);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar prestador" : "Adicionar novo prestador"}
          </DialogTitle>
        </DialogHeader>
        
        <ProviderFormAlerts
          technicalError={technicalError}
          emailError={emailError}
          inviteStatus={inviteStatus}
          onDismissTechnicalError={dismissTechnicalError}
          onDismissEmailError={dismissEmailError}
        />
        
        <ProviderForm
          form={form}
          isSubmitting={isSubmitting}
          isSendingInvite={isSendingInvite}
          isEditing={isEditing}
          onSubmit={onSubmit}
          onClose={onClose}
          onInvite={isEditing ? handleProviderInvite : undefined}
        />
      </DialogContent>
    </Dialog>
  );
}
