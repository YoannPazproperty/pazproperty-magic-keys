
import { supabase } from "@/integrations/supabase/client";
import type { ServiceProvider } from "../types";

export const getProvidersList = async (): Promise<ServiceProvider[]> => {
  try {
    const { data, error } = await supabase
      .from('prestadores_de_servicos')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching providers:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error in getProvidersList:', err);
    return [];
  }
};

export const createProvider = async (provider: Omit<ServiceProvider, 'id' | 'created_at'>): Promise<ServiceProvider | null> => {
  try {
    const { data, error } = await supabase
      .from('prestadores_de_servicos')
      .insert(provider)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating provider:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error in createProvider:', err);
    return null;
  }
};

export const updateProvider = async (id: string, provider: Partial<ServiceProvider>): Promise<ServiceProvider | null> => {
  try {
    const { data, error } = await supabase
      .from('prestadores_de_servicos')
      .update(provider)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating provider:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error in updateProvider:', err);
    return null;
  }
};

export const deleteProvider = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('prestadores_de_servicos')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting provider:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in deleteProvider:', err);
    return false;
  }
};
