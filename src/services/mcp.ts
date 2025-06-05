/**
 * Master Control Program (MCP) for PazProperty
 *
 * This file contains the core structure for the MCP system that will handle
 * claim management, provider assignment, and action logging across the platform.
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type { Database } from '../integrations/supabase/types';

// Configuration de Supabase (met à jour avec tes clés/env vars si besoin)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Interface pour les données de réclamation
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
  mediaFiles: string[];
}

// Définir des types plus précis pour les données récupérées
type DeclarationRow = Database['public']['Tables']['declarations']['Row'];
type ProviderRow = Database['public']['Tables']['prestadores_de_servicos']['Row'];

class MasterControlProgram {
  /**
   * Récupère les détails d'une déclaration par son ID.
   */
  private async _getDeclarationDetailsById(declarationId: string): Promise<DeclarationRow | null> {
    const { data, error } = await supabase
      .from('declarations')
      .select('*')
      .eq('id', declarationId)
      .single();

    if (error) {
      console.error(`MCP: Error fetching declaration details for ID ${declarationId}:`, error);
      return null;
    }
    return data;
  }

  /**
   * Récupère les détails d'un prestataire par son ID.
   */
  private async _getProviderDetailsById(providerId: string): Promise<ProviderRow | null> {
    const { data, error } = await supabase
      .from('prestadores_de_servicos')
      .select('*')
      .eq('id', providerId)
      .single();

    if (error) {
      console.error(`MCP: Error fetching provider details for ID ${providerId}:`, error);
      return null;
    }
    return data;
  }

  /**
   * Crée une réclamation dans la base de données
   */
  async handleClaimCreation(claimData: ClaimData): Promise<void> {
    // Vérification des champs requis
    const requiredFields: (keyof ClaimData)[] = [
      'name', 'email', 'phone', 'property', 'city', 'postalCode',
      'issueType', 'description', 'urgency'
    ];

    for (const field of requiredFields) {
      if (!claimData[field]) {
        console.error(`MCP: Missing required field "${field}"`);
        return;
      }
    }

    // Création d'un UUID pour l'id
    const claimId = uuidv4();

    try {
      const { data, error } = await supabase
        .from('declarations')
        .insert([{
          id: claimId,
          name: claimData.name,
          email: claimData.email,
          phone: claimData.phone,
          property: claimData.property,
          city: claimData.city,
          postalCode: claimData.postalCode,
          issueType: claimData.issueType,
          description: claimData.description,
          urgency: claimData.urgency,
          mediaFiles: claimData.mediaFiles.join(','),
          submittedAt: new Date().toISOString(),
          status: 'Novo'
        }])
        .select()
        .single();

      if (error) {
        console.error('MCP: Error creating declaration in database:', error);
        return;
      }

      console.log('MCP: Declaration created successfully:', data);

      await this.logAction('create_declaration', {
        declarationId: claimId,
        name: claimData.name,
        issueType: claimData.issueType,
        status: 'Novo',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('MCP: Unexpected error during claim creation:', error);
    }
  }

  /**
   * Assigns a provider to a claim, updates status, and notifies the provider.
   * This is the new workflow method.
   */
  async assignProviderAndNotifyWorkflow(declarationId: string, providerId: string): Promise<boolean> {
    if (!providerId) {
      console.error('MCP: Provider ID is required for assignment.');
      await this.logAction('assign_provider_failed', { declarationId, reason: 'Missing providerId', timestamp: new Date().toISOString() });
      return false;
    }

    try {
      // 1. Fetch declaration details
      const declaration = await this._getDeclarationDetailsById(declarationId);
      if (!declaration) {
        console.error(`MCP: Declaration ${declarationId} not found.`);
        await this.logAction('assign_provider_failed', { declarationId, providerId, reason: 'Declaration not found', timestamp: new Date().toISOString() });
        return false;
      }

      // 2. Fetch provider details
      const provider = await this._getProviderDetailsById(providerId);
      if (!provider) {
        console.error(`MCP: Provider ${providerId} not found.`);
        await this.logAction('assign_provider_failed', { declarationId, providerId, reason: 'Provider not found', timestamp: new Date().toISOString() });
        return false;
      }

      // 3. Update the declaration in the database
      const updates: Partial<DeclarationRow> = {
        prestador_id: providerId,
        status: 'Em espera do encontro de diagnostico',
        prestador_assigned_at: new Date().toISOString(),
      };

      const { data: updatedDeclaration, error: updateError } = await supabase
        .from('declarations')
        .update(updates)
        .eq('id', declarationId)
        .select()
        .single();

      if (updateError) {
        console.error('MCP: Error updating declaration for provider assignment:', updateError);
        await this.logAction('assign_provider_failed', { declarationId, providerId, reason: 'DB update failed', error: updateError.message, timestamp: new Date().toISOString() });
        return false;
      }

      console.log('MCP: Declaration updated successfully for provider assignment:', updatedDeclaration);

      // 4. Send email to the provider (simulation for now)
      const mailSubject = `Nova intervenção atribuída: Sinistro #${declaration.id}`;
      const mailBody = `
        Olá ${provider.nome_gerente || provider.empresa},

        Uma nova intervenção foi atribuída a você:

        Detalhes do Sinistro:
        - ID do Sinistro: ${declaration.id}
        - Tipo de Intervenção: ${declaration.issueType || 'N/A'}
        - Descrição: ${declaration.description || 'N/A'}
        - Mídia: ${declaration.mediaFiles || 'Nenhuma mídia fornecida'}

        Informações do Locatário:
        - Nome: ${declaration.name}
        - Telefone: ${declaration.phone || 'N/A'}
        - Email: ${declaration.email || 'N/A'}
        - Endereço: ${declaration.property || ''}, ${declaration.city || ''}, ${declaration.postalCode || ''}

        Por favor, entre em contato com o locatário para agendar o diagnóstico.
        Você pode ver esta declaração no seu extranet técnico.

        Obrigado,
        PazProperty
      `;
      console.log(`MCP: Simulating email to provider ${provider.email}`);
      console.log(`Subject: ${mailSubject}`);
      console.log(`Body: ${mailBody}`);
      // TODO: Replace with actual email service call:
      // await NotificationService.sendEmail(provider.email, mailSubject, mailBody, declaration.id);


      // 5. Log the action
      await this.logAction('provider_assigned_and_notified', {
        declarationId: declaration.id,
        providerId: provider.id,
        providerEmail: provider.email,
        status: updates.status,
        timestamp: new Date().toISOString()
      });

      console.log(`MCP: Provider ${provider.id} assigned to declaration ${declaration.id} and notified.`);
      return true;

    } catch (error: any) {
      console.error('MCP: Unexpected error during provider assignment and notification:', error);
      await this.logAction('assign_provider_failed', { declarationId, providerId, reason: 'Unexpected error', error: error.message, timestamp: new Date().toISOString() });
      return false;
    }
  }

  /**
   * Simule l'affectation d'un prestataire à une réclamation
   */
  async assignProviderToClaim(claimId: string, prestadorId: string): Promise<void> {
    console.log('MCP: Simulating provider assignment - Claim:', claimId, 'Prestador:', prestadorId);
  }

  /**
   * Simule l'enregistrement d'une action
   */
  async logAction(actionName: string, metadata: any): Promise<void> {
    console.log('MCP: Simulating action log -', actionName, 'with metadata:', metadata);
  }
}

const MCP = new MasterControlProgram();
export default MCP;
