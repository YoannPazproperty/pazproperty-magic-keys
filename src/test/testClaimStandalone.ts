/**
 * Test standalone pour la méthode handleClaimCreation de MCP.
 * 
 * Ce fichier charge les variables d'environnement automatiquement
 * grâce à dotenv pour Supabase.
 */

import 'dotenv/config';
import MCP from '../services/mcp';

// Exemple de données pour la création d'une réclamation
const testClaimData = {
  name: 'Jean Dupont',
  email: 'jean.dupont@email.com',
  phone: '+33612345678',
  property: 'Avenue du Test, bloc 123',
  city: 'Lisboa',
  postalCode: '1750-100',
  issueType: 'plumbing',
  description: 'Fuite visible sous l’évier',
  urgency: 'high',
  mediaFiles: ['https://example.com/photo1.jpg']
};

(async () => {
  console.log('🔧 Test MCP.handleClaimCreation...');

  await MCP.handleClaimCreation(testClaimData);

  console.log('✅ Test MCP terminé');
})();