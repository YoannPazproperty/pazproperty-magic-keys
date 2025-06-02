
import { Button } from "@/components/ui/button";
import { updateStatusAndNotify } from "@/services/notifications";
import type { Declaration } from "@/services/types";
import { toast } from "sonner";

interface StatusUpdateProps {
  currentStatus: Declaration["status"];
  onStatusUpdate: (status: Declaration["status"]) => void;
}

export const StatusUpdate = ({ currentStatus, onStatusUpdate }: StatusUpdateProps) => {
  const handleStatusUpdate = async (status: Declaration["status"]) => {
    if (status === "Em espera do encontro de diagnostico" && currentStatus !== status) {
      toast.warning("Ce statut nécessite l'affectation d'un prestataire", {
        description: "Veuillez d'abord affecter un prestataire avant de changer le statut",
        duration: 5000
      });
      return;
    }

    if (status === "Encontramento de diagnostico planeado" && currentStatus !== status) {
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
          onClick={() => handleStatusUpdate("Novo")}
          className={currentStatus === "Novo" ? "bg-yellow-100" : ""}
        >
          Novo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate("Em espera do encontro de diagnostico")}
          className={currentStatus === "Em espera do encontro de diagnostico" ? "bg-blue-50" : ""}
        >
          Em espera do encontro
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate("Encontramento de diagnostico planeado")}
          className={currentStatus === "Encontramento de diagnostico planeado" ? "bg-sky-100" : ""}
        >
          Encontro planeado
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate("Orçamento recebido")}
          className={currentStatus === "Orçamento recebido" ? "bg-purple-100" : ""}
        >
          Orçamento recebido
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate("Em curso de reparação")}
          className={currentStatus === "Em curso de reparação" ? "bg-orange-100" : ""}
        >
          Em curso de reparação
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate("Resolvido")}
          className={currentStatus === "Resolvido" ? "bg-green-100" : ""}
        >
          Resolvido
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusUpdate("Annulé")}
          className={currentStatus === "Annulé" ? "bg-red-100" : ""}
        >
          Annulé
        </Button>
      </div>
    </div>
  );
};
