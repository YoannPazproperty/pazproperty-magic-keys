
import { Button } from "@/components/ui/button";
import type { Declaration } from "@/services/types";

interface StatusUpdateProps {
  currentStatus: Declaration["status"];
  onStatusUpdate: (status: Declaration["status"]) => void;
}

export const StatusUpdate = ({ currentStatus, onStatusUpdate }: StatusUpdateProps) => {
  return (
    <div className="space-y-2 py-2">
      <h3 className="font-semibold">Atualizar estado</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStatusUpdate("Novo")}
          className={currentStatus === "Novo" ? "bg-yellow-100" : ""}
        >
          Novo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStatusUpdate("Transmitido")}
          className={currentStatus === "Transmitido" ? "bg-blue-100" : ""}
        >
          Transmitido
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStatusUpdate("Orçamento recebido")}
          className={currentStatus === "Orçamento recebido" ? "bg-purple-100" : ""}
        >
          Orçamento recebido
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStatusUpdate("Em curso de reparação")}
          className={currentStatus === "Em curso de reparação" ? "bg-orange-100" : ""}
        >
          Em curso de reparação
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStatusUpdate("Resolvido")}
          className={currentStatus === "Resolvido" ? "bg-green-100" : ""}
        >
          Resolvido
        </Button>
      </div>
    </div>
  );
};
