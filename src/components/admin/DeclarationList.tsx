import { useState } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDeclarations, updateDeclarationStatus } from "@/services/declarationService";
import type { Declaration } from "@/services/types";
import { DeclarationDetails } from "./DeclarationDetails";

// Helper functions for translations and formatting
const translateIssueType = (type: string): string => {
  const translations: Record<string, string> = {
    plumbing: "Encanamento",
    electrical: "Elétrico",
    appliance: "Eletrodomésticos",
    heating: "Aquecimento/Refrigeração",
    structural: "Estrutural",
    pest: "Pragas",
    other: "Outro",
  };
  return translations[type] || type;
};

const translateUrgency = (urgency: string): string => {
  const translations: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    emergency: "Emergência",
  };
  return translations[urgency] || urgency;
};

const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    pending: "Em espera",
    in_progress: "Em progresso",
    resolved: "Resolvido",
  };
  return translations[status] || status;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

interface DeclarationListProps {
  declarations: Declaration[];
  onStatusUpdate: (id: string, status: Declaration["status"]) => void;
}

export const DeclarationList = ({ declarations, onStatusUpdate }: DeclarationListProps) => {
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const viewDeclarationDetails = (declaration: Declaration) => {
    setSelectedDeclaration(declaration);
    setIsDetailOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "in_progress":
        return "bg-blue-500 hover:bg-blue-600";
      case "resolved":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const handleStatusUpdate = (id: string, newStatus: Declaration["status"]) => {
    onStatusUpdate(id, newStatus);
    
    if (selectedDeclaration && selectedDeclaration.id === id) {
      setSelectedDeclaration({ ...selectedDeclaration, status: newStatus });
    }
    
    toast("Statut mis à jour", {
      description: `La déclaration a été mise à jour avec le statut "${translateStatus(newStatus)}".`
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Déclarations des Locataires</CardTitle>
          <CardDescription>
            Liste de toutes les déclarations soumises par les locataires.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        onClick={() => viewDeclarationDetails(declaration)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {selectedDeclaration && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails de la déclaration</DialogTitle>
              <DialogDescription>
                Soumise le {formatDate(selectedDeclaration.submittedAt)}
              </DialogDescription>
            </DialogHeader>
            
            <DeclarationDetails 
              declaration={selectedDeclaration} 
              onStatusUpdate={handleStatusUpdate} 
              getStatusBadgeColor={getStatusBadgeColor}
              translateStatus={translateStatus}
            />
            
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export { translateIssueType, translateUrgency, translateStatus, formatDate };
