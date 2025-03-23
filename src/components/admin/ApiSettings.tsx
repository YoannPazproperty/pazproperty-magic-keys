
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Settings } from "lucide-react";
import declarationService from "@/services/declarationService";

interface ApiSettingsProps {
  mondayApiKey: string;
  mondayBoardId: string;
  mondayConfigStatus: { valid: boolean; message: string } | null;
  onConfigUpdate: (apiKey: string, boardId: string) => void;
}

export const ApiSettings = ({ 
  mondayApiKey, 
  mondayBoardId, 
  mondayConfigStatus,
  onConfigUpdate
}: ApiSettingsProps) => {
  const [apiKey, setApiKey] = useState(mondayApiKey);
  const [boardId, setBoardId] = useState(mondayBoardId);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const handleSaveMondayConfig = async () => {
    setIsTesting(true);
    
    try {
      const result = await declarationService.setMondayConfig(apiKey, boardId);
      
      if (result.valid) {
        toast.success("Configuration Monday.com sauvegardée", {
          description: result.message
        });
      } else {
        toast.error("Erreur de configuration", {
          description: result.message
        });
      }
      
      onConfigUpdate(apiKey, boardId);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde", {
        description: "Une erreur s'est produite lors de la sauvegarde de la configuration."
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    setApiKey("");
    setBoardId("");
    localStorage.removeItem('mondayApiKey');
    localStorage.removeItem('mondayBoardId');
    onConfigUpdate("", "");
    toast("Configuration réinitialisée");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration de Monday.com</CardTitle>
        <CardDescription>
          Configurez l'intégration avec Monday.com pour synchroniser les déclarations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="monday-api-key" className="font-medium">
            Clé API Monday.com
          </label>
          <Input
            id="monday-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Votre clé API Monday.com"
          />
          <p className="text-sm text-gray-500">
            Pour obtenir votre clé API, allez dans votre compte Monday.com ➝ Profile ➝ Developer ➝ API v2 Token
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="monday-board-id" className="font-medium">
            ID du Tableau Monday.com
          </label>
          <Input
            id="monday-board-id"
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            placeholder="ID du tableau (ex: 123456789)"
          />
          <p className="text-sm text-gray-500">
            L'ID du tableau se trouve dans l'URL de votre tableau: https://your-domain.monday.com/boards/[ID DU TABLEAU]
          </p>
        </div>
        
        {mondayConfigStatus && (
          <div className={`p-4 border rounded-md ${mondayConfigStatus.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`text-sm ${mondayConfigStatus.valid ? 'text-green-800' : 'text-red-800'}`}>
              {mondayConfigStatus.message}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          Réinitialiser
        </Button>
        <Button 
          onClick={handleSaveMondayConfig}
          disabled={!apiKey || !boardId || isTesting}
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <Settings className="mr-2 h-4 w-4" />
              Tester et Sauvegarder
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
