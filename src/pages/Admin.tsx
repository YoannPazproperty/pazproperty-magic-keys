
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TechnicienManager from "@/components/TechnicienManager";
import { Declaration } from "@/services/types";
import { getDeclarations, updateDeclarationStatus } from "@/services/declarationService";
import { LoginForm } from "@/components/admin/LoginForm";
import { DeclarationList } from "@/components/admin/DeclarationList";
import { ApiSettings } from "@/components/admin/ApiSettings";
import { NotificationSettings } from "@/components/admin/NotificationSettings";
import { getMondayConfig, validateMondayConfig, saveMondayConfig } from "@/services/storageService";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "pazproperty2024";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [mondayApiKey, setMondayApiKey] = useState<string>("");
  const [mondayBoardId, setMondayBoardId] = useState<string>("");
  const [mondayTechBoardId, setMondayTechBoardId] = useState<string>("");
  const [mondayConfigStatus, setMondayConfigStatus] = useState<{valid: boolean, message: string} | null>(null);
  const [activeTab, setActiveTab] = useState<string>("declarations");
  
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDeclarations();
      loadMondayConfig();
    }
  }, [isAuthenticated]);

  const loadDeclarations = () => {
    const allDeclarations = getDeclarations();
    setDeclarations(allDeclarations);
  };
  
  const loadMondayConfig = async () => {
    const config = getMondayConfig();
    setMondayApiKey(config.apiKey);
    setMondayBoardId(config.boardId);
    setMondayTechBoardId(config.techBoardId);
    
    console.log("Loaded Monday.com config:", config);
    
    if (config.apiKey && config.boardId && config.techBoardId) {
      try {
        const result = validateMondayConfig(config.apiKey, config.boardId, config.techBoardId);
        setMondayConfigStatus(result);
      } catch (error) {
        console.error("Error validating Monday config:", error);
      }
    }
  };
  
  const handleLogin = (username: string, password: string) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuthenticated", "true");
      toast("Connexion réussie", {
        description: "Bienvenue dans l'interface d'administration."
      });
      loadDeclarations();
    } else {
      toast.error("Échec de la connexion", {
        description: "Nom d'utilisateur ou mot de passe incorrect."
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
    toast("Déconnexion réussie", {
      description: "Vous avez été déconnecté avec succès."
    });
  };

  const handleStatusUpdate = (id: string, newStatus: Declaration["status"]) => {
    const success = updateDeclarationStatus(id, newStatus);
    
    if (success) {
      loadDeclarations();
    }
  };
  
  const handleMondayConfigUpdate = async (apiKey: string, boardId: string, techBoardId: string) => {
    console.log("Updating Monday.com config:", { apiKey, boardId, techBoardId });
    setMondayApiKey(apiKey);
    setMondayBoardId(boardId);
    setMondayTechBoardId(techBoardId);
    
    // Save the configuration to localStorage
    saveMondayConfig(apiKey, boardId, techBoardId);
    
    const result = validateMondayConfig(apiKey, boardId, techBoardId);
    setMondayConfigStatus(result);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          {!isAuthenticated ? (
            <LoginForm onLogin={handleLogin} />
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Interface d'Administration</h1>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="declarations">Déclarations</TabsTrigger>
                  <TabsTrigger value="technicians">Prestataires</TabsTrigger>
                  <TabsTrigger value="settings">Paramètres API</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="declarations">
                  <DeclarationList 
                    declarations={declarations} 
                    onStatusUpdate={handleStatusUpdate} 
                  />
                </TabsContent>
                
                <TabsContent value="technicians">
                  <TechnicienManager />
                </TabsContent>
                
                <TabsContent value="settings">
                  <ApiSettings 
                    mondayApiKey={mondayApiKey}
                    mondayBoardId={mondayBoardId}
                    mondayTechBoardId={mondayTechBoardId}
                    mondayConfigStatus={mondayConfigStatus}
                    onConfigUpdate={handleMondayConfigUpdate}
                  />
                </TabsContent>
                
                <TabsContent value="notifications">
                  <NotificationSettings />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
