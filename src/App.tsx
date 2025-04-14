
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Servicos from "./pages/Servicos";
import Sobre from "./pages/Sobre";
import Contacto from "./pages/Contacto";
import Propriedades from "./pages/Propriedades";
import AreaCliente from "./pages/AreaCliente";
import Admin from "./pages/Admin";
import ExtranetTechnique from "./pages/ExtranetTechnique";
import NotFound from "./pages/NotFound";
import { initSupabase, isDatabaseConnected, initializeDatabase, isStorageConnected } from './services/supabaseService';
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000
    }
  }
});

const App = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    initialized: false,
    database: false,
    storage: false
  });

  // Initialize Supabase when the application loads
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
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/propriedades" element={<Propriedades />} />
            <Route path="/area-cliente" element={<AreaCliente connectionStatus={connectionStatus} />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/extranet-technique" element={<ExtranetTechnique />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
