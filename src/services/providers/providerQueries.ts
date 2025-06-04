
import { supabase } from "../../integrations/supabase/client";
import type { ServiceProvider } from "../types";

export const getProviders = async (): Promise<ServiceProvider[]> => {
  const { data, error } = await supabase
    .from('prestadores_de_servicos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching providers:', error);
    throw error;
  }

  return data || [];
};

export const getProvidersList = async (): Promise<ServiceProvider[]> => {
  return getProviders();
};

export const getProviderById = async (id: string): Promise<ServiceProvider | null> => {
  const { data, error } = await supabase
    .from('prestadores_de_servicos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching provider:', error);
    throw error;
  }

  return data;
};

export const createProvider = async (providerData: Omit<ServiceProvider, 'id' | 'created_at'>): Promise<ServiceProvider | null> => {
  const { data, error } = await supabase
    .from('prestadores_de_servicos')
    .insert(providerData)
    .select()
    .single();

  if (error) {
    console.error('Error creating provider:', error);
    throw error;
  }

  return data;
};

export const updateProvider = async (id: string, updates: Partial<Omit<ServiceProvider, 'id' | 'created_at'>>): Promise<ServiceProvider | null> => {
  const { data, error } = await supabase
    .from('prestadores_de_servicos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating provider:', error);
    throw error;
  }

  return data;
};

export const deleteProvider = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('prestadores_de_servicos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting provider:', error);
    throw error;
  }

  return true;
};

export const archiveProvider = async (id: string): Promise<boolean> => {
  try {
    // Move to archive table
    const { data: provider, error: fetchError } = await supabase
      .from('prestadores_de_servicos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { error: insertError } = await supabase
      .from('prestadores_de_servicos_old')
      .insert({
        ...provider,
        deleted_at: new Date().toISOString()
      });

    if (insertError) throw insertError;

    // Delete from main table
    const { error: deleteError } = await supabase
      .from('prestadores_de_servicos')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return true;
  } catch (error) {
    console.error('Error archiving provider:', error);
    throw error;
  }
};
