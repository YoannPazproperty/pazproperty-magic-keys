
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ServiceProvider } from "@/services/types";

const fetchProviders = async () => {
  const { data, error } = await supabase
    .from('prestadores_de_servicos')
    .select('id, empresa, nome_gerente, tipo_de_obras, email, telefone, cidade')
    .order('tipo_de_obras', { ascending: true });
    
  if (error) {
    throw error;
  }
  return data as Pick<ServiceProvider, 'id' | 'empresa' | 'nome_gerente' | 'tipo_de_obras' | 'email' | 'telefone' | 'cidade'>[];
};

export const useProviders = () => {
  return useQuery({
    queryKey: ['providers'],
    queryFn: fetchProviders
  });
};
