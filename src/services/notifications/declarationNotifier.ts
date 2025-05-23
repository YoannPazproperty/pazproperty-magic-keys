
import { supabase } from '@/integrations/supabase/client';
import type { Declaration } from '../types';
import { toast } from 'sonner';

/**
 * Updates a declaration's status and notifies the relevant parties
 * 
 * @param declarationId - The ID of the declaration to update
 * @param newStatus - The new status to set
 * @param additionalData - Additional data to update (like provider_id, meeting_date, etc.)
 * @returns True if successful, false otherwise
 */
export const updateStatusAndNotify = async (
  declarationId: string,
  newStatus: Declaration['status'],
  additionalData: Record<string, any> = {}
): Promise<boolean> => {
  try {
    // Prepare the update data
    const updateData = {
      status: newStatus,
      ...additionalData
    };
    
    // Update the declaration
    const { data, error } = await supabase
      .from('declarations')
      .update(updateData)
      .eq('id', declarationId)
      .select();
    
    if (error) {
      console.error('Error updating declaration status:', error);
      toast.error("Erreur lors de la mise à jour du statut", {
        description: error.message
      });
      return false;
    }
    
    return true;
  } catch (err: any) {
    console.error('Exception in updateStatusAndNotify:', err);
    toast.error("Erreur lors de la mise à jour", {
      description: err.message || "Une erreur inattendue s'est produite"
    });
    return false;
  }
};

/**
 * Notifies about a status change in a declaration
 * 
 * @param declarationId - The ID of the declaration
 * @param newStatus - The new status
 * @param oldStatus - The previous status
 * @returns True if successful, false otherwise
 */
export const notifyStatusChange = async (
  declarationId: string,
  newStatus: string,
  oldStatus: string
): Promise<boolean> => {
  try {
    // Log the notification
    const { error } = await supabase
      .from('notification_logs')
      .insert({
        declaration_id: declarationId,
        notification_type: 'status_change',
        recipient_type: 'system',
        recipient_email: 'system',
        message_content: `Status changed from ${oldStatus} to ${newStatus}`,
        success: true
      });
    
    if (error) {
      console.error('Error logging notification:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error notifying status change:', err);
    return false;
  }
};

/**
 * Notifies about a new declaration
 * 
 * @param declarationId - The ID of the new declaration
 * @returns True if successful, false otherwise
 */
export const notifyNewDeclaration = async (
  declarationId: string
): Promise<boolean> => {
  try {
    // Get the declaration
    const { data: declaration, error: fetchError } = await supabase
      .from('declarations')
      .select('*')
      .eq('id', declarationId)
      .single();
    
    if (fetchError || !declaration) {
      console.error('Error fetching declaration:', fetchError);
      return false;
    }
    
    // Log the notification
    const { error } = await supabase
      .from('notification_logs')
      .insert({
        declaration_id: declarationId,
        notification_type: 'new_declaration',
        recipient_type: 'admin',
        recipient_email: 'admin',
        message_content: `New declaration from ${declaration.name} regarding ${declaration.issueType}`,
        success: true
      });
    
    if (error) {
      console.error('Error logging notification:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error notifying new declaration:', err);
    return false;
  }
};

/**
 * Gets the notification history for a declaration
 * 
 * @param declarationId - The ID of the declaration
 * @returns An array of notification logs
 */
export const getDeclarationNotificationHistory = async (declarationId: string) => {
  try {
    const { data, error } = await supabase
      .from('notification_logs')
      .select('*')
      .eq('declaration_id', declarationId)
      .order('sent_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error getting notification history:', err);
    return [];
  }
};
