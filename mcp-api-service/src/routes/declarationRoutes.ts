import { Router } from 'express';
import declarationController from '../controllers/declarationController';

const router = Router();

// Route pour assigner un prestataire à une déclaration
// POST /api/declarations/:declarationId/assign-provider
router.post(
  '/:declarationId/assign-provider',
  declarationController.assignProvider
);

// TODO: Ajouter d'autres routes pour les déclarations ici
// Exemple: GET /:declarationId pour obtenir les détails
// Exemple: POST / pour créer une nouvelle déclaration

export default router; 