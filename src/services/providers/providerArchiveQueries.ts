
import { supabase } from "@/integrations/supabase/client";
import type { ServiceProvider } from "../types";

export const getArchivedProvidersList = async (): Promise<ServiceProvider[]> => {
  try {
    const { data, error } = await supabase
      .from('prestadores_de_servicos_old')
      .select('*')
      .order('deleted_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching archived providers:', error);
      return [];
    }
    
    return (data as any[] || []).map(provider => ({
      ...provider,
      tipo_de_obras: provider.tipo_de_obras as ServiceProvider['tipo_de_obras']
    }));
  } catch (err) {
    console.error('Error in getArchivedProvidersList:', err);
    return [];
  }
};

export const restoreProvider = async (id: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('restore_provider', { provider_id: id });
      
    if (error) {
      console.error('Error restoring provider:', error);
      return false;
    }
    
    return data || false;
  } catch (err) {
    console.error('Error in restoreProvider:', err);
    return false;
  }
};
