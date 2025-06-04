
import { Button } from "../../ui/button";
import { updateStatusAndNotify } from "../../../services/notifications";
import type { Declaration } from "../../../services/types";
import { toast } from "sonner";

interface StatusUpdateProps {
  currentStatus: Declaration["status"];
  onStatusUpdate: (status: Declaration["status"]) => void;
}

export const StatusUpdate = ({ currentStatus, onStatusUpdate }: StatusUpdateProps) => {
  const handleStatusUpdate = async (status: Declaration["status"]) => {
    if (status === "AWAITING_DIAGNOSTIC" && currentStatus !== status) {
      toast.warning("Ce statut nécessite l'affectation d'un prestataire", {
        description: "Veuillez d'abord affecter un prestataire avant de changer le statut",
        duration: 5000
      });
      return;
    }

    if (status === "DIAGNOSTIC_SCHEDULED" && currentStatus !== status) {
      toast.warning("Ce statut nécessite la planification d'un rendez-vous", {
        description: "Veuillez planifier un rendez-vous avant de changer le statut",
        duration: 5000
      });
      return;
    }

    try {
      const success = await updateStatusAndNotify(status, status);
      if (success) {
        onStatusUpdate(status);
        toast.success("Statut mis à jour avec succès");
      } else {
        toast.error("Erreur lors de la mise à jour du statut");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  return (
    <div className="space-y-2 py-2">
      <h3 className="font-semibold">Atualizar estado</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate("NEW")}
          className={currentStatus === "NEW" ? "bg-yellow-100" : ""}
        >
          Novo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate("AWAITING_DIAGNOSTIC")}
          className={currentStatus === "AWAITING_DIAGNOSTIC" ? "bg-blue-50" : ""}
        >
          Em espera do encontro
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate("DIAGNOSTIC_SCHEDULED")}
          className={currentStatus === "DIAGNOSTIC_SCHEDULED" ? "bg-sky-100" : ""}
        >
          Encontro planeado
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate("QUOTE_RECEIVED")}
          className={currentStatus === "QUOTE_RECEIVED" ? "bg-purple-100" : ""}
        >
          Orçamento recebido
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate("IN_REPAIR")}
          className={currentStatus === "IN_REPAIR" ? "bg-orange-100" : ""}
        >
          Em curso de reparação
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate("RESOLVED")}
          className={currentStatus === "RESOLVED" ? "bg-green-100" : ""}
        >
          Resolvido
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate("CANCELLED")}
          className={currentStatus === "CANCELLED" ? "bg-red-100" : ""}
        >
          Annulé
        </Button>
      </div>
    </div>
  );
};
