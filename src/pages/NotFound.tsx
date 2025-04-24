
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Check if this might be a provider trying to access the platform
  const isLikelyProvider = location.pathname.includes("extranet") || 
                          location.pathname.includes("techn") || 
                          location.pathname.includes("prestador");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Página não encontrada</p>
        
        {isLikelyProvider ? (
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Se você é um prestador de serviços tentando acessar o Extranet Técnica, 
              por favor use o link abaixo:
            </p>
            <Link to="/auth?provider=true" 
                  className="text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md block mb-4">
              Acesso para Prestadores de Serviços
            </Link>
          </div>
        ) : null}
        
        <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
          Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
