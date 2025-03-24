
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
import { Loader2, Settings, Info } from "lucide-react";
import { setMondayConfig } from "@/services/mondayService";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
        toast.success("Configuration Monday.com guardada", {
          description: result.message
        });
      } else {
        toast.error("Erreur de configuration", {
          description: result.message
        });
      }
      
      onConfigUpdate(apiKey, boardId);
    } catch (error) {
      toast.error("Erreur au guardada", {
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
    toast("Configuration reiniciada");
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

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="column-mapping">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Structure des colonnes Monday.com
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-sm space-y-2 bg-slate-50 p-4 rounded-md">
                <p className="font-medium">Colonnes utilisées pour les déclarations:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><span className="font-medium">Nom du client:</span> "Nome do Inquilino"</li>
                  <li><span className="font-medium">Email:</span> "email_mknvfg3r"</li>
                  <li><span className="font-medium">Téléphone:</span> "phone_mknyxy109"</li>
                  <li><span className="font-medium">Adresse:</span> "text_mknyjz67"</li>
                  <li><span className="font-medium">Type de problème:</span> "Tipo de problema"</li>
                  <li><span className="font-medium">Description:</span> "Descrição"</li>
                  <li><span className="font-medium">Urgence:</span> "Urgência"</li>
                  <li><span className="font-medium">Statut:</span> "Status"</li>
                </ul>
                <p className="mt-3 text-xs text-slate-500">Note: Si vous modifiez la structure des colonnes dans Monday.com, vous devrez mettre à jour le mappage dans le code.</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
