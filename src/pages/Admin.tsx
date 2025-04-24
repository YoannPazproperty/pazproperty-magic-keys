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
import { useNavigate } from "react-router-dom";
import { getContactsList } from "@/services/contacts/contactQueries";
import { ContactsList } from "@/components/admin/ContactsList";
import type { CommercialContact } from "@/services/types";

const Admin = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState({ valid: false, message: "" });
  const [activeTab, setActiveTab] = useState("declarations");
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<CommercialContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  
  const { apiKey, boardId, techBoardId } = getMondayConfig();

  useEffect(() => {
    const checkApiStatus = async () => {
      const validation = await validateMondayConfig();
      setApiStatus(validation);
    };
    
    checkApiStatus();
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

  const loadContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const allContacts = await getContactsList();
      setContacts(allContacts);
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast.error("Erro ao carregar contatos");
    } finally {
      setIsLoadingContacts(false);
    }
  };

  useEffect(() => {
    if (activeTab === "crm") {
      loadContacts();
    }
  }, [activeTab]);

  const handleStatusUpdate = async (id: string, status: Declaration["status"]) => {
    try {
      const updated = await updateDeclarationStatus(id, status);
      if (updated) {
        await loadDeclarations();
        toast.success("Statut mis à jour");
      } else {
        toast.error("Erreur lors de la mise à jour du statut");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
      toast.success("Vous avez été déconnecté");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Une erreur est survenue lors de la déconnexion");
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSaveApiConfig = (apiKey: string, boardId: string, techBoardId: string) => {
    saveMondayConfig(apiKey, boardId, techBoardId);
    
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
          <TabsTrigger value="declarations">Acompanhamento das declarações</TabsTrigger>
          <TabsTrigger value="obras">Acompanhamento das obras</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
        </TabsList>
        
        <TabsContent value="declarations" className="space-y-4">
          <DeclarationList 
            declarations={declarations} 
            onStatusUpdate={handleStatusUpdate}
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="obras" className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Acompanhamento das obras e dos prestadores de serviços</h2>
            <p className="text-muted-foreground">Cette section est en cours de développement. Elle permettra de suivre les travaux et les prestataires de services.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="crm" className="space-y-4">
          <div className="rounded-lg border bg-card p-6 mb-4">
            <h2 className="text-2xl font-semibold mb-4">CRM</h2>
            <p className="text-muted-foreground mb-4">Gerencie seus contatos comerciais aqui.</p>
          </div>
          <ContactsList 
            contacts={contacts}
            isLoading={isLoadingContacts}
          />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Admin;
