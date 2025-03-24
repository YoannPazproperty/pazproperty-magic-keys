
import { Declaration, NotificationPreference } from "./types";

// Example/mock declarations to start with
const initialDeclarations: Declaration[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "+351 912 345 678",
    property: "Avenida de Lisboa, 1",
    issueType: "plumbing",
    description: "Il y a une fuite d'eau dans la salle de bain principale.",
    urgency: "high",
    status: "in_progress",
    submittedAt: "2024-03-18T14:30:00Z",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "+351 923 456 789",
    property: "Rua do Comércio, 23",
    issueType: "electrical",
    description: "La prise électrique dans la cuisine ne fonctionne pas.",
    urgency: "medium",
    status: "pending",
    submittedAt: "2024-03-17T10:15:00Z",
  },
  {
    id: "3",
    name: "António Ferreira",
    email: "antonio.ferreira@email.com",
    phone: "+351 934 567 890",
    property: "Praça do Rossio, 45",
    issueType: "heating",
    description: "Le chauffage central ne chauffe pas correctement.",
    urgency: "medium",
    status: "pending",
    submittedAt: "2024-03-16T08:45:00Z",
  },
  {
    id: "4",
    name: "Sofia Lopes",
    email: "sofia.lopes@email.com",
    phone: "+351 945 678 901",
    property: "Rua Augusta, 78",
    issueType: "pest",
    description: "J'ai vu des cafards dans la cuisine à plusieurs reprises.",
    urgency: "low",
    status: "resolved",
    submittedAt: "2024-03-15T16:20:00Z",
  },
];

// Default notification preferences
const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreference = {
  email: true,
  sms: false,
  push: false
};

// Store declarations in localStorage to persist between page loads
export const loadDeclarations = (): Declaration[] => {
  const stored = localStorage.getItem('declarations');
  return stored ? JSON.parse(stored) : initialDeclarations;
};

export const saveDeclarations = (declarations: Declaration[]) => {
  localStorage.setItem('declarations', JSON.stringify(declarations));
};

// Load notification preferences from localStorage or use defaults
export const getNotificationPreferences = (): NotificationPreference => {
  const stored = localStorage.getItem('notificationPreferences');
  return stored ? JSON.parse(stored) : DEFAULT_NOTIFICATION_PREFERENCES;
};

// Save notification preferences to localStorage
export const saveNotificationPreferences = (preferences: NotificationPreference) => {
  localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  return preferences;
};

// Monday.com API key and board ID storage
export const getMondayConfig = () => {
  return {
    apiKey: localStorage.getItem('mondayApiKey') || '',
    boardId: localStorage.getItem('mondayBoardId') || '',
    techBoardId: localStorage.getItem('mondayTechBoardId') || ''
  };
};

export const saveMondayConfig = (apiKey: string, boardId: string, techBoardId: string = '') => {
  localStorage.setItem('mondayApiKey', apiKey);
  localStorage.setItem('mondayBoardId', boardId);
  
  // Ensure techBoardId is also saved if provided
  if (techBoardId) {
    localStorage.setItem('mondayTechBoardId', techBoardId);
  }
};

export const clearMondayConfig = () => {
  localStorage.removeItem('mondayApiKey');
  localStorage.removeItem('mondayBoardId');
  localStorage.removeItem('mondayTechBoardId');
};

// Validate Monday.com configuration
export const validateMondayConfig = (apiKey: string, boardId: string, techBoardId: string = '') => {
  // Simple validation - required fields must be present
  if (!apiKey || !boardId) {
    return {
      valid: false,
      message: "L'API key et l'ID du board sont requis"
    };
  }
  return {
    valid: true,
    message: "Configuration valide"
  };
};
