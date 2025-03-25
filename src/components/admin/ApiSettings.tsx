
import { useState, useEffect } from "react";
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
import { Loader2, Settings, Info, RefreshCw } from "lucide-react";
import { 
  saveMondayConfig, 
  validateMondayConfig, 
  getBoardGroups 
} from "@/services/monday";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface ApiSettingsProps {
  mondayApiKey: string;
  mondayBoardId: string;
  mondayTechBoardId: string;
  mondayEventosGroupId?: string;
  mondayConfigStatus: { valid: boolean; message: string } | null;
  onConfigUpdate: (apiKey: string, boardId: string, techBoardId: string, eventosGroupId?: string) => void;
}

export const ApiSettings = ({ 
  mondayApiKey, 
  mondayBoardId, 
  mondayTechBoardId,
  mondayEventosGroupId = "",
  mondayConfigStatus,
  onConfigUpdate
}: ApiSettingsProps) => {
  const [apiKey, setApiKey] = useState(mondayApiKey);
  const [boardId, setBoardId] = useState(mondayBoardId);
  const [techBoardId, setTechBoardId] = useState(mondayTechBoardId);
  const [eventosGroupId, setEventosGroupId] = useState(mondayEventosGroupId);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState<boolean>(false);
  const [boardGroups, setBoardGroups] = useState<Array<{ id: string, title: string }> | null>(null);

  // Fetch board groups when boardId changes
  useEffect(() => {
    if (boardId && apiKey) {
      fetchBoardGroups();
    }
  }, [boardId, apiKey]);

  const fetchBoardGroups = async () => {
    if (!boardId || !apiKey) return;
    
    setIsLoadingGroups(true);
    try {
      const groups = await getBoardGroups(boardId);
      setBoardGroups(groups);
      console.log("Fetched board groups:", groups);
      
      // If Eventos group exists and no group is selected, auto-select it
      if (groups && !eventosGroupId) {
        const eventosGroup = groups.find(g => g.title === "Eventos");
        if (eventosGroup) {
          console.log("Auto-selecting Eventos group:", eventosGroup);
          setEventosGroupId(eventosGroup.id);
        }
      }
    } catch (error) {
      console.error("Error fetching board groups:", error);
      toast.error("Erreur lors du chargement des groupes");
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleSaveMondayConfig = async () => {
    setIsTesting(true);
    
    try {
      // Log to verify values being sent
      console.log("Saving Monday.com config:", { apiKey, boardId, techBoardId, eventosGroupId });
      
      // Save the configuration including the Eventos group ID
      saveMondayConfig(apiKey, boardId, techBoardId, eventosGroupId);
      
      // Validate the configuration after saving
      const result = await validateMondayConfig();
      
      if (result.valid) {
        toast.success("Configuration Monday.com sauvegardée", {
          description: result.message
        });
      } else {
        toast.error("Erreur de configuration", {
          description: result.message
        });
      }
      
      onConfigUpdate(apiKey, boardId, techBoardId, eventosGroupId);
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
    setTechBoardId("");
    setEventosGroupId("");
    localStorage.removeItem('mondayApiKey');
    localStorage.removeItem('mondayBoardId');
    localStorage.removeItem('mondayTechBoardId');
    localStorage.removeItem('mondayEventosGroupId');
    onConfigUpdate("", "", "", "");
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
            Pour obtenir votre clé API, allez à votre compte Monday.com → Profil → Developer → API v2 Token
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="monday-board-id" className="font-medium">
            ID du Tableau de Déclarations
          </label>
          <Input
            id="monday-board-id"
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            placeholder="ID du tableau de déclarations (ex: 1861342035)"
          />
          <p className="text-sm text-gray-500">
            Le tableau où seront envoyées les déclarations des clients
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="monday-group-id" className="font-medium">
              Groupe Eventos
            </label>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={fetchBoardGroups}
              disabled={isLoadingGroups || !boardId || !apiKey}
            >
              {isLoadingGroups ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Actualiser
            </Button>
          </div>
          
          {boardGroups && boardGroups.length > 0 ? (
            <Select value={eventosGroupId} onValueChange={setEventosGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un groupe" />
              </SelectTrigger>
              <SelectContent>
                {boardGroups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.title} {group.title === "Eventos" && "✓"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="monday-group-id"
              value={eventosGroupId}
              onChange={(e) => setEventosGroupId(e.target.value)}
              placeholder="ID du groupe Eventos"
              disabled={isLoadingGroups}
            />
          )}
          <p className="text-sm text-gray-500">
            Le groupe "Eventos" où seront créés les items (laissez vide pour utiliser le groupe par défaut)
          </p>
        </div>
        
        <Separator className="my-2" />
        
        <div className="space-y-2">
          <label htmlFor="monday-tech-board-id" className="font-medium">
            ID du Tableau de Prestataires
          </label>
          <Input
            id="monday-tech-board-id"
            value={techBoardId}
            onChange={(e) => setTechBoardId(e.target.value)}
            placeholder="ID du tableau de prestataires (ex: 1863361499)"
          />
          <p className="text-sm text-gray-500">
            Le tableau où seront envoyés les rapports des prestataires techniques
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
                  <li><span className="font-medium">Email:</span> "Email"</li>
                  <li><span className="font-medium">Téléphone:</span> "Telefone"</li>
                  <li><span className="font-medium">Adresse:</span> "Endereço"</li>
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
          Réinitialiser
        </Button>
        <Button 
          onClick={handleSaveMondayConfig}
          disabled={!apiKey || !boardId || !techBoardId || isTesting}
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
