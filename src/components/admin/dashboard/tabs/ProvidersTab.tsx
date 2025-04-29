
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProvidersList } from "@/components/admin/ProvidersList";
import { ArchivedProvidersList } from "@/components/admin/ArchivedProvidersList";
import { getProvidersList } from "@/services/providers/providerQueries";
import { getArchivedProvidersList } from "@/services/providers/providerArchiveQueries";
import { toast } from "sonner";
import type { ServiceProvider } from "@/services/types";

export const ProvidersTab = () => {
  const [activeProvidersTab, setActiveProvidersTab] = useState("active");
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [archivedProviders, setArchivedProviders] = useState<ServiceProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isLoadingArchivedProviders, setIsLoadingArchivedProviders] = useState(false);

  useEffect(() => {
    loadProviders();
    if (activeProvidersTab === "archived") {
      loadArchivedProviders();
    }
  }, [activeProvidersTab]);

  const loadProviders = async () => {
    setIsLoadingProviders(true);
    try {
      const allProviders = await getProvidersList();
      setProviders(allProviders);
    } catch (error) {
      console.error("Error loading providers:", error);
      toast.error("Erro ao carregar prestadores");
    } finally {
      setIsLoadingProviders(false);
    }
  };
  
  const loadArchivedProviders = async () => {
    setIsLoadingArchivedProviders(true);
    try {
      const archivedProvs = await getArchivedProvidersList();
      setArchivedProviders(archivedProvs);
    } catch (error) {
      console.error("Error loading archived providers:", error);
      toast.error("Erro ao carregar prestadores arquivados");
    } finally {
      setIsLoadingArchivedProviders(false);
    }
  };

  const handleProvidersTabChange = (value: string) => {
    setActiveProvidersTab(value);
  };

  return (
    <Tabs value={activeProvidersTab} onValueChange={handleProvidersTabChange} className="w-full">
      <TabsList className="inline-flex mb-4">
        <TabsTrigger value="active">Ativos</TabsTrigger>
        <TabsTrigger value="archived">Arquivados</TabsTrigger>
      </TabsList>
      
      <TabsContent value="active">
        <ProvidersList 
          providers={providers}
          isLoading={isLoadingProviders}
          onRefresh={loadProviders}
        />
      </TabsContent>
      
      <TabsContent value="archived">
        <ArchivedProvidersList 
          providers={archivedProviders}
          isLoading={isLoadingArchivedProviders}
          onRefresh={loadArchivedProviders}
          onRestoreSuccess={loadProviders}
        />
      </TabsContent>
    </Tabs>
  );
};
