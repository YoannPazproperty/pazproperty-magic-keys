
import React from "react";
import { Button } from "../ui/button";
import { LogOut, User } from "lucide-react";

interface HeaderSectionProps {
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ 
  onOpenSettings,
  onLogout 
}) => {
  return (
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
          onClick={onOpenSettings}
          title="Paramètres du compte"
        >
          <User className="h-4 w-4" />
        </Button>
        <Button 
          variant="destructive" 
          onClick={onLogout} 
          className="ml-2"
        >
          <LogOut className="mr-2 h-4 w-4" /> Déconnexion
        </Button>
      </div>
    </div>
  );
};
