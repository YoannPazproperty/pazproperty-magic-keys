
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
    
    return (data as any[] || []).map(provider => ({
      ...provider,
      tipo_de_obras: provider.tipo_de_obras as ServiceProvider['tipo_de_obras']
    }));
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
    
    return {
      ...data,
      tipo_de_obras: data.tipo_de_obras as ServiceProvider['tipo_de_obras']
    };
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
    
    return {
      ...data,
      tipo_de_obras: data.tipo_de_obras as ServiceProvider['tipo_de_obras']
    };
  } catch (err) {
    console.error('Error in updateProvider:', err);
    return null;
  }
};

export const deleteProvider = async (id: string): Promise<boolean> => {
  try {
    console.log(`Attempting to delete provider with ID: ${id}`);
    
    // Vérifier si le prestataire existe avant la suppression
    const { data: existingProvider, error: fetchError } = await supabase
      .from('prestadores_de_servicos')
      .select('id, empresa')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching provider before deletion:', fetchError);
      return false;
    }
    
    if (!existingProvider) {
      console.error('Provider not found:', id);
      return false;
    }
    
    console.log(`Found provider to delete: ${existingProvider.empresa}`);
    
    // Supprimer d'abord les références dans prestadores_roles
    console.log(`Deleting provider roles for provider ID: ${id}`);
    const { error: rolesError } = await supabase
      .from('prestadores_roles')
      .delete()
      .eq('prestador_id', id);
      
    if (rolesError) {
      console.error('Error deleting provider roles:', rolesError);
      console.error('Error details:', rolesError.message, rolesError.details, rolesError.hint);
      return false;
    }
    
    // Procéder ensuite à la suppression du prestataire
    const { error } = await supabase
      .from('prestadores_de_servicos')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting provider:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return false;
    }
    
    console.log(`Successfully deleted provider: ${existingProvider.empresa}`);
    return true;
  } catch (err) {
    console.error('Exception in deleteProvider:', err);
    return false;
  }
};

