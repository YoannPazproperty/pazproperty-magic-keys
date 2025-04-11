
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

// Check if bucket exists without trying to create it
export const checkBucketExists = async (bucketName: string): Promise<boolean> => {
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
      console.log('Error message:', listError.message);
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Bucket "${bucketName}" already exists.`);
      return true;
    }
    
    console.log(`Bucket "${bucketName}" does not exist.`);
    return false;
  } catch (err) {
    console.error(`Error checking bucket "${bucketName}":`, err);
    return false;
  }
};

// Create bucket if it doesn't exist
export const createBucketIfNotExists = async (bucketName: string) => {
  // First check if it exists
  const exists = await checkBucketExists(bucketName);
  if (exists) {
    return true;
  }
  
  if (!supabase) {
    console.error('Supabase client is not available');
    return false;
  }
  
  try {
    // Create the bucket if it doesn't exist
    console.log(`Creating bucket "${bucketName}"...`);
    const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true
    });
    
    if (createError) {
      console.error(`Error creating bucket "${bucketName}":`, createError);
      console.log('Error message:', createError.message);
      return false;
    }
    
    console.log(`Bucket "${bucketName}" created successfully.`, data);
    return true;
  } catch (err) {
    console.error(`Error creating bucket "${bucketName}":`, err);
    return false;
  }
};

// Check if Supabase database is connected (without checking storage)
export const isDatabaseConnected = async (): Promise<boolean> => {
  if (!supabase) {
    console.error('Supabase client is not available');
    return false;
  }
  
  try {
    console.log('Testing database connection...');
    const { data, error } = await supabase
      .from('declarations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Error checking database connection:', error);
      console.log('Error message:', error.message);
      return false;
    }
    
    console.log('Database connection successful, data:', data);
    return true;
  } catch (err) {
    console.error('Error checking database connection:', err);
    return false;
  }
};

// Check if Supabase storage is connected
export const isStorageConnected = async (): Promise<boolean> => {
  if (!supabase) {
    console.error('Supabase client is not available');
    return false;
  }
  
  try {
    console.log('Testing storage connection...');
    
    // First check if the bucket exists
    const bucketExists = await checkBucketExists('declaration-media');
    
    if (!bucketExists) {
      console.error('Declaration-media bucket does not exist');
      return false;
    }
    
    console.log('Storage connection successful');
    return true;
  } catch (err) {
    console.error('Error checking storage connection:', err);
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
    
    // Test database connection
    const dbConnected = await isDatabaseConnected();
    if (!dbConnected) {
      console.error('Database connection failed');
      return false;
    }
    
    // Test storage connection
    const storageConnected = await isStorageConnected();
    if (!storageConnected) {
      console.error('Storage connection failed');
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
    
    // Check connection to database first
    const dbConnected = await isDatabaseConnected();
    if (!dbConnected) {
      console.error('Could not connect to Supabase database - using localStorage only');
      toast.error("Falha na conexão com banco de dados Supabase", {
        description: "O aplicativo funcionará apenas no modo local."
      });
      return false;
    }
    
    // Check connection to storage
    const storageConnected = await isStorageConnected();
    if (!storageConnected) {
      console.warn('Could not connect to Supabase storage - file uploads will use localStorage');
      toast.warning("Armazenamento Supabase indisponível", {
        description: "Os arquivos serão salvos localmente."
      });
    }
    
    // Overall connection status depends on database, storage is optional
    console.log('Supabase database connection established successfully');
    toast.success("Conexão com Supabase estabelecida", {
      description: storageConnected
        ? "Banco de dados e armazenamento funcionando corretamente."
        : "Banco de dados conectado, mas armazenamento pode estar limitado."
    });
    return true;
  } catch (err) {
    console.error('Error initializing database:', err);
    toast.error("Erro ao inicializar o banco de dados", {
      description: "Ocorreu um erro inesperado."
    });
    return false;
  }
};
