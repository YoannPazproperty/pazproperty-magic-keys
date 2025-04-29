
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { setupNotificationWebhook } from "@/services/notificationService";

interface WebhookFormProps {
  onWebhookAdded: () => void;
}

export const WebhookForm = ({ onWebhookAdded }: WebhookFormProps) => {
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const handleSetupWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Veuillez entrer une URL de webhook");
      return;
    }
    
    setIsTesting(true);
    try {
      const result = await setupNotificationWebhook(webhookUrl);
      if (result.success) {
        toast.success("Webhook configuré avec succès", {
          description: result.message
        });
        setWebhookUrl("");
        onWebhookAdded();
      } else {
        toast.error("Erreur de configuration du webhook", {
          description: result.message
        });
      }
    } catch (error) {
      console.error("Error setting up webhook:", error);
      toast.error("Erreur lors de la configuration du webhook");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="webhook-url" className="font-medium">
        URL du Webhook
      </label>
      <Input
        id="webhook-url"
        value={webhookUrl}
        onChange={(e) => setWebhookUrl(e.target.value)}
        placeholder="https://votreserveur.com/webhook"
      />
      <p className="text-sm text-gray-500">
        L'URL de votre endpoint qui recevra les notifications de Monday.com.
      </p>
      
      <Button 
        onClick={handleSetupWebhook} 
        disabled={!webhookUrl || isTesting}
        className="w-full"
      >
        {isTesting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Configuration en cours...
          </>
        ) : (
          "Configurer le Webhook"
        )}
      </Button>
    </div>
  );
};
