
import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingScreen from "@/components/ui/LoadingScreen";
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
import AuthDiagnostic from "@/pages/AuthDiagnostic";
import { ConnectionStatus } from "../hooks/useSupabaseInit";

interface AppRouterProps {
  connectionStatus: ConnectionStatus;
}

export const AppRouter = ({ connectionStatus }: AppRouterProps) => {
  const fallbackUI = <LoadingScreen />;

  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={fallbackUI}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/propriedades" element={<Propriedades />} />
              <Route path="/propriedades/:id" element={<PropertyDetail />} />
              <Route path="/area-cliente" element={
                connectionStatus ? (
                  <AreaCliente connectionStatus={connectionStatus} />
                ) : (
                  <Navigate to="/access-denied" replace />
                )
              } />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin" emailDomain="pazproperty.pt">
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/extranet-technique" element={
                <ProtectedRoute requiredRole="provider">
                  <ExtranetTechnique />
                </ProtectedRoute>
              } />
              <Route path="/auth-diagnostic" element={<AuthDiagnostic />} />
              <Route path="/extranet-technique-login" element={<Navigate to="/auth?provider=true" replace />} />
              <Route path="/admin-login" element={<Navigate to="/auth?admin=true" replace />} />
              <Route path="/auth-provider" element={<Navigate to="/auth?provider=true" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};
