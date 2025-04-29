import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Bell, Users } from "lucide-react";
import {
  NotificationPreference
} from "@/services/types";
import {
  setupNotificationWebhook,
  getWebhookIntegrations,
  deleteWebhook,
  getNotificationPreferences,
  saveNotificationPreferences
} from "@/services/notificationService";

export const NotificationSettings = () => {
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference>({
    id: "default",
    email: true,
    sms: false,
    push: false,
    recipientEmail: null,
    recipientPhone: null
  });

  useEffect(() => {
    loadNotificationPreferences();
    loadWebhooks();
  }, []);

  const loadNotificationPreferences = () => {
    const preferences = getNotificationPreferences();
    setNotificationPreferences(preferences);
  };

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

  const handleSaveNotificationPreferences = () => {
    try {
      saveNotificationPreferences(notificationPreferences);
      toast.success("Préférences de notification enregistrées");
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast.error("Erreur lors de l'enregistrement des préférences");
    }
  };

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
        loadWebhooks();
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Préférences de notification</CardTitle>
          <CardDescription>
            Configurez comment vous souhaitez recevoir les notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="notify-email" 
              checked={notificationPreferences.email}
              onCheckedChange={(checked) => 
                setNotificationPreferences({
                  ...notificationPreferences,
                  email: checked === true
                })
              }
            />
            <label
              htmlFor="notify-email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Notifications par email
            </label>
          </div>
          
          {notificationPreferences.email && (
            <div className="ml-6 space-y-2">
              <label htmlFor="recipient-email" className="text-sm font-medium">
                Email du destinataire
              </label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="email@exemple.com"
                value={notificationPreferences.recipientEmail || ''}
                onChange={(e) => 
                  setNotificationPreferences({
                    ...notificationPreferences,
                    recipientEmail: e.target.value
                  })
                }
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="notify-sms" 
              checked={notificationPreferences.sms}
              onCheckedChange={(checked) => 
                setNotificationPreferences({
                  ...notificationPreferences,
                  sms: checked === true
                })
              }
            />
            <label
              htmlFor="notify-sms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Notifications par SMS
            </label>
          </div>
          
          {notificationPreferences.sms && (
            <div className="ml-6 space-y-2">
              <label htmlFor="recipient-phone" className="text-sm font-medium">
                Numéro de téléphone
              </label>
              <Input
                id="recipient-phone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={notificationPreferences.recipientPhone || ''}
                onChange={(e) => 
                  setNotificationPreferences({
                    ...notificationPreferences,
                    recipientPhone: e.target.value
                  })
                }
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="notify-push" 
              checked={notificationPreferences.push}
              onCheckedChange={(checked) => 
                setNotificationPreferences({
                  ...notificationPreferences,
                  push: checked === true
                })
              }
            />
            <label
              htmlFor="notify-push"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Notifications push dans l'interface
            </label>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveNotificationPreferences}>
            <Bell className="mr-2 h-4 w-4" />
            Enregistrer les préférences
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Webhooks Monday.com</CardTitle>
          <CardDescription>
            Configurez des webhooks pour recevoir des notifications lors de changements dans Monday.com.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
          </div>
          
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
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Webhooks configurés</h3>
            
            {isLoadingWebhooks ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : webhooks.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">
                Aucun webhook configuré.
              </p>
            ) : (
              <div className="space-y-2">
                {webhooks.map((webhook) => (
                  <div 
                    key={webhook.id} 
                    className="border rounded-md p-3 flex justify-between items-center"
                  >
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
                      onClick={() => handleDeleteWebhook(webhook.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
