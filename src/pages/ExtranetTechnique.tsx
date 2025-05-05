
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/auth";
import TechnicienManager from "@/components/TechnicienManager";
import { ServiceOrdersList } from "@/components/extranet/ServiceOrdersList";
import { UserPasswordSettingsDialog } from "@/components/extranet/UserPasswordSettingsDialog";
import { ProviderInfoCard } from "@/components/extranet/ProviderInfoCard";
import { useProviderDetails } from "@/hooks/useProviderDetails";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ExtranetTechnique = () => {
  const [activeTab, setActiveTab] = useState("new");
  const { signOut, user } = useAuth();
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isPasswordChangeRequired, setIsPasswordChangeRequired] = useState(false);
  const { providerDetails, loading: loadingProvider, error: providerError } = useProviderDetails();
  
  console.log("Provider details in ExtranetTechnique:", providerDetails);

  // Check if user hasn't set a password yet
  useEffect(() => {
    // If user just registered and hasn't set a password yet
    // Or if user is coming from a password reset
    if (user && user.user_metadata) {
      const metadata = user.user_metadata;
      if (metadata.first_login || metadata.password_reset_required) {
        console.log("Password change required based on metadata:", metadata);
        setIsPasswordChangeRequired(true);
        setIsSettingsDialogOpen(true);
        
        // Display a toast message to inform the user
        if (metadata.first_login) {
          toast.info("Bem-vindo ao Extranet Técnica!", {
            description: "Por favor, defina uma nova senha para continuar."
          });
        } else {
          toast.info("Redefinição de senha necessária", {
            description: "Por favor, atualize sua senha para continuar."
          });
        }
      }
    }
  }, [user]);
  
  // Handle dialog close attempt
  const handleDialogOpenChange = (open: boolean) => {
    // If password change is required, don't allow closing the dialog
    if (isPasswordChangeRequired && !open) {
      toast.warning("Alteração de senha necessária", {
        description: "Você deve alterar sua senha antes de continuar."
      });
      return;
    }
    
    setIsSettingsDialogOpen(open);
  };
  
  // Handle successful password change
  const handlePasswordChangeSuccess = async () => {
    try {
      // Update user metadata to remove password reset flags
      await supabase.auth.updateUser({
        data: {
          first_login: false,
          password_reset_required: false,
          password_reset_at: new Date().toISOString()
        }
      });
      
      setIsPasswordChangeRequired(false);
      setIsSettingsDialogOpen(false);
      
      toast.success("Senha alterada com sucesso", {
        description: "Você agora pode acessar todas as funcionalidades."
      });
    } catch (error) {
      console.error("Error updating user metadata after password change:", error);
      // Allow the user to continue even if metadata update fails
      setIsPasswordChangeRequired(false);
      setIsSettingsDialogOpen(false);
    }
  };

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
          <div className="flex flex-col md:flex-row items-start justify-between mb-4">
            <div className="flex-grow">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Extranet Technique</h1>
              <p className="text-gray-600 mb-4">
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
          
          {/* Provider information card - now with better visibility */}
          <ProviderInfoCard 
            provider={providerDetails}
            loading={loadingProvider}
            error={providerError}
          />
          
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
        onOpenChange={handleDialogOpenChange}
        isRequired={isPasswordChangeRequired}
        onPasswordChangeSuccess={handlePasswordChangeSuccess}
      />
      
      <Footer />
    </div>
  );
};

export default ExtranetTechnique;
