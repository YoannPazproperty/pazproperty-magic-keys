// Exporte les fonctions utiles pour l’historique et le stockage des notifications
export * from "./notificationHistory";
export * from "./notificationStorage";

// Export explicite de la fonction principale de gestion de notifications déclarations
export { updateStatusAndNotify } from "./declarationNotifier";