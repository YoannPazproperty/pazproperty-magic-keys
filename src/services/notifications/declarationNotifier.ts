
import { Declaration } from "../types";
import { getProviderDetails, logNotification, sendEmail } from "./index";
import { updateDeclaration } from "../declarations/declarationStorage";

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
    await logNotification(
      declaration.id,
      'status_update',
      declaration.email,
      'tenant',
      emailSent,
      content,
      emailSent ? undefined : 'Échec de l\'envoi d\'email'
    );
    
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
    await logNotification(
      declaration.id,
      'new_declaration',
      declaration.email,
      'tenant',
      emailSent,
      content,
      emailSent ? undefined : 'Échec de l\'envoi d\'email'
    );
    
    return emailSent;
  } catch (error) {
    console.error('Erreur lors de la notification de nouvelle déclaration:', error);
    
    // Enregistrer l'échec
    await logNotification(
      declaration.id,
      'new_declaration',
      declaration.email,
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
    // Récupération de la déclaration actuelle pour avoir le statut précédent
    const { data: currentDeclaration } = await supabase
      .from('declarations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!currentDeclaration) {
      console.error(`Déclaration ${id} non trouvée`);
      return false;
    }
    
    const previousStatus = currentDeclaration.status;
    
    // Préparer les données de mise à jour
    const updateData: any = { status };
    
    // Si un prestataire est assigné et que le statut est "Em espera do encontro de diagnostico"
    if (options?.provider_id && status === "Em espera do encontro de diagnostico") {
      updateData.prestador_id = options.provider_id;
      updateData.prestador_assigned_at = new Date().toISOString();
    }
    
    // Si une date de rendez-vous est définie et que le statut est "Encontramento de diagnostico planeado"
    if (options?.meeting_date && status === "Encontramento de diagnostico planeado") {
      updateData.meeting_date = options.meeting_date;
      updateData.meeting_notes = options.meeting_notes || null;
    }
    
    // Si le statut est "Em curso de reparação" et que l'option d'approbation du devis est définie
    if (status === "Em curso de reparação" && options?.quote_approved !== undefined) {
      updateData.quote_approved = options.quote_approved;
      updateData.quote_response_date = new Date().toISOString();
      
      if (!options.quote_approved && options.quote_rejection_reason) {
        updateData.quote_rejection_reason = options.quote_rejection_reason;
      }
    }
    
    // Mettre à jour la déclaration
    const { data: updatedDeclaration, error } = await supabase
      .from('declarations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Erreur lors de la mise à jour de la déclaration ${id}:`, error);
      return false;
    }
    
    // Envoi des notifications en fonction du changement de statut
    if (updatedDeclaration) {
      // Si un prestataire est assigné
      if (options?.provider_id && status === "Em espera do encontro de diagnostico") {
        const provider = await getProviderDetails(options.provider_id);
        if (provider) {
          await notifyProviderAssignment(updatedDeclaration, provider);
        }
      }
      
      // Si un rendez-vous est planifié
      if (options?.meeting_date && status === "Encontramento de diagnostico planeado") {
        const provider = await getProviderDetails(updatedDeclaration.prestador_id);
        if (provider && updatedDeclaration.email) {
          await notifyTenantMeetingScheduled(updatedDeclaration, provider, options.meeting_date);
        }
      }
      
      // Si le devis est approuvé et que le statut passe à "Em curso de reparação"
      if (status === "Em curso de reparação" && options?.quote_approved === true) {
        const provider = await getProviderDetails(updatedDeclaration.prestador_id);
        if (provider) {
          await notifyProviderQuoteApproved(updatedDeclaration, provider);
          await notifyTenantQuoteApproved(updatedDeclaration);
        }
      }
      
      // Notification générale de changement de statut
      await notifyStatusChange(updatedDeclaration, previousStatus);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut et de la notification pour ${id}:`, error);
    return false;
  }
};
