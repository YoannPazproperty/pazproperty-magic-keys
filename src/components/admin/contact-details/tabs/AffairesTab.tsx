
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, FileEdit, Trash2, Clock, Euro } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getAffairesByContactId, deleteAffaire } from "@/services/affaires/affairesService";
import type { Affaire } from "@/services/types";
import { AffaireFormDialog } from "../AffaireFormDialog";
import { AffaireDetailsDialog } from "../AffaireDetailsDialog";

interface AffairesTabProps {
  contactId: string;
  contactName: string;
}

export const AffairesTab = ({ contactId, contactName }: AffairesTabProps) => {
  const [affaires, setAffaires] = useState<Affaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAffaire, setSelectedAffaire] = useState<Affaire | null>(null);
  const [affaireToDelete, setAffaireToDelete] = useState<Affaire | null>(null);

  const loadAffaires = async () => {
    setIsLoading(true);
    try {
      const data = await getAffairesByContactId(contactId);
      setAffaires(data);
    } catch (error) {
      console.error("Error loading affaires:", error);
      toast.error("Erreur lors du chargement des affaires");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAffaires();
  }, [contactId]);

  const handleAddNew = () => {
    setSelectedAffaire(null);
    setIsFormOpen(true);
  };

  const handleEdit = (affaire: Affaire) => {
    setSelectedAffaire(affaire);
    setIsFormOpen(true);
  };

  const handleViewDetails = (affaire: Affaire) => {
    setSelectedAffaire(affaire);
    setIsDetailsOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!affaireToDelete) return;
    
    try {
      await deleteAffaire(affaireToDelete.id);
      loadAffaires();
    } catch (error) {
      console.error("Error deleting affaire:", error);
    } finally {
      setAffaireToDelete(null);
    }
  };

  const formatMontant = (montant: number | null) => {
    if (montant === null) return "-";
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  const getStatutBadge = (statut: string) => {
    switch(statut) {
      case "Initial":
        return <Badge variant="outline">Initial</Badge>;
      case "En discussion":
        return <Badge variant="secondary">En discussion</Badge>;
      case "Proposition faite":
        return <Badge variant="default">Proposition</Badge>;
      case "Contrat signé":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Contrat signé</Badge>;
      case "En cours":
        return <Badge className="bg-amber-500 hover:bg-amber-600">En cours</Badge>;
      case "Achevé":
        return <Badge className="bg-green-500 hover:bg-green-600">Achevé</Badge>;
      case "Annulé":
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  return (
    <div className="space-y-4 py-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Affaires liées à {contactName}</CardTitle>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle affaire
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : affaires.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune affaire trouvée pour ce contact.</p>
              <Button variant="outline" className="mt-4" onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter une affaire
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden md:table-cell">Honoraires</TableHead>
                    <TableHead className="hidden md:table-cell">Rémunération</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affaires.map((affaire) => (
                    <TableRow 
                      key={affaire.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(affaire)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{affaire.client_nom}</p>
                          <p className="text-sm text-muted-foreground">{affaire.client_email || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatutBadge(affaire.statut)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Euro className="h-4 w-4 mr-1 text-muted-foreground" />
                          {formatMontant(affaire.honoraires_percus)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Euro className="h-4 w-4 mr-1 text-muted-foreground" />
                          {formatMontant(affaire.remuneration_prevue)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="whitespace-nowrap">
                            {formatDistanceToNow(new Date(affaire.created_at), { addSuffix: true, locale: fr })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(affaire);
                            }}
                          >
                            <FileEdit className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAffaireToDelete(affaire);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/édition d'affaire */}
      <AffaireFormDialog 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={loadAffaires}
        contactId={contactId}
        affaireToEdit={selectedAffaire}
      />

      {/* Détails d'une affaire */}
      <AffaireDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onUpdate={loadAffaires}
        affaireId={selectedAffaire?.id ?? null}
      />

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={!!affaireToDelete} onOpenChange={(open) => !open && setAffaireToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette affaire ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les informations concernant cette affaire et son historique seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
