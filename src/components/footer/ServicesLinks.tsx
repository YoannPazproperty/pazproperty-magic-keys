
import { Link } from "react-router-dom";

const ServicesLinks = () => {
  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-4">Serviços</h3>
      <ul className="space-y-2">
        <li>
          <Link to="/servicos#gestao" className="text-gray-600 hover:text-primary transition-colors">
            Gestão de Arrendamentos
          </Link>
        </li>
        <li>
          <Link to="/servicos#manutencao" className="text-gray-600 hover:text-primary transition-colors">
            Manutenção
          </Link>
        </li>
        <li>
          <Link to="/servicos#consultoria" className="text-gray-600 hover:text-primary transition-colors">
            Consultoria
          </Link>
        </li>
        <li>
          <Link to="/servicos#optimizacao-fiscal" className="text-gray-600 hover:text-primary transition-colors">
            Optimização Fiscal
          </Link>
        </li>
        <li>
          <Link to="/servicos#analise-mercado" className="text-gray-600 hover:text-primary transition-colors">
            Análise de Mercado
          </Link>
        </li>
        <li>
          <Link to="/servicos#seguros" className="text-gray-600 hover:text-primary transition-colors">
            Seguros
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default ServicesLinks;
