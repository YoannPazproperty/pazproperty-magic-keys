
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/auth";
import { UserPasswordSettingsDialog } from "@/components/extranet/UserPasswordSettingsDialog";
import { ProviderInfoCard } from "@/components/extranet/ProviderInfoCard";
import { useProviderDetails } from "@/hooks/useProviderDetails";
import { HeaderSection } from "@/components/extranet/HeaderSection";
import { OrdersTabsSection } from "@/components/extranet/OrdersTabsSection";
import { usePasswordSettingsState } from "@/components/extranet/usePasswordSettingsState";

const ExtranetTechnique = () => {
  const { signOut, user } = useAuth();
  const { providerDetails, loading: loadingProvider, error: providerError } = useProviderDetails();
  const passwordSettings = usePasswordSettingsState(user);
  
  console.log("Provider details in ExtranetTechnique:", providerDetails);
  console.log("Current user in ExtranetTechnique:", user);

  const handleLogout = async () => {
    try {
      console.log("Iniciando processo de logout...");
      await signOut();
      console.log("Logout realizado com sucesso");
    } catch (error) {
      console.error("Erro durante o logout:", error);
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
