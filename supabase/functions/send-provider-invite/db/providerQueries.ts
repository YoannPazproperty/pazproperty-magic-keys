
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

/**
 * Gets provider data from the database
 */
export const getProviderData = async (supabase: SupabaseClient, providerId: string) => {
  try {
    const { data, error } = await supabase
      .from('prestadores_de_servicos')
      .select('id, empresa, email, nome_gerente, telefone, tipo_de_obras')
      .eq('id', providerId)
      .single();

    if (error) {
      console.error('Error getting provider data:', error);
      throw new Error(`Failed to retrieve provider: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }

    return data;
  } catch (error) {
    console.error('Exception getting provider data:', error);
    throw error;
  }
};
