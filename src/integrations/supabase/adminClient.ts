
/**
 * IMPORTANT: This client has elevated privileges (service_role).
 * Only use for administrative operations that require bypassing RLS.
 * Never expose this client to the frontend directly.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ubztjjxmldogpwawcnrj.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVienRqanhtbGRvZ3B3YXdjbnJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDI4NTgyMywiZXhwIjoyMDU5ODYxODIzfQ.3KOLxfnedrkEDgRszsY-gfkEfIFzOQlJevqIM3bpAMQ";

/**
 * Admin client with service_role permissions - Use with caution!
 * This client bypasses Row Level Security and should only be used
 * for administrative functions that require elevated privileges.
 */
export const adminClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);
