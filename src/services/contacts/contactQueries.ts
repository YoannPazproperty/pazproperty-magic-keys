
import { supabase } from "../../integrations/supabase/client";
import type { CommercialContact } from "../types";

export const getContacts = async (): Promise<CommercialContact[]> => {
  const { data, error } = await supabase
    .from('contactos_comerciais')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }

  return data || [];
};

export const getContactById = async (id: string): Promise<CommercialContact | null> => {
  const { data, error } = await supabase
    .from('contactos_comerciais')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }

  return data;
};

export const createContact = async (contactData: Omit<CommercialContact, 'id' | 'created_at'>): Promise<CommercialContact | null> => {
  const { data, error } = await supabase
    .from('contactos_comerciais')
    .insert(contactData)
    .select()
    .single();

  if (error) {
    console.error('Error creating contact:', error);
    throw error;
  }

  return data;
};

export const updateContact = async (id: string, updates: Partial<Omit<CommercialContact, 'id' | 'created_at'>>): Promise<CommercialContact | null> => {
  const { data, error } = await supabase
    .from('contactos_comerciais')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating contact:', error);
    throw error;
  }

  return data;
};

export const deleteContact = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('contactos_comerciais')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }

  return true;
};
