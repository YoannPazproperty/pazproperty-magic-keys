
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import type { ServiceProvider } from "@/services/types";

export const useProviderDetails = () => {
  const [providerDetails, setProviderDetails] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProviderDetails = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // First, check if the user has a provider role by querying prestadores_roles
        const { data: roleData, error: roleError } = await supabase
          .from('prestadores_roles')
          .select('prestador_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleError) {
          throw roleError;
        }

        if (!roleData || !roleData.prestador_id) {
          setLoading(false);
          return;
        }

        // Now fetch the provider details using the prestador_id
        const { data: providerData, error: providerError } = await supabase
          .from('prestadores_de_servicos')
          .select('*')
          .eq('id', roleData.prestador_id)
          .single();

        if (providerError) {
          throw providerError;
        }

        setProviderDetails(providerData as ServiceProvider);
      } catch (err: any) {
        console.error('Error fetching provider details:', err);
        setError(err.message || 'Failed to fetch provider details');
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [user]);

  return { providerDetails, loading, error };
};
