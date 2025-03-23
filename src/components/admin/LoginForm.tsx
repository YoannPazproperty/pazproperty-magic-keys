
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
  onLogin: (username: string, password: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Administration Pazproperty</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder à l'interface d'administration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Nom d'utilisateur
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
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 w-full">
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Important:</p>
                <p>Après connexion, configurez l'API Monday.com dans l'onglet "Paramètres API" pour activer la synchronisation des déclarations.</p>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
