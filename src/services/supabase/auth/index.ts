
// Re-export all auth-related functions from separate modules
export * from './passwordReset';
export * from './adminPassword';
export * from './maintenance';
export * from './diagnostics';

// Re-export Supabase client to maintain current API
export { supabase } from '@/integrations/supabase/client';
