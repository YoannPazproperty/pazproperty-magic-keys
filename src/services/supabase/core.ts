
import { supabase } from '@/integrations/supabase/client';

// Initialize Supabase client
export const initSupabase = () => {
  try {
    if (!supabase) {
      console.error('Supabase client is not initialized.');
      return null;
    }
    console.log('Supabase client initialized successfully');
    return supabase;
  } catch (err) {
    console.error('Error initializing Supabase:', err);
    return null;
  }
};

// Get Supabase client
export const getSupabase = () => {
  return supabase;
};

// Check if Supabase database is connected (without checking storage)
export const isDatabaseConnected = async (): Promise<boolean> => {
  if (!supabase) {
    console.error('Supabase client is not available');
    return false;
  }
  
  try {
    console.log('Testing database connection...');
    
    // Use a simpler query to check connection
    const { data, error } = await supabase.rpc('version', {});
    
    if (error) {
      console.error('Database connection failed:', error);
      return false;
    }
    
    console.log('Database connection successful, version:', data);
    return true;
  } catch (err) {
    console.error('Error checking database connection:', err);
    return false;
  }
};

// Check if Supabase is connected
export const isSupabaseConnected = async (): Promise<boolean> => {
  if (!supabase) {
    console.error('Supabase client is not available');
    return false;
  }
  
  try {
    console.log('Checking Supabase connection...');
    
    // Test database connection using version RPC function
    const { data, error } = await supabase.rpc('version', {});
    
    if (error) {
      console.error('Database connection failed:', error);
      return false;
    }
    
    console.log('Supabase database connection established successfully.');
    return true;
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    return false;
  }
};
