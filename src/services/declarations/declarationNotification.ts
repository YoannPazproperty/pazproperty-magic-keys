
/**
 * Declaration Notification Facade
 * Sert d'interface unique vers les fonctions de notifications (notamment updateStatusAndNotify)
 * pour garantir la compatibilité avec le reste de l'application et préparer les automatisations à venir.
 */
import { updateStatusAndNotify } from "../notifications";

/**
 * Met à jour le statut d'une déclaration et notifie les parties concernées si besoin.
 * @param declarationId - ID de la déclaration à mettre à jour
 * @param newStatus - Nouveau statut à appliquer
 * @param additionalUpdates - Autres champs à mettre à jour (optionnel)
 */
export { updateStatusAndNotify };
