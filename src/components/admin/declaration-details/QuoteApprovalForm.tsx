
import { useState } from "react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { updateStatusAndNotify } from "../../../services/notifications";
import { toast } from "sonner";
import type { Declaration, DeclarationFile } from "../../../services/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Euro, File } from "lucide-react";

interface QuoteApprovalFormProps {
  declaration: Declaration;
  quoteFiles: DeclarationFile[];
  onSuccess: () => void;
  isReadOnly?: boolean;
}

export const QuoteApprovalForm = ({
  declaration,
  quoteFiles,
  onSuccess,
  isReadOnly = false
}: QuoteApprovalFormProps) => {
  const [quoteApproved, setQuoteApproved] = useState<boolean | undefined>(declaration.quote_approved ?? undefined);
  const [rejectionReason, setRejectionReason] = useState<string>(declaration.quote_rejection_reason || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuoteDecision = async () => {
    if (quoteApproved === undefined) {
      toast.error("Veuillez indiquer si le devis est approuvé ou rejeté");
      return;
    }

    if (!quoteApproved && !rejectionReason) {
      toast.error("Veuillez indiquer la raison du rejet");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await updateStatusAndNotify(
        declaration.id,
        "IN_REPAIR",
        {
          quote_approved: quoteApproved,
          quote_rejection_reason: !quoteApproved ? rejectionReason : undefined
        }
      );

      if (success) {
        toast.success(`Devis ${quoteApproved ? 'approuvé' : 'rejeté'} avec succès`);
        onSuccess();
      } else {
        toast.error(`Erreur lors de ${quoteApproved ? 'l\'approbation' : 'du rejet'} du devis`);
      }
    } catch (error) {
      console.error("Erreur lors de la décision sur le devis:", error);
      toast.error("Erreur lors de la décision sur le devis");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Euro className="mr-2" /> Approbation du devis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Affichage des fichiers de devis disponibles */}
          <div className="space-y-2">
            <h3 className="font-semibold">Fichiers de devis</h3>
            {quoteFiles.length === 0 ? (
              <p className="text-muted-foreground">Aucun fichier de devis disponible</p>
            ) : (
              <div className="space-y-2">
                {quoteFiles.map((file) => (
                  <a
                    key={file.id}
                    href={file.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-2 border rounded-md hover:bg-gray-50"
                  >
                    <File className="w-5 h-5 mr-2 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.file_name}</p>
                      {file.uploaded_at && (
                        <p className="text-xs text-muted-foreground">
                          Téléversé le {format(new Date(file.uploaded_at), 'PPP à HH:mm', {locale: fr})}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Montant du devis */}
          {declaration.quote_amount !== null && declaration.quote_amount !== undefined && (
            <div className="flex gap-2 items-center">
              <Label className="min-w-[150px]">Montant du devis:</Label>
              <p className="font-bold">{declaration.quote_amount} €</p>
            </div>
          )}

          {declaration.quote_approved === null && !isReadOnly && (
            <>
              {/* Sélection de l'approbation ou rejet */}
              <div className="space-y-2">
                <Label htmlFor="quote_decision">Décision</Label>
                <RadioGroup
                  value={quoteApproved !== undefined ? quoteApproved.toString() : undefined}
                  onValueChange={(value) => setQuoteApproved(value === "true")}
                  className="space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="quote-approve" />
                    <Label htmlFor="quote-approve">Approuver le devis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="quote-reject" />
                    <Label htmlFor="quote-reject">Rejeter le devis</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Raison du rejet (si rejeté) */}
              {quoteApproved === false && (
                <div className="space-y-2">
                  <Label htmlFor="rejection_reason">Raison du rejet</Label>
                  <Textarea
                    id="rejection_reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Indiquez la raison du rejet du devis..."
                    rows={3}
                    required
                  />
                </div>
              )}

              <Button
                onClick={handleQuoteDecision}
                disabled={quoteApproved === undefined || (quoteApproved === false && !rejectionReason) || isSubmitting}
                className="w-full mt-4"
              >
                {isSubmitting ? "En cours..." : "Confirmer la décision"}
              </Button>
            </>
          )}

          {/* Si une décision a déjà été prise */}
          {declaration.quote_approved !== null && (
            <div className="bg-gray-50 p-3 rounded-md border">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${declaration.quote_approved ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className="font-semibold">
                  Devis {declaration.quote_approved ? 'approuvé' : 'rejeté'}
                </p>
              </div>

              {!declaration.quote_approved && declaration.quote_rejection_reason && (
                <div className="mt-2">
                  <p className="font-medium text-sm">Raison du rejet:</p>
                  <p className="text-muted-foreground text-sm">{declaration.quote_rejection_reason}</p>
                </div>
              )}

              {declaration.quote_response_date && (
                <p className="text-xs text-muted-foreground mt-2">
                  Décision prise le {format(new Date(declaration.quote_response_date), 'PPP à HH:mm', {locale: fr})}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
