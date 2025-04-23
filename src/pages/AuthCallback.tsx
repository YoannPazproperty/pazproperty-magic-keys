
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { testLogin } from "@/services/supabase/auth";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any | null>(null);
  const [testLoginResult, setTestLoginResult] = useState<any | null>(null);

  useEffect(() => {
    // Traiter le callback d'authentification
    const handleAuthCallback = async () => {
      try {
        console.log("Traitement du callback d'authentification");
        console.log("URL actuelle:", window.location.href);
        
        // Extraire tous les paramètres possibles - de l'URL et du hash
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Enregistrer les paramètres importants dans la console pour le débogage
        console.log("URL Search params:", Object.fromEntries(urlParams.entries()));
        console.log("Hash params:", Object.fromEntries(hashParams.entries()));
        
        // Vérifier tous les indicateurs possibles de réinitialisation de mot de passe
        const isReset = urlParams.get("reset") === "true";
        const type = urlParams.get("type") || hashParams.get("type");
        const email = urlParams.get("email");
        
        // Récupérer le token soit des paramètres URL soit du hash
        const accessToken = urlParams.get("token") || hashParams.get("access_token") || urlParams.get("access_token");
        
        const debugData = { 
          isReset, 
          type, 
          accessToken: accessToken ? "présent" : "absent",
          email: email || "non spécifié",
          hash: window.location.hash,
          search: window.location.search
        };
        
        console.log("Debug paramètres:", debugData);
        setDebugInfo(debugData);
        
        // Si c'est un reset de mot de passe ou si on a un token dans le hash/search
        if (isReset || type === "recovery" || accessToken) {
          console.log("Détection d'un flux de réinitialisation de mot de passe");
          setIsPasswordReset(true);
          
          // Stocker le token pour l'utiliser lors de la réinitialisation
          if (accessToken) {
            console.log("Token de réinitialisation trouvé:", accessToken);
            setToken(accessToken);
          }
          
          // Stocker l'email s'il est présent dans l'URL
          if (email) {
            console.log("Email trouvé dans l'URL:", email);
            setUserEmail(email);
          }
          
          return; // Attendre que l'utilisateur entre un nouveau mot de passe
        }
        
        // Extraire le code d'autorisation de l'URL s'il existe
        const code = urlParams.get("code");
        
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
    setTestLoginResult(null);
    
    if (newPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Tentative de réinitialisation du mot de passe");
      
      if (!token) {
        console.error("Aucun token d'accès trouvé");
        setPasswordError("Lien de réinitialisation invalide ou expiré");
        setLoading(false);
        return;
      }

      // Utiliser notre fonction Edge personnalisée pour réinitialiser le mot de passe
      console.log("Utilisation de la fonction Edge personnalisée avec le token:", token);
      
      const supabaseUrl = 'https://ubztjjxmldogpwawcnrj.supabase.co';
      const response = await fetch(
        `${supabaseUrl}/functions/v1/set-admin-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: newPassword,
            recoveryToken: token,
            // Inclure l'email dans la requête si disponible
            email: userEmail || undefined
          })
        }
      );

      const data = await response.json();
      console.log("Réponse de la réinitialisation:", data);
      
      if (!response.ok) {
        console.error("Erreur lors de la réinitialisation avec le token:", data);
        setPasswordError(data.error || "Échec de la réinitialisation du mot de passe");
        toast.error("Échec de la réinitialisation", {
          description: data.error || "Une erreur s'est produite"
        });
      } else {
        console.log("Mot de passe réinitialisé avec succès");
        toast.success("Mot de passe mis à jour avec succès");
        
        // Récupérer l'email de la réponse si disponible
        const resetEmail = data.userEmail || userEmail;
        
        // Tenter de se connecter directement avec le nouveau mot de passe
        if (resetEmail) {
          console.log("Tentative de connexion automatique avec l'email:", resetEmail);
          
          // Utiliser notre fonction de test de connexion améliorée
          const testResult = await testLogin(resetEmail, newPassword);
          setTestLoginResult(testResult);
          
          if (testResult.success) {
            console.log("Test de connexion réussi:", testResult);
            
            // Tenter la connexion réelle
            try {
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: resetEmail,
                password: newPassword,
              });
              
              if (signInError) {
                console.error("Échec de la connexion automatique réelle:", signInError);
                toast.error("Mot de passe mis à jour, mais la connexion automatique a échoué", {
                  description: "Veuillez vous connecter manuellement avec votre nouveau mot de passe."
                });
              } else {
                console.log("Connexion automatique réussie");
                toast.success("Connexion automatique réussie");
                navigate("/admin");
                return;
              }
            } catch (signInErr) {
              console.error("Erreur lors de la tentative de connexion automatique:", signInErr);
            }
          } else {
            console.error("Échec du test de connexion:", testResult);
            toast.error("Mot de passe mis à jour, mais le test de connexion a échoué", {
              description: "Veuillez vous connecter manuellement avec votre nouveau mot de passe."
            });
          }
        }
        
        // Si pas de connexion automatique, rediriger vers la page de connexion
        toast.info("Veuillez vous connecter avec votre nouveau mot de passe", {
          duration: 5000,
        });
        
        // Rediriger vers la page de connexion après un délai
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Exception lors de la réinitialisation:", err);
      setPasswordError(err.message || "Erreur technique");
      toast.error("Erreur technique lors de la réinitialisation du mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      {isPasswordReset ? (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Réinitialisation de mot de passe</h2>
          {userEmail && (
            <div className="mb-4 bg-blue-50 p-3 rounded">
              <p className="text-sm flex items-center text-blue-800">
                <Info className="h-4 w-4 mr-2" />
                Réinitialisation du mot de passe pour: <span className="font-medium ml-1">{userEmail}</span>
              </p>
            </div>
          )}
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
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Répétez votre mot de passe"
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

            {testLoginResult && (
              <div className="mt-2">
                <h3 className="font-medium text-sm mb-1">Résultat du test de connexion:</h3>
                <div className={`bg-gray-100 p-3 rounded text-xs overflow-auto ${
                  testLoginResult.success ? 'border-green-300' : 'border-red-300'
                } border`}>
                  <p><span className="font-bold">Succès:</span> {testLoginResult.success ? 'Oui' : 'Non'}</p>
                  <p><span className="font-bold">Message:</span> {testLoginResult.message}</p>
                  {testLoginResult.userData && (
                    <div>
                      <p className="font-bold mt-1">Données utilisateur:</p>
                      <pre>{JSON.stringify(testLoginResult.userData, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {debugInfo && (
              <div className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                <p className="font-bold mb-1">Informations de débogage:</p>
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
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
      ) : (
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
          
          {debugInfo && (
            <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-w-md">
              <p className="font-bold mb-1">Informations de débogage:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
