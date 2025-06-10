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

class McpWorkflowService {
  private supabase: SupabaseClient<Database>;

  constructor(options?: { supabaseUrl?: string, supabaseServiceKey?: string }) {
    const supabaseUrl = options?.supabaseUrl || process.env.SUPABASE_URL;
    const supabaseServiceKey = options?.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY;

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

    // Étape 1: Mettre à jour la déclaration avec le nouveau statut et l'ID du prestataire
    const updateData: { status: DeclarationStatus; prestador_id: string } = {
      status: 'Em espera do encontro de diagnostico',
      prestador_id: providerId,
    };

    const { data: updatedDeclaration, error: updateError } = await this.supabase
      .from('declarations')
      .update(updateData)
      .eq('id', declarationId)
      .select()
      .single();

    if (updateError) {
      console.error(`McpWorkflowService: Error updating declaration:`, updateError);
      throw new Error(`Failed to update declaration ${declarationId}: ${updateError.message}`);
    }

    if (!updatedDeclaration) {
        throw new Error(`Declaration with ID ${declarationId} not found after update.`);
    }

    console.log(`McpWorkflowService: Successfully updated declaration ${declarationId}.`);
    
    // ... Le reste de la logique reste le même
    const declarationDetails = await this._getDeclarationDetailsById(declarationId);
    if (!declarationDetails) {
      throw new Error(`Could not retrieve details for declaration ${declarationId} after update.`);
    }

    const providerDetails = await this._getProviderDetailsById(providerId);
    if (!providerDetails) {
      throw new Error(`Could not retrieve details for provider ${providerId}.`);
    }

    // --- Logging ---
    const logAction = async (actor: string, declaration_id: string, action_type: string, details: string) => {
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
    };

    logAction(
      'System',
      declarationId,
      'status_update',
      'Status changed to Em espera do encontro de diagnostico'
    );
    logAction(
      'System',
      declarationId,
      'provider_assigned',
      `Provider ${providerDetails.empresa} assigned.`
    );

    // Étape 2: Simuler la notification au prestataire
    console.log('--- Simulating Email Notification to Provider ---');
    console.log(`To: ${providerDetails.email}`);
    console.log(`Subject: Nova declaração de sinistro atribuída: ${declarationDetails.id}`);
    console.log('Body:');
    console.log(`  - Cliente: ${declarationDetails.name}`);
    console.log(`  - Contacto: ${declarationDetails.email}, ${declarationDetails.phone}`);
    console.log(`  - Morada: ${declarationDetails.property}, ${declarationDetails.postalCode} ${declarationDetails.city}`);
    console.log(`  - Problema: ${declarationDetails.issueType}`);
    console.log('-------------------------------------------------');

    return {
      success: true,
      message: `Workflow started for declaration ${declarationId}. Provider ${providerDetails.empresa} assigned and notified.`,
      data: updatedDeclaration,
    };
  }

  // --- Méthodes privées pour les détails ---

  private async _getDeclarationDetailsById(declarationId: string): Promise<DeclarationRow | null> {
    const { data, error } = await this.supabase
      .from('declarations')
      .select('*')
      .eq('id', declarationId)
      .single();

    if (error) {
      console.error(`McpWorkflowService: Error fetching declaration details:`, error);
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
      console.error(`McpWorkflowService: Error fetching provider details:`, error);
      return null;
    }
    return data;
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

  private async _updateDeclaration(declarationId: string, newStatus: DeclarationStatus, updates?: object): Promise<DeclarationRow | null> {
    const updateData: { status: DeclarationStatus; [key: string]: any } = {
      status: newStatus,
    };

    if (updates) {
      // ... existing code ...
    }

    const { data: updatedDeclaration, error: updateError } = await this.supabase
      .from('declarations')
      .update(updateData)
      .eq('id', declarationId)
      .select()
      .single();

    if (updateError) {
      console.error(`McpWorkflowService: Error updating declaration:`, updateError);
      return null;
    }

    return updatedDeclaration;
  }
}

export default McpWorkflowService; 