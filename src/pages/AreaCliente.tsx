
import { useState, useEffect } from "react";
import { saveMondayConfig } from "@/services/storageService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SuccessMessage from "@/components/client-area/SuccessMessage";
import DeclarationForm from "@/components/client-area/DeclarationForm";
import ContactInformation from "@/components/client-area/ContactInformation";

// Ensure we have a default Monday configuration for testing
// This is just for development - in production this would be set in the admin panel
(() => {
  // Only set default config if none exists yet
  if (!localStorage.getItem('mondayApiKey')) {
    console.log("Setting default Monday.com configuration for testing");
    saveMondayConfig('your_monday_api_key_here', '1861342035');
  }
})();

const AreaCliente = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSuccessfulSubmission = () => {
    setIsSuccess(true);
  };

  const handleNewDeclaration = () => {
    setIsSuccess(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Área de Cliente</h1>
          <p className="text-gray-600 mb-8">
            Bem-vindo à sua área de cliente. Utilize o formulário abaixo para declarar qualquer problema ou necessidade relacionada ao seu imóvel.
          </p>
          
          {isSuccess ? (
            <SuccessMessage onNewDeclaration={handleNewDeclaration} />
          ) : (
            <DeclarationForm onSuccess={handleSuccessfulSubmission} />
          )}
          
          <ContactInformation />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AreaCliente;
