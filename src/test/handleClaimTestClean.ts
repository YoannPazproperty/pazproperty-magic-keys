import MCP, { ClaimData } from '../services/mcp';

// Test data for claim creation
const testClaim: ClaimData = {
  name: 'Jean Dupont',
  email: 'jean.dupont@example.com',
  phone: '+33612345678',
  property: 'Rua do Teste, 123',
  city: 'Lisboa',
  postalCode: '1750-100',
  issueType: 'plumbing',
  description: 'Fuite visible sous l\'évier',
  urgency: 'high',
  mediaFiles: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']
};

// IIFE to test the handleClaimCreation method
(async () => {
  console.log('Testing MCP.handleClaimCreation with test data...');
  
await MCP.handleClaimCreation(testClaim);
  
  console.log('MCP.handleClaimCreation test completed.');
})();
