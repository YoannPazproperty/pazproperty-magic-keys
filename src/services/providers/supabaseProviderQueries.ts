import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProviderDropdownItem } from "@/services/types";

export const getSupabaseProvidersForDropdown = async (): Promise<ProviderDropdownItem[]> => {
  try {
    if (!supabase) {
      toast.error("Erro de conexão com o servidor.");
      return [];
    }

    const { data, error } = await supabase
      .from('prestadores_de_servicos')
      .select('id, empresa, tipo_de_obras')
      .order('empresa', { ascending: true });

    if (error) {
      console.error('Erro ao obter prestadores:', error);
      toast.error("Erro ao obter a lista de prestadores.", {
        description: error.message,
      });
      return [];
    }
    
    return (data || []).map(provider => ({
      id: provider.id,
      name: provider.empresa,
      specialty: provider.tipo_de_obras,
    }));

  } catch (err) {
    console.error('Erro inesperado:', err);
    toast.error("Ocorreu um erro inesperado ao buscar prestadores.");
    return [];
  }
}; 