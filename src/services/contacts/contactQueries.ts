
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
