
import { toast } from 'sonner';
import { getSupabase } from './core';

// Check if bucket exists without trying to create it
export const checkBucketExists = async (bucketName: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) {
    console.error('Supabase client is not available');
    return false;
  }
  
  try {
    console.log(`[BUCKET DEBUG] Checking if bucket "${bucketName}" exists...`);
    
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('[BUCKET DEBUG] Error checking buckets:', listError);
      console.error('[BUCKET DEBUG] Error message:', listError.message);
      return false;
    }
    
    console.log('[BUCKET DEBUG] All buckets:', buckets);
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    console.log(`[BUCKET DEBUG] Bucket "${bucketName}" exists: ${bucketExists}`);
    return bucketExists;
    
  } catch (err) {
    console.error(`[BUCKET DEBUG] Exception checking bucket "${bucketName}":`, err);
    return false;
  }
};

// Create bucket if it doesn't exist
export const createBucketIfNotExists = async (bucketName: string) => {
  // First check if it exists
  const exists = await checkBucketExists(bucketName);
  if (exists) {
    console.log(`[BUCKET DEBUG] Bucket "${bucketName}" already exists, no need to create it.`);
    return true;
  }
  
  const supabase = getSupabase();
  if (!supabase) {
    console.error('[BUCKET DEBUG] Supabase client is not available');
    return false;
  }
  
  try {
    // Create the bucket if it doesn't exist
    console.log(`[BUCKET DEBUG] Creating bucket "${bucketName}"...`);
    
    // Create bucket with simple options
    const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true
    });
    
    if (createError) {
      console.error(`[BUCKET DEBUG] Error creating bucket "${bucketName}":`, createError);
      console.error('[BUCKET DEBUG] Error message:', createError.message);
      
      toast.error("Erro ao criar bucket de mídia", {
        description: createError.message
      });
      return false;
    }
    
    console.log(`[BUCKET DEBUG] Bucket "${bucketName}" created successfully.`, data);
    
    // Verify the bucket was created
    const bucketVerified = await checkBucketExists(bucketName);
    console.log(`[BUCKET DEBUG] Bucket creation verified: ${bucketVerified}`);
    
    return bucketVerified;
  } catch (err) {
    console.error(`[BUCKET DEBUG] Exception creating bucket "${bucketName}":`, err);
    toast.error("Erro ao criar bucket de mídia", {
      description: "Erro inesperado ao criar o bucket"
    });
    return false;
  }
};

// Check if Supabase storage is connected
export const isStorageConnected = async (): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) {
    console.error('Supabase client is not available');
    return false;
  }
  
  try {
    console.log('[STORAGE DEBUG] Testing storage connection...');
    
    // First check if we can list buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('[STORAGE DEBUG] Error listing buckets:', listError);
      console.error('[STORAGE DEBUG] Error message:', listError.message);
      return false;
    }
    
    console.log('[STORAGE DEBUG] Storage connection successful, buckets:', buckets);
    console.log('[STORAGE DEBUG] Number of buckets:', buckets.length);
    
    // List each bucket
    if (buckets && buckets.length > 0) {
      buckets.forEach(bucket => {
        console.log('[STORAGE DEBUG] Bucket:', bucket.name, 'Created at:', bucket.created_at);
      });
    }
    
    return true;
  } catch (err) {
    console.error('[STORAGE DEBUG] Error checking storage connection:', err);
    return false;
  }
};
