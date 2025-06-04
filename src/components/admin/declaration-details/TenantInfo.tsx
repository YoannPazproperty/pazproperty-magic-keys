import type { Declaration } from "../../../services/types";

interface TenantInfoProps {
  declaration: Declaration;
}

export const TenantInfo = ({ declaration }: TenantInfoProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Informations du locataire</h3>
      <p><span className="font-medium">Nom:</span> {declaration.name}</p>
      <p><span className="font-medium">Email:</span> {declaration.email}</p>
      <p><span className="font-medium">Téléphone:</span> {declaration.phone}</p>
      {declaration.nif && (
        <p><span className="font-medium">NIF:</span> {declaration.nif}</p>
      )}
    </div>
  );
};
