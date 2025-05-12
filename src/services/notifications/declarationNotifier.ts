
import { Declaration, ServiceProvider } from "../types";
import { logNotification, sendEmail, getProviderDetails } from "./index";
import { supabase } from "@/integrations/supabase/client";
import { convertFromSupabaseFormat } from "../declarations/supabaseFormatters";
import { toast } from "sonner";

// Notification lors d'un changement de statut
export const notifyStatusChange = async (
  declaration: Declaration, 
  previousStatus: Declaration["status"]
): Promise<boolean> => {
  if (!declaration || !declaration.email) {
    console.error('Données insuffisantes pour notifier du changement de statut');
    return false;
  }
  
  const subject = `Mise à jour de votre déclaration de sinistre`;
  
  const content = `
    <h2>Mise à jour du statut</h2>
    <p>Le statut de votre déclaration de sinistre a été mis à jour.</p>
    <p><strong>Nouveau statut:</strong> ${declaration.status}</p>
  `;
  
  try {
    // Envoyer l'email (uniquement pour certains statuts)
    let emailSent = false;
    if (
      declaration.status === "Resolvido" ||
      declaration.status === "Em curso de reparação" ||
      declaration.status === "Annulé"
    ) {
      emailSent = await sendEmail(declaration.email, subject, content);
    } else {
      // Ne pas envoyer d'email pour les autres statuts
      emailSent = true;
    }
    
    // Enregistrer la notification
    const logSuccess = await logNotification(
      declaration.id,
      'status_update',
      declaration.email,
      'tenant',
      emailSent,
      content,
      emailSent ? undefined : 'Échec de l\'envoi d\'email'
    );
    
    console.log(`Notification de changement de statut enregistrée: ${logSuccess ? 'succès' : 'échec'}`);
    
    return emailSent;
  } catch (error) {
    console.error('Erreur lors de la notification du changement de statut:', error);
    
    // Enregistrer l'échec
    await logNotification(
      declaration.id,
      'status_update',
      declaration.email,
      'tenant',
      false,
      content,
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
    
    return false;
  }
};

// Envoie une notification pour une nouvelle déclaration
export const notifyNewDeclaration = async (declaration: Declaration): Promise<boolean> => {
  if (!declaration || !declaration.email) {
    console.error('Données insuffisantes pour notifier la nouvelle déclaration');
    return false;
  }
  
  const subject = `Confirmation de votre déclaration de sinistre`;
  
  const content = `
    <h2>Votre déclaration a été enregistrée</h2>
    <p>Nous avons bien reçu votre déclaration de sinistre. Référence: ${declaration.id}</p>
    <p>Nous la traitons actuellement et reviendrons vers vous dès que possible.</p>
    <h3>Résumé de votre déclaration:</h3>
    <p><strong>Type de problème:</strong> ${declaration.issueType || 'Non spécifié'}</p>
    <p><strong>Description:</strong> ${declaration.description || 'Aucune description'}</p>
    <p>Merci de votre patience.</p>
  `;
  
  try {
    // Envoyer l'email
    const emailSent = await sendEmail(declaration.email, subject, content);
    
    // Enregistrer la notification
    const logSuccess = await logNotification(
      declaration.id,
      'new_declaration',
      declaration.email,
      'tenant',
      emailSent,
      content,
      emailSent ? undefined : 'Échec de l\'envoi d\'email'
    );
    
    console.log(`Notification de nouvelle déclaration enregistrée: ${logSuccess ? 'succès' : 'échec'}`);
    
    return emailSent;
  } catch (error) {
    console.error('Erreur lors de la notification de nouvelle déclaration:', error);
    
    // Enregistrer l'échec
    await logNotification(
      declaration.id,
      'new_declaration',
      declaration.email || '',
      'tenant',
      false,
      content,
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
    
    return false;
  }
};

// Met à jour le statut et envoie une notification
export const updateStatusAndNotify = async (
  id: string, 
  status: Declaration["status"],
  options?: {
    provider_id?: string;
    meeting_date?: string;
    meeting_notes?: string;
    quote_approved?: boolean;
    quote_rejection_reason?: string;
  }
): Promise<boolean> => {
  try {
    console.log("updateStatusAndNotify appelé avec:", { id, status, options });
    
    // Récupération de la déclaration actuelle pour avoir le statut précédent
    const { data: currentDeclarationData, error: fetchError } = await supabase
      .from('declarations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error(`Erreur lors de la récupération de la déclaration ${id}:`, fetchError);
      toast.error(`Erreur lors de la récupération de la déclaration ${id}`, {
        description: fetchError.message,
        duration: 3000
      });
      return false;
    }
    
    if (!currentDeclarationData) {
      console.error(`Déclaration ${id} non trouvée`);
      toast.error(`Déclaration ${id} non trouvée`, {
        duration: 3000
      });
      return false;
    }
    
    // Convert to proper type with mediaFiles as string[]
    const currentDeclaration = convertFromSupabaseFormat(currentDeclarationData);
    
    const previousStatus = currentDeclaration.status;
    
    // Préparer les données de mise à jour
    const updateData: any = { status };
    
    // Si un prestataire est assigné et que le statut est "Em espera do encontro de diagnostico"
    if (options?.provider_id && status === "Em espera do encontro de diagnostico") {
      updateData.prestador_id = options.provider_id;
      updateData.prestador_assigned_at = new Date().toISOString();
      console.log("Assignation du prestataire:", options.provider_id);
    }
    
    // Si une date de rendez-vous est définie et que le statut est "Encontramento de diagnostico planeado"
    if (options?.meeting_date && status === "Encontramento de diagnostico planeado") {
      updateData.meeting_date = options.meeting_date;
      updateData.meeting_notes = options.meeting_notes || null;
      console.log("Planification du rendez-vous:", options.meeting_date);
    }
    
    // Si le statut est "Em curso de reparação" et que l'option d'approbation du devis est définie
    if (status === "Em curso de reparação" && options?.quote_approved !== undefined) {
      updateData.quote_approved = options.quote_approved;
      updateData.quote_response_date = new Date().toISOString();
      
      if (!options.quote_approved && options.quote_rejection_reason) {
        updateData.quote_rejection_reason = options.quote_rejection_reason;
      }
      console.log("Approbation du devis:", options.quote_approved);
    }
    
    console.log("Mise à jour de la déclaration avec les données:", updateData);
    
    // Mettre à jour la déclaration
    const { data: updatedDeclarationData, error: updateError } = await supabase
      .from('declarations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error(`Erreur lors de la mise à jour de la déclaration ${id}:`, updateError);
      toast.error(`Erreur lors de la mise à jour de la déclaration`, {
        description: updateError.message,
        duration: 3000
      });
      return false;
    }
    
    // Convert to proper type with mediaFiles as string[]
    const updatedDeclaration = updatedDeclarationData ? convertFromSupabaseFormat(updatedDeclarationData) : null;
    
    if (!updatedDeclaration) {
      console.error("La déclaration mise à jour est null");
      toast.error("Erreur lors de la mise à jour", {
        description: "Impossible de récupérer la déclaration mise à jour",
        duration: 3000
      });
      return false;
    }
    
    console.log("Déclaration mise à jour avec succès:", updatedDeclaration);
    
    // Importations pour les notifications
    const notifModule = await import('./index');
    
    // Si un prestataire est assigné
    if (options?.provider_id && status === "Em espera do encontro de diagnostico") {
      console.log("Récupération des détails du prestataire:", options.provider_id);
      const provider = await getProviderDetails(options.provider_id);
      if (provider) {
        console.log("Prestataire trouvé, envoi de la notification d'assignation");
        await notifModule.notifyProviderAssignment(updatedDeclaration, provider);
      } else {
        console.error("Prestataire non trouvé pour ID:", options.provider_id);
        toast.error("Prestataire non trouvé", {
          description: `ID: ${options.provider_id}`,
          duration: 3000
        });
      }
    }
    
    // Si un rendez-vous est planifié
    if (options?.meeting_date && status === "Encontramento de diagnostico planeado") {
      if (!updatedDeclaration.prestador_id) {
        console.error("Aucun prestataire assigné à la déclaration");
        toast.error("Aucun prestataire assigné à la déclaration", {
          duration: 3000
        });
      } else {
        const provider = await getProviderDetails(updatedDeclaration.prestador_id);
        if (provider && updatedDeclaration.email) {
          console.log("Envoi de notification pour rendez-vous planifié");
          await notifModule.notifyTenantMeetingScheduled(updatedDeclaration, provider, options.meeting_date);
        }
      }
    }
    
    // Si le devis est approuvé et que le statut passe à "Em curso de reparação"
    if (status === "Em curso de reparação" && options?.quote_approved === true) {
      if (!updatedDeclaration.prestador_id) {
        console.error("Aucun prestataire assigné à la déclaration");
        toast.error("Aucun prestataire assigné à la déclaration", {
          duration: 3000
        });
      } else {
        const provider = await getProviderDetails(updatedDeclaration.prestador_id);
        if (provider) {
          console.log("Envoi de notification pour devis approuvé");
          await notifModule.notifyProviderQuoteApproved(updatedDeclaration, provider);
          await notifModule.notifyTenantQuoteApproved(updatedDeclaration);
        }
      }
    }
    
    // Notification générale de changement de statut
    await notifyStatusChange(updatedDeclaration, previousStatus);
    
    console.log("Mise à jour du statut et envoi des notifications terminé avec succès");
    toast.success("Mise à jour du statut réussie", {
      description: `Nouveau statut: ${status}`,
      duration: 3000
    });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut et de la notification pour ${id}:`, error);
    toast.error(`Erreur lors de la mise à jour du statut`, {
      description: error instanceof Error ? error.message : "Erreur inconnue",
      duration: 5000
    });
    return false;
  }
};
