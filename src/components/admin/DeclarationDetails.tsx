
import { TenantInfo } from "./declaration-details/TenantInfo";
import { ProblemInfo } from "./declaration-details/ProblemInfo";
import { MediaFiles } from "./declaration-details/MediaFiles";
import { StatusUpdate } from "./declaration-details/StatusUpdate";
import { MondayInfo } from "./declaration-details/MondayInfo";
import { ProviderAssignment } from "./declaration-details/ProviderAssignment";
import type { Declaration } from "@/services/types";

interface DeclarationDetailsProps {
  declaration: Declaration;
  onStatusUpdate: (id: string, status: Declaration["status"]) => void;
  getStatusBadgeColor: (status: string) => string;
  translateStatus: (status: string) => string;
}

export const DeclarationDetails = ({ 
  declaration, 
  onStatusUpdate,
  getStatusBadgeColor,
  translateStatus
}: DeclarationDetailsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        <TenantInfo declaration={declaration} />
        <ProblemInfo 
          declaration={declaration}
          getStatusBadgeColor={getStatusBadgeColor}
          translateStatus={translateStatus}
        />
      </div>
      
      <div className="space-y-2 py-2">
        <h3 className="font-semibold">Description du problème</h3>
        <div className="bg-gray-50 p-3 rounded-md border">
          <p>{declaration.description}</p>
        </div>
      </div>
      
      <ProviderAssignment declaration={declaration} />
      
      <MediaFiles files={declaration.mediaFiles} />
      
      <MondayInfo mondayId={declaration.mondayId} />
      
      <StatusUpdate 
        currentStatus={declaration.status}
        onStatusUpdate={(status) => onStatusUpdate(declaration.id, status)}
      />
    </>
  );
};
