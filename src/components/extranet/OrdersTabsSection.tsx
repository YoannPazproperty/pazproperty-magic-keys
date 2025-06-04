
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ProviderDeclarationList } from "./ProviderDeclarationList";
import { ServiceOrdersList } from "./ServiceOrdersList";

export function OrdersTabsSection() {
  return (
    <div className="mt-8">
      <Tabs defaultValue="declarations">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="declarations">Declarações</TabsTrigger>
          <TabsTrigger value="orders">Ordens de Serviço</TabsTrigger>
        </TabsList>
        <TabsContent value="declarations" className="mt-6">
          <ProviderDeclarationList />
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          <ServiceOrdersList 
            title="Ordens de Serviço" 
            description="Lista de ordens de serviço atribuídas" 
            orders={[]} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
