
import { useEffect } from "react";
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
import { initSupabase, initializeDatabase, createBucketIfNotExists } from './services/supabaseService';
import { migrateDeclarationsToSupabase } from "./services/declarations/supabaseDeclarationStorage";
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
  // Initialize Supabase when the application loads
  useEffect(() => {
    const setupSupabase = async () => {
      console.log("App: Initializing Supabase...");
      
      // Initialize Supabase client
      const supabase = initSupabase();
      if (!supabase) {
        console.log("App: Fallback mode: Supabase is not available, using local storage only");
        toast.info("Modo local ativo", {
          description: "Usando armazenamento local para guardar seus dados."
        });
        return;
      }
      
      // Create declaration-media bucket if it doesn't exist
      console.log("App: Creating declaration-media bucket if it doesn't exist...");
      const bucketCreated = await createBucketIfNotExists('declaration-media');
      
      if (!bucketCreated) {
        console.log("App: Failed to create declaration-media bucket");
        toast.warning("Aviso de armazenamento", {
          description: "Não foi possível criar o bucket para mídia. Os arquivos serão salvos localmente."
        });
      } else {
        console.log("App: declaration-media bucket is ready");
      }
      
      // Initialize the database
      const initialized = await initializeDatabase();
      if (!initialized) {
        console.log("App: Supabase database not initialized, using local storage");
        toast.error("Erro de conexão com Supabase", {
          description: "O aplicativo funcionará apenas no modo local."
        });
        return;
      }
      
      toast.success("Conexão com Supabase estabelecida", {
        description: "Os dados serão sincronizados com Supabase."
      });
      
      // Migrate local data to Supabase
      console.log("App: Migrating local data to Supabase...");
      const migrated = await migrateDeclarationsToSupabase();
      
      if (migrated) {
        toast.success("Migração bem-sucedida", {
          description: "Os dados foram migrados para Supabase com sucesso."
        });
      } else {
        console.log("App: No data migrated or migration failed");
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
            <Route path="/area-cliente" element={<AreaCliente />} />
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
