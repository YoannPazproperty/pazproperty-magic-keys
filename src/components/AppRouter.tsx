
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "../pages/Index";
import Servicos from "../pages/Servicos";
import Sobre from "../pages/Sobre";
import Contacto from "../pages/Contacto";
import Propriedades from "../pages/Propriedades";
import PropertyDetail from "../pages/PropertyDetail";
import AreaCliente from "../pages/AreaCliente";
import Admin from "../pages/Admin";
import ExtranetTechnique from "../pages/ExtranetTechnique";
import NotFound from "../pages/NotFound";
import Auth from "../pages/Auth";
import AuthCallback from "../pages/AuthCallback";
import AccessDenied from "../pages/AccessDenied";
import { ConnectionStatus } from "../hooks/useSupabaseInit";

interface AppRouterProps {
  connectionStatus: ConnectionStatus;
}

export const AppRouter = ({ connectionStatus }: AppRouterProps) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/propriedades" element={<Propriedades />} />
          <Route path="/propriedades/:id" element={<PropertyDetail />} />
          <Route path="/area-cliente" element={<AreaCliente connectionStatus={connectionStatus} />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/extranet-technique" 
            element={
              <ProtectedRoute requiredRole="manager">
                <ExtranetTechnique />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
