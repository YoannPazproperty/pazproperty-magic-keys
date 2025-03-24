
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Declaration } from "@/services/types";
import { 
  translateIssueType, 
  translateUrgency, 
  translateStatus, 
  formatDate,
  getStatusBadgeColor
} from "@/utils/translationUtils";

interface DeclarationListTableProps {
  declarations: Declaration[];
  onViewDetails: (declaration: Declaration) => void;
}

export const DeclarationListTable = ({ 
  declarations, 
  onViewDetails 
}: DeclarationListTableProps) => {
  return (
    <Table>
      <TableCaption>Liste des déclarations récentes</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Locataire</TableHead>
          <TableHead>Propriété</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Urgence</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {declarations.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4">
              Aucune déclaration trouvée
            </TableCell>
          </TableRow>
        ) : (
          declarations.map((declaration) => (
            <TableRow key={declaration.id}>
              <TableCell className="font-medium">
                {formatDate(declaration.submittedAt)}
              </TableCell>
              <TableCell>{declaration.name}</TableCell>
              <TableCell>{declaration.property}</TableCell>
              <TableCell>{translateIssueType(declaration.issueType)}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    declaration.urgency === "emergency" || declaration.urgency === "high"
                      ? "border-red-500 text-red-500"
                      : declaration.urgency === "medium"
                      ? "border-yellow-500 text-yellow-500"
                      : "border-green-500 text-green-500"
                  }
                >
                  {translateUrgency(declaration.urgency)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(declaration.status)}>
                  {translateStatus(declaration.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(declaration)}
                >
                  <Eye className="h-4 w-4 mr-1" /> Voir
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
