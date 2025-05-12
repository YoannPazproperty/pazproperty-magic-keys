
import { supabase } from "@/integrations/supabase/client";
import { Declaration, NotificationLog, ServiceProvider } from "../types";
import { toast } from "sonner";
import { convertFromSupabaseFormat } from "../declarations/supabaseFormatters";

// Get provider details
export const getProviderDetails = async (providerId: string): Promise<ServiceProvider | null> => {
  if (!providerId) return null;
  
  try {
    const { data, error } = await supabase
      .from('prestadores_de_servicos')
      .select('*')
      .eq('id', providerId)
      .single();
    
    if (error) {
      console.error('Error retrieving provider:', error);
      return null;
    }
    
    // Ensure the data conforms to ServiceProvider type
    if (data) {
      const provider = {
        ...data,
        tipo_de_obras: data.tipo_de_obras as "Eletricidade" | "Canalização" | "Alvenaria" | "Caixilharias" | "Obras gerais"
      };
      return provider;
    }
    
    return null;
  } catch (err) {
    console.error('Exception retrieving provider:', err);
    return null;
  }
};

// Log a notification in the database
export const logNotification = async (
  declaration_id: string,
  notification_type: string,
  recipient_email: string,
  recipient_type: "provider" | "tenant" | "admin",
  success: boolean,
  message_content: string,
  error_message?: string
): Promise<boolean> => {
  try {
    console.log(`Logging notification: ${notification_type} to ${recipient_email} (${recipient_type})`);
    
    const notificationData = {
      declaration_id,
      notification_type,
      recipient_email,
      recipient_type,
      success,
      message_content,
      error_message: error_message || null
    };
    
    const { error } = await supabase
      .from('notification_logs')
      .insert(notificationData);
    
    if (error) {
      console.error('Error logging notification:', error);
      return false;
    }
    
    console.log('Notification logged successfully');
    return true;
  } catch (err) {
    console.error('Exception logging notification:', err);
    return false;
  }
};

// Send an email notification (to be replaced with edge function call)
export const sendEmail = async (
  to: string,
  subject: string,
  content: string
): Promise<boolean> => {
  // Simulate email sending (replace with edge function call)
  console.log(`[SIMULATED EMAIL] to ${to}:`, { subject, content });
  
  // Show a toast notification to simulate the email
  toast.info(`Email simulado para ${to}`, {
    description: subject,
    duration: 5000
  });
  
  // TODO: In a real implementation, call an edge function here
  return true;
};

