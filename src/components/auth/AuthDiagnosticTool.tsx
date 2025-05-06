
import { useState } from "react";
import { toast } from "sonner";
import { testLoginCredentials } from "@/hooks/auth/authService";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export default function AuthDiagnosticTool() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [authUserInfo, setAuthUserInfo] = useState<any>(null);
  const [isLoadingAuthInfo, setIsLoadingAuthInfo] = useState(false);

  const checkCredentials = async () => {
    if (!email || !password) {
      toast.error("Por favor, preencha o email e a senha");
      return;
    }

    setIsChecking(true);
    setResult(null);
    
    try {
      const testResult = await testLoginCredentials(email, password);
      setResult(testResult);
      
      if (testResult.success) {
        toast.success("Credenciais válidas!");
      } else {
        toast.error("Credenciais inválidas");
      }
    } catch (error) {
      console.error("Erro ao testar credenciais:", error);
      setResult({
        success: false,
        error: "Erro técnico ao verificar credenciais"
      });
      toast.error("Erro ao verificar credenciais");
    } finally {
      setIsChecking(false);
    }
  };

  const checkUserInAuth = async () => {
    if (!email) {
      toast.error("Por favor, informe um email");
      return;
    }

    setIsLoadingAuthInfo(true);
    setAuthUserInfo(null);

    try {
      // Call the check-user-auth edge function
      const SUPABASE_URL = "https://ubztjjxmldogpwawcnrj.supabase.co";
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/check-user-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey
          },
          body: JSON.stringify({ email })
        }
      );
      
      const data = await response.json();
      setAuthUserInfo(data);
      
      if (data.authUserExists) {
        toast.success("Usuário encontrado em auth.users");
      } else {
        toast.error("Usuário não encontrado em auth.users");
      }
    } catch (error) {
      console.error("Erro ao verificar usuário em auth:", error);
      setAuthUserInfo({
        error: "Erro técnico ao verificar usuário",
        details: String(error)
      });
      toast.error("Erro ao verificar usuário");
    } finally {
      setIsLoadingAuthInfo(false);
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Credenciais</CardTitle>
          <CardDescription>
            Verifique se um email e senha são válidos para login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email do usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <div className="flex gap-2 w-full">
            <Button 
              onClick={checkCredentials} 
              disabled={isChecking || !email || !password}
              className="flex-1"
            >
              {isChecking ? "Verificando..." : "Testar credenciais"}
            </Button>
            <Button 
              onClick={checkUserInAuth} 
              disabled={isLoadingAuthInfo || !email}
              variant="outline"
              className="flex-1"
            >
              {isLoadingAuthInfo ? "Verificando..." : "Verificar usuário em auth"}
            </Button>
          </div>

          {result && (
            <div className="w-full p-4 border rounded-md bg-muted/50 overflow-auto">
              <h3 className="font-semibold mb-2">Resultado do teste de credenciais:</h3>
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          {authUserInfo && (
            <div className="w-full p-4 border rounded-md bg-muted/50 overflow-auto">
              <h3 className="font-semibold mb-2">Informações do usuário em auth:</h3>
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(authUserInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
