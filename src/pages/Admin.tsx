
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DeclarationList } from "@/components/admin/DeclarationList";
import { ApiSettings } from "@/components/admin/ApiSettings";
import { NotificationSettings } from "@/components/admin/NotificationSettings";
import { toast } from "sonner";
import { saveMondayConfig, validateMondayConfig, getMondayConfig } from "@/services/monday";
import { getDeclarations, updateDeclarationStatus } from "@/services/declarationService";
import { useAuth } from "@/hooks/useAuth";
import type { Declaration } from "@/services/types";

const Admin = () => {
  const { user, signOut } = useAuth();
  const [apiStatus, setApiStatus] = useState({ valid: false, message: "" });
  const [activeTab, setActiveTab] = useState("declarations");
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Récupérer les configurations Monday.com
  const { apiKey, boardId, techBoardId } = getMondayConfig();

  useEffect(() => {
    // Check API configuration status
    const checkApiStatus = async () => {
      const validation = await validateMondayConfig();
      setApiStatus(validation);
    };
    
    checkApiStatus();
    // Load declarations
    loadDeclarations();
  }, []);

  const loadDeclarations = async () => {
    setIsLoading(true);
    try {
      const allDeclarations = await getDeclarations();
      console.log("Loaded declarations:", allDeclarations);
      setDeclarations(allDeclarations);
    } catch (error) {
      console.error("Error loading declarations:", error);
      toast.error("Erreur lors du chargement des déclarations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Declaration["status"]) => {
    try {
      const updated = await updateDeclarationStatus(id, status);
      if (updated) {
        await loadDeclarations(); // Reload declarations to reflect changes
        toast.success("Statut mis à jour");
      } else {
        toast.error("Erreur lors de la mise à jour du statut");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleLogout = () => {
    signOut();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSaveApiConfig = (apiKey: string, boardId: string, techBoardId: string) => {
    saveMondayConfig(apiKey, boardId, techBoardId);
    
    // Validate the new configuration
    validateMondayConfig().then(validation => {
      setApiStatus(validation);
    });
  };

  return (
    <AdminLayout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      apiConnected={apiStatus.valid}
      user={user}
    >
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="declarations">Declarações</TabsTrigger>
          <TabsTrigger value="apiConfig">Config. API</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="declarations" className="space-y-4">
          <DeclarationList 
            declarations={declarations} 
            onStatusUpdate={handleStatusUpdate}
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="apiConfig" className="space-y-4">
          <ApiSettings 
            mondayApiKey={apiKey}
            mondayBoardId={boardId}
            mondayTechBoardId={techBoardId}
            mondayConfigStatus={apiStatus}
            onConfigUpdate={handleSaveApiConfig}
          />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Admin;
