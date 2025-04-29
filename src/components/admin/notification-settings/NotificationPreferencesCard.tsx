
import { useState } from "react";
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
import { Bell } from "lucide-react";
import {
  NotificationPreference
} from "@/services/types";
import {
  saveNotificationPreferences
} from "@/services/notificationService";

interface NotificationPreferencesCardProps {
  notificationPreferences: NotificationPreference;
  setNotificationPreferences: (prefs: NotificationPreference) => void;
}

export const NotificationPreferencesCard = ({ 
  notificationPreferences, 
  setNotificationPreferences 
}: NotificationPreferencesCardProps) => {
  
  const handleSaveNotificationPreferences = () => {
    try {
      saveNotificationPreferences(notificationPreferences);
      toast.success("Préférences de notification enregistrées");
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast.error("Erreur lors de l'enregistrement des préférences");
    }
  };

  return (
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
  );
};
