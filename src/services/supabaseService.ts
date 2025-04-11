
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

// Create bucket if it doesn't exist
export const createBucketIfNotExists = async (bucketName: string) => {
  if (!supabase) {
    console.error('Supabase client is not available');
    return false;
  }
  
  try {
    console.log(`Checking if bucket "${bucketName}" exists...`);
    
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error checking buckets:', listError);
      console.log('Error details:', listError.message, listError.details, listError.hint);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Bucket "${bucketName}" already exists.`);
      return true;
    }
    
    // Create the bucket if it doesn't exist
    console.log(`Creating bucket "${bucketName}"...`);
    const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true
    });
    
    if (createError) {
      console.error(`Error creating bucket "${bucketName}":`, createError);
      console.log('Error details:', createError.message, createError.details, createError.hint);
      return false;
    }
    
    console.log(`Bucket "${bucketName}" created successfully.`, data);
    return true;
  } catch (err) {
    console.error(`Error creating bucket "${bucketName}":`, err);
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
    
    // Test with a simple query to check database connection
    console.log('Testing database connection...');
    const { data, error } = await supabase
      .from('declarations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Error checking Supabase connection:', error);
      console.log('Error details:', error.message, error.details, error.hint);
      return false;
    }
    
    console.log('Database connection successful, data:', data);
    
    // Check if storage is working by trying to create the declaration-media bucket
    console.log('Testing storage connection by checking declaration-media bucket...');
    const bucketCreated = await createBucketIfNotExists('declaration-media');
    
    if (!bucketCreated) {
      console.error('Could not create or verify declaration-media bucket');
      return false;
    }
    
    console.log('Supabase connection established successfully (database and storage).');
    return true;
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
    return false;
  }
};

// Get Supabase client
export const getSupabase = () => {
  return supabase;
};

// Initialize database
export const initializeDatabase = async () => {
  try {
    // Check if Supabase is available
    if (!supabase) {
      console.error('Supabase is not available - using localStorage only');
      toast.error("Não foi possível conectar ao Supabase", {
        description: "O aplicativo funcionará apenas no modo local."
      });
      return false;
    }
    
    console.log('Checking Supabase connection...');
    
    // Try to create the declaration-media bucket
    const bucketCreated = await createBucketIfNotExists('declaration-media');
    if (!bucketCreated) {
      console.error('Could not create declaration-media bucket');
      toast.error("Erro ao criar bucket de mídia", {
        description: "Não foi possível configurar o armazenamento de arquivos."
      });
    }
    
    // Check connection to Supabase
    const isConnected = await isSupabaseConnected();
    
    if (isConnected) {
      console.log('Supabase connection established successfully');
      toast.success("Conexão com Supabase estabelecida", {
        description: "Os dados serão sincronizados com Supabase."
      });
      return true;
    } else {
      console.error('Could not connect to Supabase - using localStorage only');
      toast.error("Falha na conexão com Supabase", {
        description: "O aplicativo funcionará apenas no modo local."
      });
      return false;
    }
  } catch (err) {
    console.error('Error initializing database:', err);
    toast.error("Erro ao inicializar o banco de dados", {
      description: "Ocorreu um erro inesperado."
    });
    return false;
  }
};
