
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { testLoginCredentials } from "@/hooks/auth/authService";
import { supabase } from "@/integrations/supabase/client";

export default function AuthDiagnosticTool() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);
    setIsLoading(true);
    
    try {
      console.log("Lancement du diagnostic d'authentification pour:", email);
      
      // Étape 1: Vérifier si l'utilisateur existe dans la table users
      const { data: publicUserData, error: publicUserError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();
      
      // Étape 2: Tester les identifiants directement
      const loginTest = await testLoginCredentials(email, password);
      
      // Étape 3: Vérifier si l'utilisateur a un rôle prestataire
      let providerRoleData = null;
      let providerDetailData = null;
      
      if (loginTest.success && loginTest.userId) {
        const { data: roleData } = await supabase
          .from('prestadores_roles')
          .select('*')
          .eq('user_id', loginTest.userId)
          .maybeSingle();
          
        providerRoleData = roleData;
        
        if (roleData?.prestador_id) {
          const { data: providerData } = await supabase
            .from('prestadores_de_servicos')
            .select('*')
            .eq('id', roleData.prestador_id)
            .maybeSingle();
            
          providerDetailData = providerData;
        }
      }
      
      setResults({
        timestamp: new Date().toISOString(),
        publicUser: {
          exists: !!publicUserData,
          data: publicUserData
        },
        authentication: loginTest,
        providerRole: providerRoleData,
        providerDetails: providerDetailData,
      });
      
    } catch (err: any) {
      console.error("Erreur lors du diagnostic:", err);
      setError(err.message || "Une erreur s'est produite lors du diagnostic");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Outil de diagnostic d'authentification</CardTitle>
        <CardDescription>
          Testez les informations d'identification pour diagnostiquer les problèmes de connexion
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleTest} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              "Tester les identifiants"
            )}
          </Button>
        </form>
        
        {results && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Résultats du diagnostic</h3>
            
            <div className="grid gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium">Utilisateur public</h4>
                {results.publicUser.exists ? (
                  <div className="flex items-center text-green-600 mt-2">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span>Trouvé avec ID: {results.publicUser.data.id}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600 mt-2">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>Non trouvé dans la table users</span>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium">Authentification</h4>
                {results.authentication.success ? (
                  <div className="flex items-center text-green-600 mt-2">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span>Connexion réussie avec ID: {results.authentication.userId}</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 mt-2">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>Échec de connexion: {results.authentication.error}</span>
                    {results.authentication.details && (
                      <span className="block mt-1 text-xs">
                        Code: {results.authentication.details.status}, 
                        Type: {results.authentication.details.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {results.authentication.success && (
                <>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium">Rôle prestataire</h4>
                    {results.providerRole ? (
                      <div className="flex items-center text-green-600 mt-2">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        <span>
                          Rôle prestataire trouvé (niveau: {results.providerRole.nivel}, 
                          ID prestataire: {results.providerRole.prestador_id})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600 mt-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span>Aucun rôle prestataire trouvé</span>
                      </div>
                    )}
                  </div>
                  
                  {results.providerDetails && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium">Détails du prestataire</h4>
                      <div className="text-sm mt-2">
                        <p><strong>Entreprise:</strong> {results.providerDetails.empresa}</p>
                        <p><strong>Email:</strong> {results.providerDetails.email}</p>
                        <p><strong>Gérant:</strong> {results.providerDetails.nome_gerente}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md mt-4">
              <h4 className="font-medium text-blue-800">Conclusion</h4>
              <div className="text-blue-700 mt-2">
                {results.authentication.success ? (
                  <p>Les identifiants sont valides. 
                    {results.providerRole 
                      ? " L'utilisateur a un rôle prestataire et devrait pouvoir accéder à l'extranet technique." 
                      : " L'utilisateur n'a pas de rôle prestataire, ce qui peut expliquer des problèmes d'accès à l'extranet technique."}
                  </p>
                ) : (
                  <p>Les identifiants sont invalides. Vérifiez l'email et le mot de passe fournis.</p>
                )}
              </div>
            </div>
            
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500">Données techniques complètes</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto text-xs">
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start bg-gray-50">
        <div className="text-sm text-gray-500">
          <p className="font-medium">Conseils de dépannage:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Assurez-vous que l'email est orthographié correctement</li>
            <li>Vérifiez si le mot de passe a été correctement changé</li>
            <li>Confirmez que l'utilisateur a un rôle prestataire attribué</li>
            <li>Vérifiez les métadonnées de l'utilisateur pour password_reset_required</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
}
