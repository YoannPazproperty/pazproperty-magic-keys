
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
        console.log("URL actuelle:", window.location.href);
        
        // Extraire le hash de l'URL s'il existe
        const hashParams = window.location.hash 
          ? new URLSearchParams(window.location.hash.substring(1))
          : null;
        
        if (hashParams && hashParams.get("error_description")) {
          const errorDescription = hashParams.get("error_description");
          console.error("Erreur dans les paramètres de l'URL:", errorDescription);
          toast.error("Échec de l'authentification", {
            description: errorDescription
          });
          navigate("/auth");
          return;
        }
        
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
          
          // Essayer d'échanger le code d'autorisation contre des jetons si présent dans l'URL
          const params = new URLSearchParams(window.location.search);
          const code = params.get("code");
          
          if (code) {
            console.log("Code d'autorisation trouvé, tentative d'échange");
            try {
              const { data: exchangeData, error: exchangeError } = 
                await supabase.auth.exchangeCodeForSession(code);
                
              if (exchangeError) {
                console.error("Erreur lors de l'échange du code:", exchangeError);
                toast.error("Erreur d'authentification");
                navigate("/auth");
              } else if (exchangeData.session) {
                console.log("Session créée avec succès via échange de code");
                toast.success("Connexion réussie");
                navigate("/admin");
              } else {
                console.error("Aucune session retournée après l'échange de code");
                toast.error("Impossible de finaliser la connexion");
                navigate("/auth");
              }
            } catch (exchangeErr) {
              console.error("Exception lors de l'échange du code:", exchangeErr);
              toast.error("Erreur d'authentification");
              navigate("/auth");
            }
          } else {
            // Si pas de code et pas de session, rediriger vers l'authentification
            console.log("Aucun code trouvé dans l'URL, redirection vers la page d'authentification");
            navigate("/auth");
          }
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
