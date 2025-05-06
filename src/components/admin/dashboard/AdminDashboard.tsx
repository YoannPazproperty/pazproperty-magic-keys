
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DeclarationsTab } from "./tabs/DeclarationsTab";
import { ConstructionTab } from "./tabs/ConstructionTab";
import { CrmTab } from "./tabs/CrmTab";
import { ProvidersTab } from "./tabs/ProvidersTab";
import { AdminUsersTab } from "./tabs/AdminUsersTab";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, signOut, getUserRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("declarations");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est un administrateur complet
    const checkAdminPermission = async () => {
      try {
        const role = await getUserRole();
        setIsAdmin(role === 'admin');
      } catch (error) {
        console.error("Erreur lors de la vérification du rôle:", error);
      }
    };

    if (user) {
      checkAdminPermission();
    }
  }, [user, getUserRole]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
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

  return (
    <AdminLayout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      apiConnected={false}
      user={user}
    >
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="declarations">Acompanhamento das declarações</TabsTrigger>
          <TabsTrigger value="obras">Acompanhamento das obras</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="prestadores">Prestadores</TabsTrigger>
          {isAdmin && <TabsTrigger value="users">Utilisateurs Admin</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="declarations" className="space-y-4">
          <DeclarationsTab />
        </TabsContent>
        
        <TabsContent value="obras" className="space-y-4">
          <ConstructionTab />
        </TabsContent>
        
        <TabsContent value="crm" className="space-y-4">
          <CrmTab />
        </TabsContent>
        
        <TabsContent value="prestadores" className="space-y-4">
          <ProvidersTab />
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="users" className="space-y-4">
            <AdminUsersTab />
          </TabsContent>
        )}
      </Tabs>
    </AdminLayout>
  );
};

export default AdminDashboard;
