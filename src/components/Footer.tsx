
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import NavigationLinks from "./footer/NavigationLinks";
import ServicesLinks from "./footer/ServicesLinks";
import ContactInfo from "./footer/ContactInfo";

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-xl font-bold text-gradient">Pazproperty</span>
            </Link>
            <div className="text-gray-600 mb-4">
              <p><em>Your keys, our responsibilities</em></p>
              <p><em>As suas chaves, a nossa missão</em></p>
            </div>
            <p className="text-gray-600">
              Gestão de propriedades em Lisboa, Portugal.
            </p>
          </div>
          
          <NavigationLinks />
          <ServicesLinks />
          <ContactInfo />
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} Pazproperty. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/termos" className="text-gray-500 hover:text-primary text-sm transition-colors">
              Termos de Serviço
            </Link>
            <Link to="/privacidade" className="text-gray-500 hover:text-primary text-sm transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
