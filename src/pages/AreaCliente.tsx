
import { useState, useEffect } from "react";
import { saveMondayConfig } from "@/services/storageService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SuccessMessage from "@/components/client-area/SuccessMessage";
import DeclarationForm from "@/components/client-area/DeclarationForm";
import ContactInformation from "@/components/client-area/ContactInformation";
import { initializeDatabase, isStorageConnected, isSupabaseConnected, createBucketIfNotExists } from "@/services/supabaseService";

// Ensure we have a default Monday configuration for testing
// This is just for development - in production this would be set in the admin panel
(() => {
  // Only set default config if none exists yet
  if (!localStorage.getItem('mondayApiKey')) {
    console.log("Setting default Monday.com configuration for testing");
    saveMondayConfig('your_monday_api_key_here', '1861342035');
  }
})();

interface ConnectionStatus {
  initialized: boolean;
  database: boolean;
  storage: boolean;
}

interface AreaClienteProps {
  connectionStatus?: ConnectionStatus;
}

const AreaCliente = ({ connectionStatus = { initialized: false, database: false, storage: false } }: AreaClienteProps) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [dbStatus, setDbStatus] = useState<ConnectionStatus>({
    initialized: false,
    database: false,
    storage: false
  });

  // Initialize database and check connection status
  useEffect(() => {
    const checkConnection = async () => {
      console.log("Checking Supabase connection status...");
      
      // Initialize database connection
      const initialized = await initializeDatabase();
      
      if (initialized) {
        // Check database and storage connection
        const database = await isSupabaseConnected();
        const storage = await isStorageConnected();
        
        // If storage is available, ensure the declaration-media bucket exists
        if (storage) {
          await createBucketIfNotExists('declaration-media');
        }
        
        setDbStatus({
          initialized: true,
          database,
          storage
        });
        
        console.log("Connection status updated:", { initialized, database, storage });
      } else {
        setDbStatus({
          initialized: true,
          database: false,
          storage: false
        });
        console.log("Failed to initialize database connection");
      }
    };
    
    checkConnection();
  }, []);

  const handleSuccessfulSubmission = () => {
    console.log("handleSuccessfulSubmission appelé, passage à l'écran de succès");
    setIsSuccess(true);
  };

  const handleNewDeclaration = () => {
    console.log("handleNewDeclaration appelé, retour au formulaire");
    setIsSuccess(false);
  };

  // Log l'état initial et ses changements
  useEffect(() => {
    console.log("État actuel isSuccess:", isSuccess);
    console.log("Connection status:", dbStatus);
  }, [isSuccess, dbStatus]);

  // Use provided connectionStatus or the one we determined
  const finalConnectionStatus = connectionStatus.initialized ? connectionStatus : dbStatus;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Declara um sinistro</h1>
          <p className="text-gray-600 mb-8">
            Bem-vindo à sua área de cliente. Utilize o formulário abaixo para declarar qualquer problema ou necessidade relacionada ao seu imóvel.
          </p>
          
          {finalConnectionStatus.initialized && !finalConnectionStatus.database && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-4 mb-6">
              <h3 className="font-semibold">Modo Offline Ativo</h3>
              <p>
                O aplicativo está operando em modo offline. Seus dados serão armazenados localmente 
                e sincronizados quando a conexão for restabelecida.
              </p>
            </div>
          )}
          
          {isSuccess ? (
            <SuccessMessage onNewDeclaration={handleNewDeclaration} />
          ) : (
            <DeclarationForm 
              onSuccess={handleSuccessfulSubmission} 
              connectionStatus={finalConnectionStatus}
            />
          )}
          
          <ContactInformation />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AreaCliente;
