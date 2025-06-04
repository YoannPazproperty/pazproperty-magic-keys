
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { toast } from "sonner";
import { supabase } from "../../../integrations/supabase/client";
import type { NotificationPreference } from "../../../services/types";

export const NotificationPreferencesCard = () => {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences
        const defaultPrefs: Partial<NotificationPreference> = {
          email: true,
          push: false,
          sms: false,
          recipientEmail: null,
          recipientPhone: null,
        };
        setPreferences(defaultPrefs as NotificationPreference);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Erreur lors du chargement des préférences');
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(preferences);

      if (error) throw error;

      toast.success('Préférences sauvegardées');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreference, value: any) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Préférences de notification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences de notification</CardTitle>
        <CardDescription>
          Configurez comment vous souhaitez recevoir les notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email"
              checked={preferences.email || false}
              onCheckedChange={(checked) => updatePreference('email', checked)}
            />
            <Label htmlFor="email">Notifications par email</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="push"
              checked={preferences.push || false}
              onCheckedChange={(checked) => updatePreference('push', checked)}
            />
            <Label htmlFor="push">Notifications push</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="sms"
              checked={preferences.sms || false}
              onCheckedChange={(checked) => updatePreference('sms', checked)}
            />
            <Label htmlFor="sms">Notifications SMS</Label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="recipientEmail">Email de réception</Label>
            <Input
              id="recipientEmail"
              type="email"
              value={preferences.recipientEmail || ''}
              onChange={(e) => updatePreference('recipientEmail', e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <Label htmlFor="recipientPhone">Téléphone de réception</Label>
            <Input
              id="recipientPhone"
              type="tel"
              value={preferences.recipientPhone || ''}
              onChange={(e) => updatePreference('recipientPhone', e.target.value)}
              placeholder="+33123456789"
            />
          </div>
        </div>

        <Button onClick={savePreferences} disabled={isSaving}>
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
        </Button>
      </CardContent>
    </Card>
  );
};
