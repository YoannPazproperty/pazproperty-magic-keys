
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
    
    // Cast data as CommercialContact[] après avoir vérifié que tipo est valide
    return (data || []).map(item => {
      // S'assurer que le tipo est l'un des types valides
      const validTipo = ["Proprietario", "Inquilino", "Outros", "Agente Imobiliario"].includes(item.tipo) 
        ? (item.tipo as CommercialContact["tipo"])
        : "Outros"; // Valeur par défaut

      return {
        ...item,
        tipo: validTipo
      } as CommercialContact;
    });
  } catch (err) {
    console.error('Error in getContactsList:', err);
    return [];
  }
};

export const getContactById = async (id: string): Promise<CommercialContact | null> => {
  try {
    const { data, error } = await supabase
      .from('contactos_comerciais')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching contact with ID ${id}:`, error);
      return null;
    }
    
    // Valider le tipo
    const validTipo = ["Proprietario", "Inquilino", "Outros", "Agente Imobiliario"].includes(data.tipo) 
      ? (data.tipo as CommercialContact["tipo"])
      : "Outros";
    
    return {
      ...data,
      tipo: validTipo
    } as CommercialContact;
  } catch (err) {
    console.error(`Error in getContactById for ID ${id}:`, err);
    return null;
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
    
    // Cast data as CommercialContact
    return {
      ...data,
      tipo: data.tipo as CommercialContact["tipo"]
    } as CommercialContact;
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
    
    // Cast data as CommercialContact
    return {
      ...data,
      tipo: data.tipo as CommercialContact["tipo"]
    } as CommercialContact;
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
