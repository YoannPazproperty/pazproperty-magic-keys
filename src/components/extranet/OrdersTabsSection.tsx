
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceOrdersList } from "@/components/extranet/ServiceOrdersList";

export const OrdersTabsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState("new");
  
  return (
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
  );
};
