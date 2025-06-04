import { Button } from "../../ui/button";

interface WebhookItemProps {
  webhook: {
    id: string;
    url: string;
    event: string;
  };
  onDelete: (webhookId: string) => void;
}

export const WebhookItem = ({ webhook, onDelete }: WebhookItemProps) => {
  return (
    <div className="border rounded-md p-3 flex justify-between items-center">
      <div>
        <p className="text-sm font-medium truncate max-w-xs">
          {webhook.url}
        </p>
        <p className="text-xs text-gray-500">
          Événement: {webhook.event}
        </p>
      </div>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => onDelete(webhook.id)}
      >
        Supprimer
      </Button>
    </div>
  );
};
