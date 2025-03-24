
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
import { setMondayConfig } from "@/services/mondayService";

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
      const result = await setMondayConfig(apiKey, boardId);
      
      if (result.valid) {
        toast.success("Configuração Monday.com guardada", {
          description: result.message
        });
      } else {
        toast.error("Erro de configuração", {
          description: result.message
        });
      }
      
      onConfigUpdate(apiKey, boardId);
    } catch (error) {
      toast.error("Erro ao guardar", {
        description: "Ocorreu um erro ao guardar a configuração."
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
    toast("Configuração reiniciada");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Monday.com</CardTitle>
        <CardDescription>
          Configure a integração com Monday.com para sincronizar as declarações.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="monday-api-key" className="font-medium">
            Chave API Monday.com
          </label>
          <Input
            id="monday-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="A sua chave API Monday.com"
          />
          <p className="text-sm text-gray-500">
            Para obter a sua chave API, vá à sua conta Monday.com ➝ Perfil ➝ Developer ➝ API v2 Token
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="monday-board-id" className="font-medium">
            ID do Quadro Monday.com
          </label>
          <Input
            id="monday-board-id"
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            placeholder="ID do quadro (ex: 123456789)"
          />
          <p className="text-sm text-gray-500">
            O ID do quadro encontra-se no URL do seu quadro: https://your-domain.monday.com/boards/[ID DO QUADRO]
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
          Reiniciar
        </Button>
        <Button 
          onClick={handleSaveMondayConfig}
          disabled={!apiKey || !boardId || isTesting}
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Teste em curso...
            </>
          ) : (
            <>
              <Settings className="mr-2 h-4 w-4" />
              Testar e Guardar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
