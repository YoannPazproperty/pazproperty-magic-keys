
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WebhookForm } from "./WebhookForm";
import { WebhookList } from "./WebhookList";
import { getWebhookIntegrations, deleteWebhook } from "@/services/notificationService";

export const WebhooksCard = () => {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState<boolean>(false);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    setIsLoadingWebhooks(true);
    try {
      const result = await getWebhookIntegrations();
      if (result.success) {
        setWebhooks(result.webhooks || []);
      } else {
        console.error("Failed to load webhooks:", result.message);
      }
    } catch (error) {
      console.error("Error loading webhooks:", error);
    } finally {
      setIsLoadingWebhooks(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      const result = await deleteWebhook(webhookId);
      if (result.success) {
        toast.success("Webhook supprimé avec succès");
        loadWebhooks();
      } else {
        toast.error("Erreur lors de la suppression du webhook", {
          description: result.message
        });
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Erreur lors de la suppression du webhook");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhooks Monday.com</CardTitle>
        <CardDescription>
          Configurez des webhooks pour recevoir des notifications lors de changements dans Monday.com.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <WebhookForm onWebhookAdded={loadWebhooks} />
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Webhooks configurés</h3>
          
          <WebhookList 
            webhooks={webhooks} 
            isLoading={isLoadingWebhooks} 
            onDelete={handleDeleteWebhook}
          />
        </div>
      </CardContent>
    </Card>
  );
};