// Notify provider when assigned to a declaration
export const notifyProviderAssignment = async (
  declaration: Declaration,
  provider: ServiceProvider
): Promise<boolean> => {
  if (!declaration || !provider || !provider.email) {
    console.error('Insufficient data to notify provider');
    return false;
  }
  
  console.log(`Notifying provider ${provider.email} about assignment to declaration ${declaration.id}`);
  
  const subject = `Nouvelle déclaration de sinistre assignée - ${declaration.id}`;
  
  const content = `
    <h2>Nouvelle déclaration de sinistre</h2>
    <p>Une nouvelle déclaration de sinistre vous a été assignée et requiert votre attention.</p>
    <h3>Détails du locataire:</h3>
    <ul>
      <li><strong>Nom:</strong> ${declaration.name}</li>
      <li><strong>Email:</strong> ${declaration.email || 'Non fourni'}</li>
      <li><strong>Téléphone:</strong> ${declaration.phone || 'Non fourni'}</li>
      <li><strong>Adresse:</strong> ${declaration.property || 'Non fournie'}</li>
      <li><strong>Ville:</strong> ${declaration.city || 'Non fournie'}</li>
      <li><strong>Code Postal:</strong> ${declaration.postalCode || 'Non fourni'}</li>
    </ul>
    <h3>Détails du problème:</h3>
    <p><strong>Type:</strong> ${declaration.issueType || 'Non spécifié'}</p>
    <p><strong>Urgence:</strong> ${declaration.urgency || 'Non spécifiée'}</p>
    <p><strong>Description:</strong> ${declaration.description || 'Aucune description'}</p>
    <p>Merci de prendre contact avec le locataire dès que possible pour planifier un rendez-vous de diagnostic.</p>
    <p>Une fois le rendez-vous fixé, veuillez mettre à jour le statut de la déclaration dans votre extranet technique.</p>
  `;
  
  try {
    // Send the email
    const emailSent = await sendEmail(provider.email, subject, content);
    console.log(`Provider notification email ${emailSent ? 'sent' : 'failed'}`);
    
    // Log the notification
    await logNotification(
      declaration.id,
      'provider_assignment',
      provider.email,
      'provider',
      emailSent,
      content,
      emailSent ? undefined : 'Email sending failed'
    );
    
    return emailSent;
  } catch (error) {
    console.error('Error notifying provider:', error);
    
    // Log the failure
    await logNotification(
      declaration.id,
      'provider_assignment',
      provider.email,
      'provider',
      false,
      content,
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    return false;
  }
};

// Notifie le locataire du rendez-vous planifié
export const notifyTenantMeetingScheduled = async (
  declaration: Declaration,
  provider: ServiceProvider,
  meetingDate: string
): Promise<boolean> => {
  if (!declaration || !declaration.email || !provider) {
    console.error('Données insuffisantes pour notifier le locataire');
    return false;
  }
  
  const formattedDate = new Date(meetingDate).toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const subject = `Rendez-vous confirmé pour votre déclaration de sinistre`;
  
  const content = `
    <h2>Votre rendez-vous de diagnostic est confirmé</h2>
    <p>Un prestataire technique a été assigné à votre déclaration de sinistre et un rendez-vous a été fixé.</p>
    <h3>Détails du rendez-vous:</h3>
    <p><strong>Date et heure:</strong> ${formattedDate}</p>
    <h3>Coordonnées du prestataire:</h3>
    <ul>
      <li><strong>Entreprise:</strong> ${provider.empresa}</li>
      <li><strong>Nom du gérant:</strong> ${provider.nome_gerente}</li>
      <li><strong>Email:</strong> ${provider.email}</li>
      <li><strong>Téléphone:</strong> ${provider.telefone || 'Non fourni'}</li>
    </ul>
    <p>Si vous avez besoin de modifier ce rendez-vous, veuillez contacter directement le prestataire.</p>
  `;
  
  try {
    // Envoyer l'email
    const emailSent = await sendEmail(declaration.email, subject, content);
    
    // Enregistrer la notification
    await logNotification(
      declaration.id,
      'meeting_scheduled',
      declaration.email,
      'tenant',
      emailSent,
      content,
      emailSent ? undefined : 'Échec de l\'envoi d\'email'
    );
    
    return emailSent;
  } catch (error) {
    console.error('Erreur lors de la notification du locataire:', error);
    
    // Enregistrer l'échec
    await logNotification(
      declaration.id,
      'meeting_scheduled',
      declaration.email || '',
      'tenant',
      false,
      content,
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
    
    return false;
  }
};

// Notifie le prestataire de l'acceptation du devis
export const notifyProviderQuoteApproved = async (
  declaration: Declaration,
  provider: ServiceProvider
): Promise<boolean> => {
  if (!declaration || !provider || !provider.email) {
    console.error('Données insuffisantes pour notifier le prestataire');
    return false;
  }
  
  const subject = `Devis accepté pour la déclaration ${declaration.id}`;
  
  const content = `
    <h2>Votre devis a été accepté</h2>
    <p>Votre devis pour la déclaration de sinistre ID: ${declaration.id} a été accepté par Paz Property.</p>
    <p>Vous pouvez maintenant procéder aux travaux de réparation.</p>
    <h3>Détails du devis approuvé:</h3>
    <p><strong>Montant:</strong> ${declaration.quote_amount ? declaration.quote_amount + ' €' : 'Non spécifié'}</p>
    <p>Merci de nous tenir informés de l'avancement des travaux.</p>
  `;
  
  try {
    // Envoyer l'email
    const emailSent = await sendEmail(provider.email, subject, content);
    
    // Enregistrer la notification
    await logNotification(
      declaration.id,
      'quote_approved',
      provider.email,
      'provider',
      emailSent,
      content,
      emailSent ? undefined : 'Échec de l\'envoi d\'email'
    );
    
    return emailSent;
  } catch (error) {
    console.error('Erreur lors de la notification du prestataire:', error);
    
    // Enregistrer l'échec
    await logNotification(
      declaration.id,
      'quote_approved',
      provider.email,
      'provider',
      false,
      content,
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
    
    return false;
  }
};

// Notifie le locataire de l'acceptation du devis
export const notifyTenantQuoteApproved = async (
  declaration: Declaration
): Promise<boolean> => {
  if (!declaration || !declaration.email) {
    console.error('Données insuffisantes pour notifier le locataire');
    return false;
  }
  
  const subject = `Mise à jour de votre déclaration de sinistre`;
  
  const content = `
    <h2>Bonne nouvelle !</h2>
    <p>Le devis pour la réparation de votre problème a été accepté.</p>
    <p>Les travaux vont être effectués prochainement par le prestataire technique qui vous contactera pour organiser son intervention.</p>
    <p>Nous vous remercions de votre patience.</p>
  `;
  
  try {
    // Envoyer l'email
    const emailSent = await sendEmail(declaration.email, subject, content);
    
    // Enregistrer la notification
    await logNotification(
      declaration.id,
      'tenant_quote_approved',
      declaration.email,
      'tenant',
      emailSent,
      content,
      emailSent ? undefined : 'Échec de l\'envoi d\'email'
    );
    
    return emailSent;
  } catch (error) {
    console.error('Erreur lors de la notification du locataire:', error);
    
    // Enregistrer l'échec
    await logNotification(
      declaration.id,
      'tenant_quote_approved',
      declaration.email,
      'tenant',
      false,
      content,
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
    
    return false;
  }
};

// Récupère l'historique des notifications pour une déclaration
export const getDeclarationNotificationHistory = async (declarationId: string): Promise<NotificationLog[]> => {
  try {
    const { data, error } = await supabase
      .from('notification_logs')
      .select('*')
      .eq('declaration_id', declarationId)
      .order('sent_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération de l\'historique des notifications:', error);
      return [];
    }
    
    // Ensure the data conforms to NotificationLog type
    if (data) {
      const notifications: NotificationLog[] = data.map(item => ({
        ...item,
        recipient_type: item.recipient_type as "provider" | "tenant" | "admin"
      }));
      return notifications;
    }
    
    return [];
  } catch (err) {
    console.error('Exception lors de la récupération de l\'historique des notifications:', err);
    return [];
  }
};

// Import and re-export everything from declarationNotifier (except the ones we've defined here)
export * from './declarationNotifier';
