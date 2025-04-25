
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import TechnicienManager from "@/components/TechnicienManager";
import { ServiceOrdersList } from "@/components/extranet/ServiceOrdersList";
import { UserPasswordSettingsDialog } from "@/components/extranet/UserPasswordSettingsDialog";

const ExtranetTechnique = () => {
  const [activeTab, setActiveTab] = useState("new");
  const { signOut, user } = useAuth();
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  // Vérifier si l'utilisateur n'a pas encore défini de mot de passe
  useEffect(() => {
    // Si l'utilisateur vient de s'inscrire et n'a pas encore défini son mot de passe
    // Ou si l'utilisateur vient d'une réinitialisation de mot de passe
    if (user && user.user_metadata) {
      if (user.user_metadata.first_login || user.user_metadata.password_reset_required) {
        console.log("Ouverture du dialogue de changement de mot de passe (première connexion ou reset)");
        setIsSettingsDialogOpen(true);
      }
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start justify-between mb-8">
            <div className="flex-grow">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Extranet Technique</h1>
              <p className="text-gray-600">
                Gestão de intervenções técnicas e relatórios.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSettingsDialogOpen(true)}
                title="Paramètres du compte"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout} 
                className="ml-2"
              >
                <LogOut className="mr-2 h-4 w-4" /> Déconnexion
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="new">Novos Ordens</TabsTrigger>
              <TabsTrigger value="ongoing">Ordens em Curso</TabsTrigger>
              <TabsTrigger value="completed">Ordens Passados</TabsTrigger>
            </TabsList>
            
            <TabsContent value="new">
              <ServiceOrdersList
                title="Novos Ordens de Serviço"
                description="Ordens de serviço que aguardam sua atenção"
                orders={[]} // We'll implement this later
              />
            </TabsContent>
            
            <TabsContent value="ongoing">
              <ServiceOrdersList
                title="Ordens em Curso"
                description="Ordens de serviço em andamento"
                orders={[]} // We'll implement this later
              />
            </TabsContent>
            
            <TabsContent value="completed">
              <ServiceOrdersList
                title="Ordens Passados"
                description="Histórico de ordens de serviço completadas"
                orders={[]} // We'll implement this later
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <UserPasswordSettingsDialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
        isRequired={user?.user_metadata?.first_login || user?.user_metadata?.password_reset_required}
      />
      
      <Footer />
    </div>
  );
};

export default ExtranetTechnique;
