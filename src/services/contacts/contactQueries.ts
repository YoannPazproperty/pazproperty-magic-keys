
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
