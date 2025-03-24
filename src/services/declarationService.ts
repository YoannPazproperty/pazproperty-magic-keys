
// Re-export everything from our new modules
export * from './declarations/declarationStorage';
export * from './declarations/declarationCreation';
export * from './declarations/declarationNotification';
export * from './declarations/externalIntegration';

// Re-export the Declaration type to ensure it's available to components
export type { Declaration } from './types';
