import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TechnicienManager from "@/components/TechnicienManager";
import declarationService, { Declaration } from "@/services/declarationService";
import { LoginForm } from "@/components/admin/LoginForm";
import { DeclarationList } from "@/components/admin/DeclarationList";
import { ApiSettings } from "@/components/admin/ApiSettings";
import { NotificationSettings } from "@/components/admin/NotificationSettings";
import { getMondayConfig, validateMondayConfig } from "@/services/storageService";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "pazproperty2024";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [mondayApiKey, setMondayApiKey] = useState<string>("");
  const [mondayBoardId, setMondayBoardId] = useState<string>("");
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
    const allDeclarations = declarationService.getAll();
    setDeclarations(allDeclarations);
  };
  
  const loadMondayConfig = () => {
    const config = getMondayConfig();
    setMondayApiKey(config.apiKey);
    setMondayBoardId(config.boardId);
    
    if (config.apiKey && config.boardId) {
      validateMondayConfig(config.apiKey, config.boardId).then(result => {
        setMondayConfigStatus(result);
      });
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

  const updateDeclarationStatus = (id: string, newStatus: Declaration["status"]) => {
    const updatedDeclaration = declarationService.updateStatus(id, newStatus);
    
    if (updatedDeclaration) {
      loadDeclarations();
    }
  };
  
  const handleMondayConfigUpdate = (apiKey: string, boardId: string) => {
    setMondayApiKey(apiKey);
    setMondayBoardId(boardId);
    if (apiKey && boardId) {
      validateMondayConfig(apiKey, boardId).then(result => {
        setMondayConfigStatus(result);
      });
    } else {
      setMondayConfigStatus(null);
    }
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
                    onStatusUpdate={updateDeclarationStatus} 
                  />
                </TabsContent>
                
                <TabsContent value="technicians">
                  <TechnicienManager />
                </TabsContent>
                
                <TabsContent value="settings">
                  <ApiSettings 
                    mondayApiKey={mondayApiKey}
                    mondayBoardId={mondayBoardId}
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
