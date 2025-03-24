
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface LoginFormProps {
  onLogin: (username: string, password: string) => boolean;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const success = onLogin(username, password);
      if (!success) {
        setError("Identifiants incorrects. Essayez admin/password");
        toast.error("Échec de la connexion. Vérifiez vos identifiants.");
      }
    } catch (err) {
      setError("Une erreur s'est produite lors de la connexion");
      toast.error("Erreur de connexion");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Administration Pazproperty</CardTitle>
          <CardDescription>
            Inicie sessão para aceder à interface de administração.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Nome de utilizador
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Palavra-passe
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm py-2">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full">
              Iniciar sessão
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 w-full">
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Importante:</p>
                <p>Após iniciar sessão, configure a API Monday.com no separador "Configurações API" para ativar a sincronização das declarações.</p>
                <p className="mt-1 text-amber-700 font-medium">Identifiants par défault: admin / password</p>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
