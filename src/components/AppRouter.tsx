
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "../pages/Index";
import Servicos from "../pages/Servicos";
import Sobre from "../pages/Sobre";
import Contacto from "../pages/Contacto";
import Propriedades from "../pages/Propriedades";
import AreaCliente from "../pages/AreaCliente";
import Admin from "../pages/Admin";
import ExtranetTechnique from "../pages/ExtranetTechnique";
import NotFound from "../pages/NotFound";
import { ConnectionStatus } from "../hooks/useSupabaseInit";

interface AppRouterProps {
  connectionStatus: ConnectionStatus;
}

export const AppRouter = ({ connectionStatus }: AppRouterProps) => {
  return (
    <BrowserRouter>
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
  );
};
