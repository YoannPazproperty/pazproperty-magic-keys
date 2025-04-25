
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Declaration } from "@/services/types";
import { useProviders } from "@/hooks/useProviders";

interface ProviderAssignmentProps {
  declaration: Declaration;
  onAssign: (providerId: string) => void;
}

export const ProviderAssignment = ({ declaration, onAssign }: ProviderAssignmentProps) => {
  const { data: providers, isLoading } = useProviders();

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Affecter un prestataire</h3>
      <Select
        disabled={isLoading}
        value={declaration.prestador_id || ""}
        onValueChange={onAssign}
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
