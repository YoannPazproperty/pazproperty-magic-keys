
/**
 * Supabase Declaration Storage
 * This file exports all functionality related to storing declarations in Supabase
 */

// Re-export all functionality from separate modules
export * from './supabaseDeclarationQueries';
export * from './supabaseDeclarationMutations';
// The format converters are internal and not re-exported

// Export table name as constant for potential reuse
export const DECLARATIONS_TABLE = 'declarations';
