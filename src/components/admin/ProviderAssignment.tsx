
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Declaration } from "@/services/types";
import { useQuery } from "@tanstack/react-query";

interface ProviderAssignmentProps {
  declaration: Declaration;
  onAssign: (providerId: string) => void;
}

const fetchProviders = async () => {
  const { data, error } = await supabase
    .from('prestadores_de_servicos')
    .select('id, empresa, nome_gerente');
    
  if (error) {
    throw error;
  }
  return data;
};

export const ProviderAssignment = ({ declaration, onAssign }: ProviderAssignmentProps) => {
  const { data: providers, isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: fetchProviders
  });

  const handleAssignment = (providerId: string) => {
    onAssign(providerId);
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Affecter un prestataire</h3>
      <Select
        disabled={isLoading}
        value={declaration.prestador_id || ""}
        onValueChange={handleAssignment}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choisir un prestataire" />
        </SelectTrigger>
        <SelectContent>
          {providers?.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              {provider.empresa} - {provider.nome_gerente}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
