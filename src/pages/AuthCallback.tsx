
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Traiter le callback d'authentification
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSessionFromUrl();
      if (error) {
        console.error("Erreur de callback d'authentification:", error);
        navigate("/auth");
      } else {
        navigate("/admin");
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
