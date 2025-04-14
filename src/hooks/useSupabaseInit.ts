
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  initSupabase, 
  isDatabaseConnected, 
  initializeDatabase, 
  isStorageConnected 
} from '../services/supabaseService';

export interface ConnectionStatus {
  initialized: boolean;
  database: boolean;
  storage: boolean;
}

export const useSupabaseInit = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    initialized: false,
    database: false,
    storage: false
  });

  useEffect(() => {
    const setupSupabase = async () => {
      console.log("App: Initializing Supabase...");
      
      // Initialize Supabase client
      const supabase = initSupabase();
      if (!supabase) {
        console.log("App: Fallback mode: Supabase is not available, using local storage only");
        toast.info("Modo offline ativo", {
          description: "Usando armazenamento local para guardar seus dados."
        });
        setConnectionStatus({
          initialized: true,
          database: false,
          storage: false
        });
        return;
      }
      
      try {
        // Check if database is connected
        const dbConnected = await isDatabaseConnected();
        console.log("App: Database connection status:", dbConnected);
        
        if (!dbConnected) {
          console.log("App: Database connection failed, using local storage");
          toast.error("Falha na conexão com Supabase", {
            description: "O aplicativo funcionará no modo local."
          });
          setConnectionStatus({
            initialized: true,
            database: false,
            storage: false
          });
          return;
        }
        
        // Check storage separately
        const storageConnected = await isStorageConnected();
        console.log("App: Storage connection status:", storageConnected);
        
        // Initialize the database
        const initialized = await initializeDatabase();
        console.log("App: Database initialization status:", initialized);
        
        if (!initialized) {
          console.log("App: Supabase database not initialized, using local storage");
          setConnectionStatus({
            initialized: true,
            database: false,
            storage: false
          });
          return;
        }
        
        // Update connection status
        setConnectionStatus({
          initialized: true,
          database: true,
          storage: storageConnected
        });
      } catch (error) {
        console.error("App: Error setting up Supabase:", error);
        toast.error("Erro de conexão com Supabase", {
          description: "O aplicativo funcionará no modo offline."
        });
        setConnectionStatus({
          initialized: true,
          database: false,
          storage: false
        });
      }
    };
    
    setupSupabase();
  }, []);
  
  return connectionStatus;
};
