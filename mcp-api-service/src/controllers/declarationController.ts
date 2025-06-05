import { Request, Response } from 'express';
import mcpWorkflowService from '../services/mcpWorkflowService';

class DeclarationController {
  async assignProvider(req: Request, res: Response): Promise<void> {
    const { declarationId } = req.params;
    const { providerId } = req.body;

    if (!providerId) {
      res.status(400).json({ success: false, message: 'Provider ID is required in the request body.' });
      return;
    }

    try {
      const result = await mcpWorkflowService.assignProviderAndNotifyWorkflow(declarationId, providerId);
      if (result.success) {
        res.status(200).json(result);
      } else {
        // Déterminer le code de statut approprié en fonction du message d'erreur si nécessaire
        if (result.message.includes('not found')) {
          res.status(404).json(result);
        } else {
          res.status(500).json(result);
        }
      }
    } catch (error: any) {
      console.error('[DeclarationController] Error in assignProvider:', error);
      res.status(500).json({ success: false, message: 'Internal server error while assigning provider.', error: error.message });
    }
  }

  // TODO: Ajouter d'autres méthodes de contrôleur pour d'autres actions sur les déclarations
  // Par exemple, pour créer une déclaration, obtenir des détails, etc.
}

export default new DeclarationController(); 