
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
      return false;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    console.log(`Bucket "${bucketName}" exists: ${bucketExists}`);
    return bucketExists;
    
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
    console.log(`Bucket "${bucketName}" already exists, no need to create it.`);
    return true;
  }
  
  if (!supabase) {
    console.error('Supabase client is not available');
    return false;
  }
  
  try {
    // Create the bucket if it doesn't exist
    console.log(`Creating bucket "${bucketName}"...`);
    
    // Create bucket with simple options
    const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true
    });
    
    if (createError) {
      console.error(`Error creating bucket "${bucketName}":`, createError);
      toast.error("Erro ao criar bucket de mídia", {
        description: createError.message
      });
      return false;
    }
    
    console.log(`Bucket "${bucketName}" created successfully.`, data);
    return true;
  } catch (err) {
    console.error(`Error creating bucket "${bucketName}":`, err);
    toast.error("Erro ao criar bucket de mídia", {
      description: "Erro inesperado ao criar o bucket"
    });
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
    
    // Use a simpler query to check connection - Fix for TypeScript error on line 101
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

// Check if Supabase storage is connected
export const isStorageConnected = async (): Promise<boolean> => {
  if (!supabase) {
    console.error('Supabase client is not available');
    return false;
  }
  
  try {
    console.log('Testing storage connection...');
    
    // First check if we can list buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    console.log('Storage connection successful, buckets:', buckets);
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
    
    // Test database connection using version RPC function - Fix for TypeScript error on line 153
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
    
    // Check connection to database with version RPC function - Fix for TypeScript error on line 189
    try {
      const { data, error } = await supabase.rpc('version', {});
      
      if (error) {
        console.error('Could not connect to Supabase database:', error);
        toast.error("Falha na conexão com banco de dados Supabase", {
          description: "O aplicativo funcionará apenas no modo local."
        });
        return false;
      }
      
      console.log('Supabase database connection established successfully, version:', data);
      
      // Check storage separately
      const storageConnected = await isStorageConnected();
      if (!storageConnected) {
        console.warn('Could not connect to Supabase storage - file uploads will use localStorage');
        toast.warning("Armazenamento Supabase indisponível", {
          description: "Os arquivos serão salvos localmente."
        });
      } else {
        // Create the declarations media bucket if it doesn't exist
        await createBucketIfNotExists('declaration-media');
      }
      
      toast.success("Conexão com Supabase estabelecida", {
        description: storageConnected
          ? "Banco de dados e armazenamento funcionando corretamente."
          : "Banco de dados conectado, mas armazenamento pode estar limitado."
      });
      
      return true;
    } catch (connectionErr) {
      console.error('Error connecting to Supabase:', connectionErr);
      toast.error("Erro ao conectar ao Supabase", {
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
