
import { toast } from 'sonner';
import { isDatabaseConnected, isSupabaseConnected } from './core';
import { isStorageConnected, createBucketIfNotExists } from './storage';
import { getSupabase } from './core';

// Initialize database
export const initializeDatabase = async () => {
  try {
    const supabase = getSupabase();
    // Check if Supabase is available
    if (!supabase) {
      console.error('Supabase is not available - using localStorage only');
      toast.error("Não foi possível conectar ao Supabase", {
        description: "O aplicativo funcionará apenas no modo local."
      });
      return false;
    }
    
    console.log('Checking Supabase connection...');
    
    // Check connection to database with version RPC function
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
        const bucketCreated = await createBucketIfNotExists('declaration-media');
        console.log('[BUCKET DEBUG] Bucket creation result during initialization:', bucketCreated);
        
        if (!bucketCreated) {
          console.warn('[BUCKET DEBUG] Failed to create bucket during initialization');
          toast.warning("Não foi possível criar o bucket de mídia", {
            description: "Os arquivos serão salvos localmente."
          });
        }
      }
      
      toast.success("Conexão com Supabase estabelecida", {
        description: storageConnected
          ? "Banco de dados e armazenamento funcionando corretamente."
          : "Banco de dados conectado, mas armazenamento pode estar limitado."
      });
      
      return storageConnected;
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
