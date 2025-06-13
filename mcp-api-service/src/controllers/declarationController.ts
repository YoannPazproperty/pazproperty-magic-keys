import { Request, Response } from 'express';
import { McpWorkflowService } from '../services/mcpWorkflowService';

const mcpWorkflowService = new McpWorkflowService();

export const handleProviderAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ajoute ce log pour voir le payload reçu
    console.log('Requête POST reçue de Supabase :', req.body);

    // The custom trigger sends a flat payload. Let's match it.
    const { declarationId, providerId } = req.body;
    // ... suite du code ...
   

    if (!declarationId || !providerId) {
      console.error('Invalid payload from custom Supabase trigger:', req.body);
      res.status(400).json({ success: false, message: 'declarationId and providerId are required from the trigger payload.' });
      return;
    }

    const result = await mcpWorkflowService.assignProviderAndNotifyWorkflow(declarationId, providerId);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in handleProviderAssignment controller:', error);
    res.status(500).json({ success: false, message: error.message || 'An internal server error occurred.' });
  }
};

// TODO: Ajouter d'autres méthodes de contrôleur pour d'autres actions sur les déclarations
// Par exemple, pour créer une déclaration, obtenir des détails, etc. 