
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Declaration } from "@/services/declarationService";
import { translateIssueType, translateUrgency } from "./DeclarationList";

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
        <div className="space-y-2">
          <h3 className="font-semibold">Informations du locataire</h3>
          <p><span className="font-medium">Nom:</span> {declaration.name}</p>
          <p><span className="font-medium">Email:</span> {declaration.email}</p>
          <p><span className="font-medium">Téléphone:</span> {declaration.phone}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Informations du problème</h3>
          <p><span className="font-medium">Propriété:</span> {declaration.property}</p>
          <p>
            <span className="font-medium">Type:</span> {translateIssueType(declaration.issueType)}
          </p>
          <p>
            <span className="font-medium">Urgence:</span> {translateUrgency(declaration.urgency)}
          </p>
          <p>
            <span className="font-medium">Statut:</span>{" "}
            <Badge className={getStatusBadgeColor(declaration.status)}>
              {translateStatus(declaration.status)}
            </Badge>
          </p>
        </div>
      </div>
      
      <div className="space-y-2 py-2">
        <h3 className="font-semibold">Description du problème</h3>
        <div className="bg-gray-50 p-3 rounded-md border">
          <p>{declaration.description}</p>
        </div>
      </div>
      
      <div className="space-y-2 py-2">
        <h3 className="font-semibold">Mettre à jour le statut</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusUpdate(declaration.id, "pending")}
            className={declaration.status === "pending" ? "bg-yellow-100" : ""}
          >
            En attente
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusUpdate(declaration.id, "in_progress")}
            className={declaration.status === "in_progress" ? "bg-blue-100" : ""}
          >
            En cours
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusUpdate(declaration.id, "resolved")}
            className={declaration.status === "resolved" ? "bg-green-100" : ""}
          >
            Résolu
          </Button>
        </div>
      </div>
    </>
  );
};
