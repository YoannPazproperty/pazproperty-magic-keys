
import { supabase } from "../../integrations/supabase/client";
import type { Affaire, AffaireFormData, HistoriqueAction, HistoriqueActionFormData, StatutAffaire } from "../types";
import { toast } from "sonner";

/**
 * Récupère toutes les affaires
 */
export const getAllAffaires = async (): Promise<Affaire[]> => {
  try {
    const { data, error } = await supabase
      .from('affaires')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des affaires:', error);
      throw error;
    }
    
    return (data || []).map(affaire => ({
      ...affaire,
      statut: affaire.statut as StatutAffaire
    }));
  } catch (err) {
    console.error('Exception lors de la récupération des affaires:', err);
    throw err;
  }
};

/**
 * Récupère les affaires pour un contact spécifique
 */
export const getAffairesByContactId = async (contactId: string): Promise<Affaire[]> => {
  try {
    const { data, error } = await supabase
      .from('affaires')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Erreur lors de la récupération des affaires pour le contact ${contactId}:`, error);
      throw error;
    }
    
    return (data || []).map(affaire => ({
      ...affaire,
      statut: affaire.statut as StatutAffaire
    }));
  } catch (err) {
    console.error(`Exception lors de la récupération des affaires pour le contact ${contactId}:`, err);
    throw err;
  }
};

/**
 * Récupère une affaire par son ID
 */
export const getAffaireById = async (affaireId: string): Promise<Affaire | null> => {
  try {
    const { data, error } = await supabase
      .from('affaires')
      .select('*')
      .eq('id', affaireId)
      .single();
    
    if (error) {
      console.error(`Erreur lors de la récupération de l'affaire ${affaireId}:`, error);
      throw error;
    }
    
    return {
      ...data,
      statut: data.statut as StatutAffaire
    };
  } catch (err) {
    console.error(`Exception lors de la récupération de l'affaire ${affaireId}:`, err);
    throw err;
  }
};

/**
 * Crée une nouvelle affaire
 */
export const createAffaire = async (affaire: AffaireFormData): Promise<Affaire | null> => {
  try {
    const { data, error } = await supabase
      .from('affaires')
      .insert(affaire)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création de l\'affaire:', error);
      throw error;
    }
    
    toast.success('Affaire créée avec succès');
    return {
      ...data,
      statut: data.statut as StatutAffaire
    };
  } catch (err) {
    console.error('Exception lors de la création de l\'affaire:', err);
    toast.error('Erreur lors de la création de l\'affaire');
    throw err;
  }
};

/**
 * Met à jour une affaire existante
 */
export const updateAffaire = async (affaireId: string, updates: Partial<AffaireFormData>): Promise<Affaire | null> => {
  try {
    const { data, error } = await supabase
      .from('affaires')
      .update(updates)
      .eq('id', affaireId)
      .select()
      .single();
    
    if (error) {
      console.error(`Erreur lors de la mise à jour de l'affaire ${affaireId}:`, error);
      throw error;
    }
    
    toast.success('Affaire mise à jour avec succès');
    return {
      ...data,
      statut: data.statut as StatutAffaire
    };
  } catch (err) {
    console.error(`Exception lors de la mise à jour de l'affaire ${affaireId}:`, err);
    toast.error('Erreur lors de la mise à jour de l\'affaire');
    throw err;
  }
};

/**
 * Supprime une affaire
 */
export const deleteAffaire = async (affaireId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('affaires')
      .delete()
      .eq('id', affaireId);
    
    if (error) {
      console.error(`Erreur lors de la suppression de l'affaire ${affaireId}:`, error);
      throw error;
    }
    
    toast.success('Affaire supprimée avec succès');
    return true;
  } catch (err) {
    console.error(`Exception lors de la suppression de l'affaire ${affaireId}:`, err);
    toast.error('Erreur lors de la suppression de l\'affaire');
    throw err;
  }
};

/**
 * Récupère l'historique des actions pour une affaire
 */
export const getHistoriqueActions = async (affaireId: string): Promise<HistoriqueAction[]> => {
  try {
    const { data, error } = await supabase
      .from('historique_actions')
      .select('*')
      .eq('affaire_id', affaireId)
      .order('date', { ascending: false });
    
    if (error) {
      console.error(`Erreur lors de la récupération de l'historique pour l'affaire ${affaireId}:`, error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error(`Exception lors de la récupération de l'historique pour l'affaire ${affaireId}:`, err);
    throw err;
  }
};

/**
 * Ajoute une action à l'historique
 */
export const addHistoriqueAction = async (action: HistoriqueActionFormData): Promise<HistoriqueAction | null> => {
  try {
    const { data, error } = await supabase
      .from('historique_actions')
      .insert(action)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de l\'ajout d\'une action:', error);
      throw error;
    }
    
    toast.success('Action enregistrée avec succès');
    return data;
  } catch (err) {
    console.error('Exception lors de l\'ajout d\'une action:', err);
    toast.error('Erreur lors de l\'enregistrement de l\'action');
    throw err;
  }
};
