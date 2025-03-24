
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TechnicienManager from "@/components/TechnicienManager";
import { getMonday5BoardStatus } from "@/services/monday";

const ExtranetTechnique = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [apiStatus, setApiStatus] = useState({ valid: false, message: "" });

  useEffect(() => {
    // Check API configuration status
    const checkApiStatus = async () => {
      const status = await getMonday5BoardStatus();
      setApiStatus(status);
    };
    
    checkApiStatus();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Extranet Technique</h1>
              <p className="text-gray-600">
                Gestão de intervenções técnicas e relatórios.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center">
              <div className={`h-2 w-2 rounded-full mr-2 ${apiStatus.valid ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {apiStatus.valid ? 'Monday.com conectado' : 'Monday.com desconectado'}
              </span>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="interventions">Intervenções</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Dashboard do Técnico</h2>
                <p>Bem-vindo à área do técnico. Aqui você pode visualizar e gerenciar suas intervenções.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="interventions" className="space-y-4">
              <TechnicienManager />
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-4">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Relatórios de Intervenção</h2>
                <p>Visualize e gerencie seus relatórios de intervenção técnica.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ExtranetTechnique;
