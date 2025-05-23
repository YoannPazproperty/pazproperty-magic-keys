// Supprimer les exports globaux problématiques
// export * from './declarationNotifier';

export * from './notificationHistory';
export * from './notificationStorage';

// ✅ Re-exportation explicite uniquement des fonctions utiles, pour éviter les doublons
export {
  updateStatusAndNotify,
  notifyStatusChange,
  notifyNewDeclaration,
  getDeclarationNotificationHistory
} from './declarationNotifier';