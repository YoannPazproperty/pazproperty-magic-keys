import { useState, useEffect } from "react";
import { NotificationPreferencesCard } from "./NotificationPreferencesCard";
import { WebhooksCard } from "./WebhooksCard";
import { NotificationPreference } from "../../../services/types";
import { getNotificationPreferences } from "../../../services/notificationService";

export const NotificationSettings = () => {
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
  }, []);

  const loadNotificationPreferences = () => {
    const preferences = getNotificationPreferences();
    setNotificationPreferences(preferences);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <NotificationPreferencesCard 
        notificationPreferences={notificationPreferences}
        setNotificationPreferences={setNotificationPreferences}
      />
      <WebhooksCard />
    </div>
  );
};

export default NotificationSettings;
