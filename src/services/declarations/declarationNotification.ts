
/**
 * Declaration Notification Facade
 * Sert d'interface unique vers les fonctions de notifications (notamment updateStatusAndNotify)
 * pour garantir la compatibilité avec le reste de l'application et préparer les automatisations à venir.
 */
import { updateStatusAndNotify } from "@/services/notifications";

/**
 * Met à jour le statut d'une déclaration et notifie les parties concernées si besoin.
 * @param declarationId - ID de la déclaration à mettre à jour
 * @param newStatus - Nouveau statut à appliquer
 * @param additionalUpdates - Autres champs à mettre à jour (optionnel)
 */
export { updateStatusAndNotify };

/**
 * Notifie lors de la création d'une nouvelle déclaration
 * @param declarationId - ID de la déclaration nouvellement créée
 */
export const notifyNewDeclaration = async (declarationId: string): Promise<void> => {
  try {
    console.log(`notifyNewDeclaration: Processing notification for declaration ${declarationId}`);
    
    // Pour l'instant, cette fonction fait juste un log
    // Dans le futur, elle pourra envoyer des emails, webhooks, etc.
    
    // Optionnel : on pourrait mettre à jour le statut si nécessaire
    // await updateStatusAndNotify(declarationId, "Novo");
    
    console.log(`notifyNewDeclaration: Notification processed for declaration ${declarationId}`);
  } catch (error) {
    console.error("notifyNewDeclaration: Error processing notification:", error);
  }
};
