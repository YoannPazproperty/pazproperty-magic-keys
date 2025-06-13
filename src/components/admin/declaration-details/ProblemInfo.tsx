import { Badge } from "../../ui/badge";
import type { Declaration } from "../../../services/types";
import { translateIssueType, translateUrgency } from "../../../utils/translationUtils";

interface ProblemInfoProps {
  declaration: Declaration;
  getStatusBadgeColor: (status: string) => string;
  translateStatus: (status: string) => string;
}

export const ProblemInfo = ({ 
  declaration,
  getStatusBadgeColor,
  translateStatus 
}: ProblemInfoProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Informations du problème</h3>
      <p><span className="font-medium">Propriété:</span> {declaration.property}</p>
      {declaration.city && (
        <p><span className="font-medium">Ville:</span> {declaration.city}</p>
      )}
      {declaration.postalCode && (
        <p><span className="font-medium">Code postal:</span> {declaration.postalCode}</p>
      )}
      <p>
        <span className="font-medium">Type:</span> {translateIssueType(declaration.issueType || "")}
      </p>
      <p>
        <span className="font-medium">Urgence:</span> {translateUrgency(declaration.urgency || "")}
      </p>
      <div className="flex items-center">
        <span className="font-medium mr-2">Statut:</span>
        <Badge className={getStatusBadgeColor(declaration.status)}>
          {translateStatus(declaration.status || "")}
        </Badge>
      </div>
    </div>
  );
};
