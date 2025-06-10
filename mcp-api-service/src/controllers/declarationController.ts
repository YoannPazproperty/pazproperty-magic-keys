import { Request, Response } from 'express';
import McpWorkflowService from '../services/mcpWorkflowService';

// Fournir les variables directement pour contourner le problème du .env
const serviceOptions = {
  supabaseUrl: 'https://ubztjjxmldogpwawcnrj.supabase.co',
  supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVienRqanhtbGRvZ3B3YXdjbnJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDI4NTgyMywiZXhwIjoyMDU5ODYxODIzfQ.8DEsR5_oGretND3y8pL6L11zUsqeYMArNehZpQUWnyg'
};

const mcpWorkflowService = new McpWorkflowService(serviceOptions);

export const assignProviderToDeclaration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { declarationId } = req.params;
    const { providerId } = req.body;

    if (!providerId) {
      res.status(400).json({ success: false, message: 'Provider ID is required.' });
      return;
    }

    const result = await mcpWorkflowService.assignProviderAndNotifyWorkflow(declarationId, providerId);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in assignProviderToDeclaration controller:', error);
    res.status(500).json({ success: false, message: error.message || 'An internal server error occurred.' });
  }
};

// TODO: Ajouter d'autres méthodes de contrôleur pour d'autres actions sur les déclarations
// Par exemple, pour créer une déclaration, obtenir des détails, etc. 