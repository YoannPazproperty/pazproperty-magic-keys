
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
import { initSupabase, initializeDatabase } from "./services/supabaseService";
import { migrateDeclarationsToSupabase } from "./services/declarations/supabaseDeclarationStorage";
import { toast } from "sonner";

const queryClient = new QueryClient();

const App = () => {
  // Initialiser Supabase au chargement de l'application
  useEffect(() => {
    const setupSupabase = async () => {
      console.log("Initialisation de Supabase...");
      
      // Initialiser le client Supabase
      const supabase = initSupabase();
      if (!supabase) {
        console.log("Mode fallback: Supabase n'est pas disponible, utilisation du stockage local uniquement");
        // Ne pas afficher de toast d'erreur pour ne pas inquiéter l'utilisateur
        // L'application continuera de fonctionner avec localStorage
        return;
      }
      
      // Initialiser la base de données
      const initialized = await initializeDatabase();
      if (!initialized) {
        console.log("Base de données Supabase non initialisée, utilisation du stockage local");
        return;
      }
      
      // Migrer les données locales vers Supabase
      console.log("Migration des données locales vers Supabase...");
      const migrated = await migrateDeclarationsToSupabase();
      
      if (migrated) {
        toast.success("Migration réussie", {
          description: "Les données ont été migrées vers Supabase avec succès."
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
