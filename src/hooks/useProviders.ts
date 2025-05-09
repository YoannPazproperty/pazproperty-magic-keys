
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ServiceProvider } from "@/services/types";

const fetchProviders = async (): Promise<ServiceProvider[]> => {
  const { data, error } = await supabase
    .from('prestadores_de_servicos')
    .select('id, empresa, nome_gerente, tipo_de_obras, email, telefone, cidade, created_at')
    .order('tipo_de_obras', { ascending: true });
    
  if (error) {
    throw error;
  }
  
  // Ensure all objects conform to ServiceProvider type
  return (data || []).map((provider) => ({
    ...provider,
    tipo_de_obras: provider.tipo_de_obras as ServiceProvider["tipo_de_obras"],
    created_at: provider.created_at || new Date().toISOString()
  })) as ServiceProvider[];
};

export const useProviders = () => {
  return useQuery({
    queryKey: ['providers'],
    queryFn: fetchProviders
  });
};
