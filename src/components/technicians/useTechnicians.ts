
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import technicienService, { Technician } from '@/services/technicienService';

export const useTechnicians = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState(false);
  
  const loadTechnicians = () => {
    try {
      const techs = technicienService.getAll();
      setTechnicians(techs);
    } catch (error) {
      console.error('Error loading technicians:', error);
      toast.error('Error loading technicians');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleTechnicianStatus = (id: string) => {
    const updated = technicienService.toggleActive(id);
    
    if (updated) {
      toast.success(
        updated.isActive 
          ? "Technicien activé avec succès" 
          : "Technicien désactivé avec succès"
      );
      loadTechnicians();
    }
  };

  const deleteTechnician = async (id: string): Promise<boolean> => {
    try {
      const success = technicienService.delete(id);
      
      if (success) {
        toast.success("Technicien supprimé avec succès");
        loadTechnicians();
        return true;
      } else {
        toast.error("Erreur lors de la suppression");
        return false;
      }
    } catch (error) {
      console.error("Error deleting technician:", error);
      return false;
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  return {
    technicians,
    isLoading,
    showPasswords,
    setShowPasswords,
    loadTechnicians,
    toggleTechnicianStatus,
    deleteTechnician
  };
};
