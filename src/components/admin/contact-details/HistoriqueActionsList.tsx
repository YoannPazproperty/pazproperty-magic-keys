
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, User, FileText } from "lucide-react";
import type { HistoriqueAction } from "@/services/types/affaires";

interface HistoriqueActionsListProps {
  actions: HistoriqueAction[];
  isLoading: boolean;
}

export const HistoriqueActionsList = ({ actions, isLoading }: HistoriqueActionsListProps) => {
  const formatActionDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <Card className="my-4">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Aucune action enregistrée pour cette affaire.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-4">
        {actions.map((action) => (
          <Card key={action.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{action.action}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatActionDate(action.date)}
                  </div>
                </div>
                {action.utilisateur && (
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    {action.utilisateur}
                  </div>
                )}
              </div>
              {action.notes && (
                <div className="p-4">
                  <div className="flex items-start">
                    <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <p className="whitespace-pre-wrap text-sm">{action.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
