
import { useState } from "react";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Trash2, Edit, Plus } from "lucide-react";
import { AffaireFormDialog } from "../AffaireFormDialog";
import { AffaireDetailsDialog } from "../AffaireDetailsDialog";
import type { Affaire, CommercialContact } from "../../../../services/types";
import { useAffaires } from "../../../../hooks/useAffaires";
import { Skeleton } from "../../../ui/skeleton";
import { formatDate } from "../../../../utils/translationUtils";

interface AffairesTabProps {
  contact: CommercialContact;
}

export const AffairesTab = ({ contact }: AffairesTabProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAffaire, setEditingAffaire] = useState<Affaire | null>(null);
  const [selectedAffaire, setSelectedAffaire] = useState<Affaire | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { affaires, isLoading, deleteAffaire, refreshAffaires } = useAffaires(contact.id);

  const handleDelete = async (affaireId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette affaire ?")) {
      await deleteAffaire(affaireId);
    }
  };

  const handleEdit = (affaire: Affaire) => {
    setEditingAffaire(affaire);
    setIsFormOpen(true);
  };

  const handleViewDetails = (affaire: Affaire) => {
    setSelectedAffaire(affaire);
    setIsDetailsOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingAffaire(null);
    refreshAffaires();
  };

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedAffaire(null);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "Initial":
        return "bg-gray-100 text-gray-800";
      case "En discussion":
        return "bg-blue-100 text-blue-800";
      case "Proposition faite":
        return "bg-yellow-100 text-yellow-800";
      case "Contrat signé":
        return "bg-green-100 text-green-800";
      case "En cours":
        return "bg-orange-100 text-orange-800";
      case "Achevé":
        return "bg-emerald-100 text-emerald-800";
      case "Annulé":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Affaires ({affaires.length})
        </h3>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle affaire
        </Button>
      </div>

      {affaires.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Aucune affaire trouvée pour ce contact
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {affaires.map((affaire: Affaire) => (
            <Card key={affaire.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader 
                className="pb-3"
                onClick={() => handleViewDetails(affaire)}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{affaire.client_nom}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatutColor(affaire.statut)}>
                        {affaire.statut}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Créé le {affaire.created_at ? formatDate(new Date(affaire.created_at).toISOString()) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(affaire)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(affaire.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent 
                className="pt-0"
                onClick={() => handleViewDetails(affaire)}
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-muted-foreground">{affaire.client_email || "Non renseigné"}</p>
                  </div>
                  <div>
                    <span className="font-medium">Téléphone:</span>
                    <p className="text-muted-foreground">{affaire.client_telephone || "Non renseigné"}</p>
                  </div>
                  <div>
                    <span className="font-medium">Rémunération prévue:</span>
                    <p className="text-muted-foreground">
                      {affaire.remuneration_prevue ? `${affaire.remuneration_prevue}€` : "Non définie"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Honoraires perçus:</span>
                    <p className="text-muted-foreground">
                      {affaire.honoraires_percus ? `${affaire.honoraires_percus}€` : "0€"}
                    </p>
                  </div>
                </div>
                {affaire.description && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="font-medium text-sm">Description:</span>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {affaire.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AffaireFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        contact={contact}
        affaire={editingAffaire}
      />

      <AffaireDetailsDialog
        affaire={selectedAffaire}
        isOpen={isDetailsOpen}
        onClose={handleDetailsClose}
      />
    </div>
  );
};
