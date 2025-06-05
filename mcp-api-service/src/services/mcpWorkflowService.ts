import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Types temporaires pour la clarté. Idéalement, générer/copier les types depuis la BDD.
interface DeclarationRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  property: string | null;
  city: string | null;
  postalCode: string | null;
  issueType: string | null;
  description: string | null;
  urgency: string | null;
  mediaFiles: string | null;
  status: string | null; // Ou un type enum plus précis si disponible
  prestador_id: string | null;
  prestador_assigned_at: string | null;
  // Ajoute d'autres champs si nécessaire pour la logique
}

interface ProviderRow {
  id: string;
  nome_gerente: string;
  empresa: string;
  email: string;
  // Ajoute d'autres champs si nécessaire
}

export interface ClaimData {
  name: string;
  email: string;
  phone: string;
  property: string;
  city: string;
  postalCode: string;
  issueType: string;
  description: string;
  urgency: string;
  mediaFiles: string[]; // Array de chemins ou d'objets fichiers
}

class McpWorkflowService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Utiliser la clé de service pour les opérations backend

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL and Service Key are required environment variables.');
    }
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  private async _getDeclarationDetailsById(declarationId: string): Promise<DeclarationRow | null> {
    const { data, error } = await this.supabase
      .from('declarations')
      .select('*')
      .eq('id', declarationId)
      .single();

    if (error) {
      console.error(`McpWorkflowService: Error fetching declaration details for ID ${declarationId}:`, error);
      return null;
    }
    return data as DeclarationRow | null;
  }

  private async _getProviderDetailsById(providerId: string): Promise<ProviderRow | null> {
    const { data, error } = await this.supabase
      .from('prestadores_de_servicos')
      .select('*')
      .eq('id', providerId)
      .single();

    if (error) {
      console.error(`McpWorkflowService: Error fetching provider details for ID ${providerId}:`, error);
      return null;
    }
    return data as ProviderRow | null;
  }

  async assignProviderAndNotifyWorkflow(declarationId: string, providerId: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (!providerId) {
      const msg = 'Provider ID is required for assignment.';
      console.error(`McpWorkflowService: ${msg}`);
      await this.logAction('assign_provider_failed', { declarationId, reason: 'Missing providerId', timestamp: new Date().toISOString() });
      return { success: false, message: msg };
    }

    try {
      const declaration = await this._getDeclarationDetailsById(declarationId);
      if (!declaration) {
        const msg = `Declaration ${declarationId} not found.`;
        console.error(`McpWorkflowService: ${msg}`);
        await this.logAction('assign_provider_failed', { declarationId, providerId, reason: msg, timestamp: new Date().toISOString() });
        return { success: false, message: msg };
      }

      const provider = await this._getProviderDetailsById(providerId);
      if (!provider) {
        const msg = `Provider ${providerId} not found.`;
        console.error(`McpWorkflowService: ${msg}`);
        await this.logAction('assign_provider_failed', { declarationId, providerId, reason: msg, timestamp: new Date().toISOString() });
        return { success: false, message: msg };
      }

      const updates: Partial<DeclarationRow> = {
        prestador_id: providerId,
        status: 'Em espera do encontro de diagnostico',
        prestador_assigned_at: new Date().toISOString(),
      };

      const { data: updatedDeclaration, error: updateError } = await this.supabase
        .from('declarations')
        .update(updates)
        .eq('id', declarationId)
        .select()
        .single();

      if (updateError) {
        const msg = 'Error updating declaration for provider assignment.';
        console.error(`McpWorkflowService: ${msg}`, updateError);
        await this.logAction('assign_provider_failed', { declarationId, providerId, reason: msg, error: updateError.message, timestamp: new Date().toISOString() });
        return { success: false, message: `${msg} ${updateError.message}` };
      }

      console.log('McpWorkflowService: Declaration updated successfully for provider assignment:', updatedDeclaration);

      const mailSubject = `Nova intervenção atribuída: Sinistro #${declaration.id}`;
      const mailBody = (
        `Olá ${provider.nome_gerente || provider.empresa},<br/><br/>` +
        `Uma nova intervenção foi atribuída a você:<br/><br/>` +
        `Detalhes do Sinistro:<br/>` +
        `- ID do Sinistro: ${declaration.id}<br/>` +
        `- Tipo de Intervenção: ${declaration.issueType || 'N/A'}<br/>` +
        `- Descrição: ${declaration.description || 'N/A'}<br/>` +
        `- Mídia: ${declaration.mediaFiles || 'Nenhuma mídia fornecida'}<br/><br/>` +
        `Informações do Locatário:<br/>` +
        `- Nome: ${declaration.name}<br/>` +
        `- Telefone: ${declaration.phone || 'N/A'}<br/>` +
        `- Email: ${declaration.email || 'N/A'}<br/>` +
        `- Endereço: ${declaration.property || ''}, ${declaration.city || ''}, ${declaration.postalCode || ''}<br/><br/>` +
        `Por favor, entre em contato com o locatário para agendar o diagnóstico.<br/>` +
        `Você pode ver esta declaração no seu extranet técnico.<br/><br/>` +
        `Obrigado,<br/>PazProperty`
      );
      
      console.log(`McpWorkflowService: Simulating email to provider ${provider.email}`);
      console.log(`Subject: ${mailSubject}`);
      // console.log(`Body: ${mailBody}`); // Mail body can be long
      // TODO: Implement actual email sending logic here (e.g., using Resend, Supabase Edge Function for email)
      // await NotificationService.sendEmail(provider.email, mailSubject, mailBody, declaration.id);

      await this.logAction('provider_assigned_and_notified', {
        declarationId: declaration.id,
        providerId: provider.id,
        providerEmail: provider.email,
        status: updates.status,
        timestamp: new Date().toISOString()
      });

      const successMsg = `Provider ${provider.id} assigned to declaration ${declaration.id} and (simulated) notification sent.`;
      console.log(`McpWorkflowService: ${successMsg}`);
      return { success: true, message: successMsg, data: updatedDeclaration };

    } catch (error: any) {
      const errorMsg = 'Unexpected error during provider assignment and notification.';
      console.error(`McpWorkflowService: ${errorMsg}`, error);
      await this.logAction('assign_provider_failed', { declarationId, providerId, reason: errorMsg, error: error.message, timestamp: new Date().toISOString() });
      return { success: false, message: `${errorMsg} ${error.message}` };
    }
  }

  async logAction(actionName: string, metadata: any): Promise<void> {
    console.log(`McpWorkflowService: Logging action - ${actionName} with metadata:`, metadata);
    // TODO: Implement actual logging to a database table (e.g., 'historique_actions') if needed
    // For example:
    // const { error } = await this.supabase.from('historique_actions').insert([{ 
    //   action: actionName, 
    //   details: metadata, 
    //   declaration_id: metadata.declarationId, // if applicable
    //   user_id: metadata.userId // if applicable
    // }]);
    // if (error) console.error('McpWorkflowService: Error logging action:', error);
  }
  
  // TODO: Add other methods like handleClaimCreation if needed by API endpoints
}

export default new McpWorkflowService(); 