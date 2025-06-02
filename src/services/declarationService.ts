
// Re-export everything from our modules
export * from './declarations/declarationStorage';
export * from './declarations/declarationCreation';
export * from './declarations/declarationNotification'; // This now re-exports only updateStatusAndNotify
export * from './declarations/externalIntegration';
export * from './declarations/supabaseDeclarationStorage';
export * from './declarations/supabaseDeclarationQueries';
export * from './declarations/supabaseDeclarationMutations';

// Re-export the Declaration type to ensure it's available to components
export type { Declaration } from './types';
