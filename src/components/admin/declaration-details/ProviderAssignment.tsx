
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Declaration, ServiceProvider } from "@/services/types";
import { useProviders } from "@/hooks/useProviders";
import { useProviderAssignment } from "@/hooks/useProviderAssignment";

interface ProviderAssignmentProps {
  declaration: Declaration;
}

export const ProviderAssignment = ({ declaration }: ProviderAssignmentProps) => {
  const { data: providers, isLoading } = useProviders();
  const { handleProviderAssignment } = useProviderAssignment();

  const formatProviderDisplay = (provider: any) => {
    const phone = provider.telefone || 'No phone';
    return `${provider.tipo_de_obras} - ${provider.empresa} - ${provider.email} - ${phone}`;
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Affecter un prestataire</h3>
      <Select
        disabled={isLoading}
        value={declaration.prestador_id || ""}
        onValueChange={(providerId) => handleProviderAssignment(declaration.id, providerId)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choisir un prestataire" />
        </SelectTrigger>
        <SelectContent>
          {providers?.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              {formatProviderDisplay(provider)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
