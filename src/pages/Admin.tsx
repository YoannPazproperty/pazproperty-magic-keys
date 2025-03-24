
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DeclarationList } from "@/components/admin/DeclarationList";
import { ApiSettings } from "@/components/admin/ApiSettings";
import { NotificationSettings } from "@/components/admin/NotificationSettings";
import { LoginForm } from "@/components/admin/LoginForm";
import { toast } from "sonner";
import { saveMondayConfig, validateMondayConfig, getMondayConfig } from "@/services/monday";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiStatus, setApiStatus] = useState({ valid: false, message: "" });
  const [activeTab, setActiveTab] = useState("declarations");
  
  // Récupérer les configurations Monday.com
  const { apiKey, boardId, techBoardId } = getMondayConfig();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    setIsLoggedIn(adminLoggedIn);
    
    // Check API configuration status
    const checkApiStatus = async () => {
      const validation = await validateMondayConfig();
      setApiStatus(validation);
    };
    
    if (adminLoggedIn) {
      checkApiStatus();
    }
  }, []);

  const handleLogin = (username: string, password: string): boolean => {
    // Simple hard-coded authentication for demonstration
    if (username === 'admin' && password === 'password') {
      localStorage.setItem('adminLoggedIn', 'true');
      setIsLoggedIn(true);
      toast.success("Connexion réussie");
      
      // Check API configuration status after login
      validateMondayConfig().then(validation => {
        setApiStatus(validation);
      });
      
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
    toast.info("Vous avez été déconnecté");
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

  // If not logged in, show login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8">
          <h1 className="text-2xl font-bold text-center">Admin Login</h1>
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      apiConnected={apiStatus.valid}
    >
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="declarations">Declarações</TabsTrigger>
          <TabsTrigger value="apiConfig">Config. API</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="declarations" className="space-y-4">
          <DeclarationList 
            declarations={[]} 
            onStatusUpdate={() => {}} 
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
