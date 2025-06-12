import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '../types/supabase/types';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs'; // Import filesystem module

// Explicitly load .env file from the service's root directory
// NOTE: This seems to be failing silently. Bypassing with direct credentials for now.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define local types for clarity and safety
type DeclarationRow = Database['public']['Tables']['declarations']['Row'];
type DeclarationStatus = NonNullable<DeclarationRow['status']>; // Assure que le statut ne peut pas être null ici
type ProviderRow = Database['public']['Tables']['prestadores_de_servicos']['Row'];
type HistoriqueActionInsert = Database['public']['Tables']['historique_actions']['Insert'];

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

export class McpWorkflowService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("--- DEBUG from McpWorkflowService ---");
      console.error("Failed to load environment variables.");
      console.error("Supabase URL loaded:", !!supabaseUrl);
      console.error("Supabase Service Key loaded:", !!supabaseServiceKey);
      console.error("--------------------------------------");
      throw new Error('Supabase URL and Service Key are required environment variables.');
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  }

  async assignProviderAndNotifyWorkflow(declarationId: string, providerId: string) {
    console.log(`McpWorkflowService: Starting workflow for declaration ${declarationId} with provider ${providerId}`);
    
    const declarationDetails = await this._getDeclarationDetailsById(declarationId);
    if (!declarationDetails) {
      throw new Error(`Could not retrieve details for declaration ${declarationId}.`);
    }

    const providerDetails = await this._getProviderDetailsById(providerId);
    if (!providerDetails) {
      throw new Error(`Could not retrieve details for provider ${providerId}.`);
    }

    // --- Logging ---
    await this._logAction(
      'System',
      declarationId,
      'provider_assigned',
      `Provider ${providerDetails.empresa} assigned by trigger.`
    );

    // Étape 2: Appeler l'Edge Function pour notifier le prestataire
    const notificationPayload = {
      declarationId: declarationId,
      providerEmail: providerDetails.email,
      providerName: providerDetails.empresa,
      customerName: declarationDetails.name,
      customerPhone: declarationDetails.phone,
      customerEmail: declarationDetails.email,
      customerAddress: `${declarationDetails.property}, ${declarationDetails.postalCode} ${declarationDetails.city}`,
      interventionType: declarationDetails.issueType,
      freeTextMessage: declarationDetails.description,
      mediaLinks: declarationDetails.mediaFiles ? JSON.parse(declarationDetails.mediaFiles) : [],
    };

    const { data: funcData, error: funcError } = await this.supabase.functions.invoke(
      'send-provider-notification',
      { body: notificationPayload }
    );

    if (funcError) {
      console.error('McpWorkflowService: Error invoking send-provider-notification function:', funcError);
      await this._logAction('System', declarationId, 'notification_failed', `Failed to send email to ${providerDetails.empresa}: ${funcError.message}`);
    } else {
      console.log('McpWorkflowService: Successfully invoked send-provider-notification function.', funcData);
      await this._logAction('System', declarationId, 'notification_sent', `Email sent to ${providerDetails.empresa}.`);
    }
    
    return {
      success: true,
      message: `Workflow initiated for declaration ${declarationId}. Provider ${providerDetails.empresa} will be notified.`,
      data: { declarationId: declarationId }
    };
  }

  // --- Méthodes privées ---

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
    return data;
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
    return data;
  }

  private async _logAction(actor: string, declaration_id: string, action_type: string, details: string) {
    const logEntry: HistoriqueActionInsert = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        utilisateur: actor,
        affaire_id: declaration_id,
        action: action_type,
        notes: details,
    };
    const { error } = await this.supabase.from('historique_actions').insert(logEntry);
    if (error) console.error('Error logging action:', error);
  }
}