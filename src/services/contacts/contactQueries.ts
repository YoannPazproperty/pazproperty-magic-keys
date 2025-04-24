
import { supabase } from "@/integrations/supabase/client";
import type { CommercialContact } from "../types";

export const getContactsList = async (): Promise<CommercialContact[]> => {
  try {
    const { data, error } = await supabase
      .from('contactos_comerciais')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error in getContactsList:', err);
    return [];
  }
};

export const createContact = async (contact: Omit<CommercialContact, 'id' | 'created_at'>): Promise<CommercialContact | null> => {
  try {
    const { data, error } = await supabase
      .from('contactos_comerciais')
      .insert(contact)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating contact:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error in createContact:', err);
    return null;
  }
};

export const updateContact = async (id: string, contact: Partial<CommercialContact>): Promise<CommercialContact | null> => {
  try {
    const { data, error } = await supabase
      .from('contactos_comerciais')
      .update(contact)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating contact:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error in updateContact:', err);
    return null;
  }
};

export const deleteContact = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contactos_comerciais')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting contact:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in deleteContact:', err);
    return false;
  }
};
