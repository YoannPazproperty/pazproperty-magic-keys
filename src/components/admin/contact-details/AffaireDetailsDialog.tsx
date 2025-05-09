
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileEdit, Phone, Mail, Euro, Calendar, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  getAffaireById, 
  updateAffaire, 
  getHistoriqueActions, 
  addHistoriqueAction
} from "@/services/affaires/affairesService"; 
import type { Affaire, HistoriqueAction } from "@/services/types/affaires";
import { AffaireFormDialog } from "./AffaireFormDialog";
import { HistoriqueActionsList } from "./HistoriqueActionsList";
import { NewActionForm } from "./NewActionForm";

interface AffaireDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  affaireId: string | null;
}

export const AffaireDetailsDialog = ({
  isOpen,
  onClose,
  onUpdate,
  affaireId
}: AffaireDetailsDialogProps) => {
  const [affaire, setAffaire] = useState<Affaire | null>(null);
  const [historiqueActions, setHistoriqueActions] = useState<HistoriqueAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  
  const loadAffaireDetails = async () => {
    if (!affaireId) return;
    
    setIsLoading(true);
    try {
      const affaireData = await getAffaireById(affaireId);
      setAffaire(affaireData);
      
      const historiqueData = await getHistoriqueActions(affaireId);
      setHistoriqueActions(historiqueData);
    } catch (error) {
      console.error("Error loading affaire details:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen && affaireId) {
      loadAffaireDetails();
    } else {
      setAffaire(null);
      setHistoriqueActions([]);
    }
  }, [isOpen, affaireId]);

  const handleEdit = () => {
    setIsEditFormOpen(true);
  };

  const handleAddAction = async (action: string, notes: string | null) => {
    if (!affaire) return;
    
    try {
      await addHistoriqueAction({
        affaire_id: affaire.id,
        action,
        date: new Date().toISOString(),
        utilisateur: null, // Pourrait être remplacé par le nom de l'utilisateur connecté
        notes
      });
      
      // Recharger l'historique des actions
      const updatedHistorique = await getHistoriqueActions(affaire.id);
      setHistoriqueActions(updatedHistorique);
    } catch (error) {
      console.error("Error adding action:", error);
    }
  };

  const formatMontant = (montant: number | null) => {
    if (montant === null) return "-";
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? (
              <Skeleton className="h-8 w-1/3" />
            ) : (
              affaire ? `Affaire : ${affaire.client_nom}` : "Affaire non trouvée"
            )}
          </DialogTitle>
        </DialogHeader>

        {affaire ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Détails de l'affaire</TabsTrigger>
              <TabsTrigger value="historique" className="flex-1">Historique</TabsTrigger>
              <TabsTrigger value="nouvelle-action" className="flex-1">Nouvelle action</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 py-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Informations client</span>
                    {getStatutBadge(affaire.statut)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-lg">{affaire.client_nom}</h4>
                      {affaire.client_email && (
                        <a href={`mailto:${affaire.client_email}`} className="flex items-center text-muted-foreground hover:text-foreground">
                          <Mail className="h-4 w-4 mr-2" />
                          {affaire.client_email}
                        </a>
                      )}
                      {affaire.client_telephone && (
                        <a href={`tel:${affaire.client_telephone}`} className="flex items-center text-muted-foreground hover:text-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          {affaire.client_telephone}
                        </a>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-medium">Dates</p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Création:</strong> {formatDate(affaire.created_at)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Dernière mise à jour:</strong> {formatDate(affaire.updated_at)}
                      </p>
                      {affaire.date_paiement && (
                        <p className="text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <strong>Paiement:</strong> {formatDate(affaire.date_paiement)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Description</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {affaire.description || "Aucune description fournie."}
                    </p>
                  </div>
                
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Honoraires perçus</p>
                      <p className="text-lg font-semibold flex items-center">
                        <Euro className="h-4 w-4 mr-1" />
                        {formatMontant(affaire.honoraires_percus)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Rémunération prévue</p>
                      <p className="text-lg font-semibold flex items-center">
                        <Euro className="h-4 w-4 mr-1" />
                        {formatMontant(affaire.remuneration_prevue)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Rémunération payée</p>
                      <p className="text-lg font-semibold flex items-center">
                        <Euro className="h-4 w-4 mr-1" />
                        {formatMontant(affaire.remuneration_payee)}
                      </p>
                    </div>
                  </div>
                  
                  {affaire.notes && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-medium">Notes</h4>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {affaire.notes}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="historique">
              <HistoriqueActionsList actions={historiqueActions} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="nouvelle-action">
              <NewActionForm onSubmit={handleAddAction} />
            </TabsContent>
          </Tabs>
        ) : isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Affaire non trouvée ou supprimée.
          </div>
        )}
      
        {/* Formulaire d'édition dans un dialogue séparé */}
        {affaire && (
          <AffaireFormDialog 
            isOpen={isEditFormOpen}
            onClose={() => setIsEditFormOpen(false)}
            onSuccess={() => {
              loadAffaireDetails();
              onUpdate();
            }}
            contactId={affaire.contact_id}
            affaireToEdit={affaire}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
