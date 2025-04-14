
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    // Traiter le callback d'authentification
    const handleAuthCallback = async () => {
      try {
        console.log("Traitement du callback d'authentification");
        console.log("URL actuelle:", window.location.href);
        
        // Vérifier si c'est un flux de réinitialisation de mot de passe
        const searchParams = new URLSearchParams(window.location.search);
        const isReset = searchParams.get("reset") === "true";
        const type = searchParams.get("type");
        
        if (isReset || type === "recovery") {
          console.log("Détection d'un flux de réinitialisation de mot de passe");
          setIsPasswordReset(true);
          return; // Attendre que l'utilisateur entre un nouveau mot de passe
        }
        
        // Extraire le hash de l'URL s'il existe
        const hashParams = window.location.hash 
          ? new URLSearchParams(window.location.hash.substring(1))
          : null;
        
        if (hashParams && hashParams.get("error_description")) {
          const errorDescription = hashParams.get("error_description");
          console.error("Erreur dans les paramètres de l'URL:", errorDescription);
          setError(errorDescription || "Erreur d'authentification");
          toast.error("Échec de l'authentification", {
            description: errorDescription
          });
          setTimeout(() => navigate("/auth"), 3000);
          return;
        }
        
        // Essayer d'échanger le code d'autorisation contre des jetons si présent dans l'URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        
        if (code) {
          console.log("Code d'autorisation trouvé, tentative d'échange");
          try {
            const { data, error: exchangeError } = 
              await supabase.auth.exchangeCodeForSession(code);
              
            if (exchangeError) {
              console.error("Erreur lors de l'échange du code:", exchangeError);
              setError(exchangeError.message);
              toast.error("Erreur d'authentification", {
                description: exchangeError.message
              });
              setTimeout(() => navigate("/auth"), 3000);
            } else if (data.session) {
              console.log("Session créée avec succès via échange de code");
              toast.success("Connexion réussie");
              navigate("/admin");
            } else {
              console.error("Aucune session retournée après l'échange de code");
              setError("Impossible de finaliser la connexion");
              toast.error("Impossible de finaliser la connexion");
              setTimeout(() => navigate("/auth"), 3000);
            }
          } catch (exchangeErr: any) {
            console.error("Exception lors de l'échange du code:", exchangeErr);
            setError(exchangeErr.message || "Erreur lors de l'échange du code");
            toast.error("Erreur d'authentification");
            setTimeout(() => navigate("/auth"), 3000);
          }
        } else {
          // Récupérer la session actuelle
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Erreur de récupération de session:", sessionError);
            setError(sessionError.message);
            toast.error("Échec de l'authentification", {
              description: sessionError.message
            });
            setTimeout(() => navigate("/auth"), 3000);
          } else if (data?.session) {
            console.log("Session récupérée avec succès");
            toast.success("Connexion réussie");
            navigate("/admin");
          } else {
            // Si pas de code et pas de session, rediriger vers l'authentification
            console.log("Aucun code trouvé dans l'URL et pas de session active");
            setError("Aucune information d'authentification trouvée");
            setTimeout(() => navigate("/auth"), 2000);
          }
        }
      } catch (err: any) {
        console.error("Erreur inattendue lors du callback:", err);
        setError(err.message || "Une erreur est survenue lors de l'authentification");
        toast.error("Une erreur est survenue lors de l'authentification");
        setTimeout(() => navigate("/auth"), 3000);
      }
    };

    if (!isPasswordReset) {
      handleAuthCallback();
    }
  }, [navigate, isPasswordReset]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    if (newPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Tentative de réinitialisation du mot de passe");
      
      // Récupère le token de réinitialisation et de type depuis l'URL
      const hash = window.location.hash.substring(1);
      const searchParams = new URLSearchParams(hash || window.location.search);
      const token = searchParams.get("token") || searchParams.get("access_token");
      
      if (!token) {
        console.error("Aucun token de réinitialisation trouvé dans l'URL");
        setPasswordError("Le lien de réinitialisation est invalide ou a expiré. Veuillez réessayer.");
        toast.error("Lien de réinitialisation invalide");
        setLoading(false);
        return;
      }
      
      console.log("Token trouvé, mise à jour du mot de passe...");
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword
      });
      
      if (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", error);
        setPasswordError(error.message);
        toast.error("Échec de la réinitialisation du mot de passe", {
          description: error.message
        });
      } else {
        console.log("Mot de passe réinitialisé avec succès");
        toast.success("Mot de passe mis à jour avec succès");
        setTimeout(() => navigate("/admin"), 2000);
      }
    } catch (err: any) {
      console.error("Exception lors de la réinitialisation du mot de passe:", err);
      setPasswordError(err.message || "Une erreur est survenue lors de la réinitialisation du mot de passe");
      toast.error("Erreur technique");
    } finally {
      setLoading(false);
    }
  };

  if (isPasswordReset) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Réinitialisation de mot de passe</h2>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Minimum 8 caractères"
                required
                minLength={8}
              />
            </div>
            
            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              disabled={loading}
            >
              {loading ? "Réinitialisation en cours..." : "Réinitialiser mon mot de passe"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-center text-gray-500">
          {error ? "Erreur d'authentification..." : "Authentification en cours..."}
        </p>
        {error && (
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
