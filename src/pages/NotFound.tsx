
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Página não encontrada</h2>
        <p className="text-gray-600">
          A página que você está procurando não existe ou foi movida.
        </p>
        
        <div className="space-y-3">
          <Button variant="default" asChild className="w-full">
            <Link to="/">Ir para página inicial</Link>
          </Button>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="outline" asChild>
              <Link to="/extranet-technique-login">
                Acesso para Prestadores de Serviços
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/auth">
                Admin Login
              </Link>
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-8">
          Se você acredita que isso é um erro, por favor contacte o suporte.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
