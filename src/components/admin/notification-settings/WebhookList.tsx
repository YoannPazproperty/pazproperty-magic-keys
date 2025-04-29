
import { WebhookItem } from "./WebhookItem";
import { Loader2 } from "lucide-react";

interface WebhookListProps {
  webhooks: any[];
  isLoading: boolean;
  onDelete: (webhookId: string) => void;
}

export const WebhookList = ({ webhooks, isLoading, onDelete }: WebhookListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }
  
  if (webhooks.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-2">
        Aucun webhook configuré.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {webhooks.map((webhook) => (
        <WebhookItem 
          key={webhook.id} 
          webhook={webhook} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};
