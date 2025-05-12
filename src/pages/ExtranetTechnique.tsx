
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/auth";
import { UserPasswordSettingsDialog } from "@/components/extranet/UserPasswordSettingsDialog";
import { ProviderInfoCard } from "@/components/extranet/ProviderInfoCard";
import { useProviderDetails } from "@/hooks/useProviderDetails";
import { HeaderSection } from "@/components/extranet/HeaderSection";
import { OrdersTabsSection } from "@/components/extranet/OrdersTabsSection";
import { usePasswordSettingsState } from "@/components/extranet/usePasswordSettingsState";
import { toast } from "sonner";

const ExtranetTechnique = () => {
  const { signOut, user } = useAuth();
  const { providerDetails, loading: loadingProvider, error: providerError } = useProviderDetails();
  const passwordSettings = usePasswordSettingsState(user);
  
  console.log("Provider details in ExtranetTechnique:", providerDetails);
  console.log("Current user in ExtranetTechnique:", user);

  // Show a welcome toast when the page loads
  useEffect(() => {
    if (providerDetails && !loadingProvider) {
      toast.success(`Bienvenue, ${providerDetails.nome_gerente}`, {
        description: "Vous êtes connecté à l'extranet technique",
      });
    }
  }, [providerDetails, loadingProvider]);

  // Show error if provider details can't be loaded
  useEffect(() => {
    if (providerError && !loadingProvider) {
      toast.error("Erreur de chargement des données du prestataire", {
        description: "Veuillez réessayer ou contacter l'administrateur",
      });
    }
  }, [providerError, loadingProvider]);

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");
      toast.info("Déconnexion en cours...");
      await signOut();
      console.log("Logout successful");
      toast.success("Vous avez été déconnecté");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <HeaderSection 
            onOpenSettings={() => passwordSettings.setIsSettingsDialogOpen(true)}
            onLogout={handleLogout}
          />
          
          {/* Provider information card */}
          <ProviderInfoCard 
            provider={providerDetails}
            loading={loadingProvider}
            error={providerError}
          />
          
          <OrdersTabsSection />
        </div>
      </main>
      
      <UserPasswordSettingsDialog
        open={passwordSettings.isSettingsDialogOpen}
        onOpenChange={passwordSettings.handleDialogOpenChange}
        isRequired={passwordSettings.isPasswordChangeRequired}
        onPasswordChangeSuccess={passwordSettings.handlePasswordChangeSuccess}
      />
      
      <Footer />
    </div>
  );
};

export default ExtranetTechnique;
