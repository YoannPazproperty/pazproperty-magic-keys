
import { useNavigate } from "react-router-dom";

const NavigationLinks = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-4">Navegação</h3>
      <ul className="space-y-2">
        <li>
          <button 
            onClick={() => handleNavigation("/")} 
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Início
          </button>
        </li>
        <li>
          <button 
            onClick={() => handleNavigation("/servicos")} 
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Serviços
          </button>
        </li>
        <li>
          <button 
            onClick={() => handleNavigation("/propriedades")} 
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Propriedades
          </button>
        </li>
        <li>
          <button 
            onClick={() => handleNavigation("/sobre")} 
            className="text-gray-600 hover:text-primary transition-colors"
          >
            Sobre Nós
          </button>
        </li>
      </ul>
    </div>
  );
};

export default NavigationLinks;
