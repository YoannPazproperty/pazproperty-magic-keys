
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import type { Declaration } from "@/services/types";

export const useProviderDeclarations = () => {
  const { user } = useAuth();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadDeclarations = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, get the provider ID associated with this user
      const { data: providerRole, error: providerError } = await supabase
        .from('prestadores_roles')
        .select('prestador_id')
        .eq('user_id', user.id)
        .single();

      if (providerError || !providerRole?.prestador_id) {
        console.error('Error fetching provider ID:', providerError);
        setError(new Error('Could not fetch provider details'));
        toast.error("Erro ao carregar as informações do prestador");
        setIsLoading(false);
        return;
      }

      console.log(`Found provider ID for user ${user.id}: ${providerRole.prestador_id}`);

      // Then, get all declarations assigned to this provider
      const { data, error: declarationsError } = await supabase
        .from('declarations')
        .select('*')
        .eq('prestador_id', providerRole.prestador_id);

      if (declarationsError) {
        console.error('Error fetching declarations:', declarationsError);
        setError(new Error('Could not fetch declarations'));
        toast.error("Erro ao carregar as declarações");
        setDeclarations([]);
      } else {
        console.log(`Loaded ${data?.length || 0} declarations for provider ${providerRole.prestador_id}`);
        
        // Process the mediaFiles field to convert from JSON string to object if needed
        const processedDeclarations = data?.map((declaration: any) => ({
          ...declaration,
          mediaFiles: typeof declaration.mediaFiles === 'string' 
            ? JSON.parse(declaration.mediaFiles || '[]') 
            : declaration.mediaFiles || []
        })) || [];
        
        setDeclarations(processedDeclarations);

        if (processedDeclarations.length > 0) {
          toast.success(`${processedDeclarations.length} declarações carregadas`);
        }
      }
    } catch (err) {
      console.error('Exception loading declarations:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      toast.error("Erro ao processar as declarações");
      setDeclarations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeclarations();
  }, [user?.id]);

  return {
    declarations,
    isLoading,
    error,
    refresh: loadDeclarations
  };
};
