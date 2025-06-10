import { Router } from 'express';
import { assignProviderToDeclaration } from '../controllers/declarationController';

const router = Router();

router.post('/:declarationId/assign-provider', assignProviderToDeclaration);

export default router;