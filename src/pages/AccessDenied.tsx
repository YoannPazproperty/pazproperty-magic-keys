
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="bg-red-100 p-3 rounded-full inline-flex items-center justify-center mb-6">
          <Shield className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Accès refusé</h1>
        <p className="text-gray-500 mb-6">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page. Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.
        </p>
        <div className="space-y-3">
          <Button onClick={() => navigate(-1)}>Retour</Button>
          <div>
            <Button variant="outline" onClick={() => navigate("/")}>
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
