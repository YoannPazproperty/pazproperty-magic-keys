
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Switch } from "../../ui/switch";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import type { NotificationPreference } from "../../../services/types";

interface NotificationPreferencesCardProps {
  notificationPreferences: NotificationPreference;
  setNotificationPreferences: React.Dispatch<React.SetStateAction<NotificationPreference>>;
}

export const NotificationPreferencesCard: React.FC<NotificationPreferencesCardProps> = ({
  notificationPreferences,
  setNotificationPreferences
}) => {
  const handleEmailToggle = (checked: boolean) => {
    setNotificationPreferences(prev => ({
      ...prev,
      email: checked
    }));
  };

  const handleSmsToggle = (checked: boolean) => {
    setNotificationPreferences(prev => ({
      ...prev,
      sms: checked
    }));
  };

  const handlePushToggle = (checked: boolean) => {
    setNotificationPreferences(prev => ({
      ...prev,
      push: checked
    }));
  };

  const handleRecipientEmailChange = (value: string) => {
    setNotificationPreferences(prev => ({
      ...prev,
      recipientEmail: value
    }));
  };

  const handleRecipientPhoneChange = (value: string) => {
    setNotificationPreferences(prev => ({
      ...prev,
      recipientPhone: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences de notification</CardTitle>
        <CardDescription>
          Configurez comment vous souhaitez recevoir les notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="email-notifications"
            checked={notificationPreferences.email}
            onCheckedChange={handleEmailToggle}
          />
          <Label htmlFor="email-notifications">Notifications par email</Label>
        </div>

        {notificationPreferences.email && (
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Email de réception</Label>
            <Input
              id="recipient-email"
              type="email"
              value={notificationPreferences.recipientEmail || ''}
              onChange={(e) => handleRecipientEmailChange(e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="sms-notifications"
            checked={notificationPreferences.sms || false}
            onCheckedChange={handleSmsToggle}
          />
          <Label htmlFor="sms-notifications">Notifications par SMS</Label>
        </div>

        {notificationPreferences.sms && (
          <div className="space-y-2">
            <Label htmlFor="recipient-phone">Numéro de téléphone</Label>
            <Input
              id="recipient-phone"
              type="tel"
              value={notificationPreferences.recipientPhone || ''}
              onChange={(e) => handleRecipientPhoneChange(e.target.value)}
              placeholder="+33 6 12 34 56 78"
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="push-notifications"
            checked={notificationPreferences.push || false}
            onCheckedChange={handlePushToggle}
          />
          <Label htmlFor="push-notifications">Notifications push</Label>
        </div>
      </CardContent>
    </Card>
  );
};
