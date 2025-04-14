
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Traiter le callback d'authentification
    const handleAuthCallback = async () => {
      try {
        console.log("Traitement du callback d'authentification");
        
        // Récupérer la session actuelle
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur de callback d'authentification:", error);
          toast.error("Échec de l'authentification", {
            description: error.message
          });
          navigate("/auth");
        } else if (data?.session) {
          console.log("Session récupérée avec succès:", data.session);
          toast.success("Connexion réussie");
          navigate("/admin");
        } else {
          console.error("Pas de session trouvée dans le callback");
          navigate("/auth");
        }
      } catch (err) {
        console.error("Erreur inattendue lors du callback:", err);
        toast.error("Une erreur est survenue lors de l'authentification");
        navigate("/auth");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-center text-gray-500">
          Authentification en cours...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
