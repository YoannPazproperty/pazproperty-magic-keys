
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateStatusAndNotify } from "@/services/notifications";
import type { Declaration, DeclarationFile } from "@/services/types";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

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
  const [approved, setApproved] = useState<boolean | null>(declaration.quote_approved ?? null);
  const [rejectionReason, setRejectionReason] = useState(declaration.quote_rejection_reason || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApproval = async () => {
    if (approved === null) {
      toast.error("Veuillez indiquer si le devis est approuvé ou non");
      return;
    }

    if (!approved && !rejectionReason) {
      toast.error("Veuillez indiquer la raison du refus");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await updateStatusAndNotify(
        declaration.id,
        "Em curso de reparação",
        {
          quote_approved: approved,
          quote_rejection_reason: !approved ? rejectionReason : undefined,
        }
      );

      if (success) {
        toast.success(approved ? "Devis approuvé avec succès" : "Devis refusé");
        onSuccess();
      } else {
        toast.error("Erreur lors du traitement du devis");
      }
    } catch (error) {
      console.error("Erreur lors du traitement du devis:", error);
      toast.error("Erreur lors du traitement du devis");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher seulement si le statut est "Orçamento recebido"
  if (declaration.status !== "Orçamento recebido") {
    return null;
  }

  return (
    <div className="space-y-4 border rounded-md p-4">
      <h3 className="font-semibold text-lg">Traitement du devis</h3>
      
      {quoteFiles.length > 0 && (
        <div className="space-y-2">
          <Label>Devis reçu</Label>
          <div className="grid gap-2">
            {quoteFiles.map((file) => (
              <a 
                key={file.id} 
                href={file.file_path} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-2 border rounded hover:bg-gray-50"
              >
                <div className="text-sm">{file.file_name}</div>
              </a>
            ))}
          </div>
        </div>
      )}
      
      {!declaration.quote_approved && !isReadOnly && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="quote_approval">Approuver le devis</Label>
              <div className="flex items-center gap-3">
                <div 
                  className={`text-sm font-medium ${approved === false ? "text-red-500" : "text-gray-400"}`}
                >
                  Refuser
                </div>
                <Switch 
                  id="quote_approval" 
                  checked={approved === true}
                  onCheckedChange={(checked) => setApproved(checked)}
                  disabled={isSubmitting}
                />
                <div 
                  className={`text-sm font-medium ${approved === true ? "text-green-500" : "text-gray-400"}`}
                >
                  Approuver
                </div>
              </div>
            </div>
          </div>
          
          {approved === false && (
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">Motif du refus</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Veuillez indiquer la raison du refus du devis..."
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          )}
          
          <Button
            onClick={handleApproval}
            disabled={isSubmitting || (approved === false && !rejectionReason) || approved === null}
            className="w-full"
            variant={approved ? "default" : "destructive"}
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Traitement...</>
            ) : approved ? (
              <><CheckCircle2 className="mr-2 h-4 w-4" /> Approuver le devis</>
            ) : (
              <><XCircle className="mr-2 h-4 w-4" /> Refuser le devis</>
            )}
          </Button>
        </>
      )}
      
      {declaration.quote_approved !== null && (
        <div className={`p-2 rounded border ${declaration.quote_approved ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
          <p className="text-sm font-medium">
            {declaration.quote_approved ? (
              <span className="text-green-700">Devis approuvé</span>
            ) : (
              <span className="text-red-700">Devis refusé</span>
            )}
          </p>
          {!declaration.quote_approved && declaration.quote_rejection_reason && (
            <p className="text-sm mt-1">
              <span className="font-semibold">Motif du refus:</span> {declaration.quote_rejection_reason}
            </p>
          )}
          {declaration.quote_response_date && (
            <p className="text-xs text-muted-foreground mt-1">
              Décision prise le {new Date(declaration.quote_response_date).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
