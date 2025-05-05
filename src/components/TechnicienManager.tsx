
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { Technician } from '@/services/technicienService';
import { useTechnicians } from './technicians/useTechnicians';
import { TechnicianList } from './technicians/TechnicianList';
import { TechnicianFormDialog } from './technicians/TechnicianFormDialog';
import { DeleteTechnicianDialog } from './technicians/DeleteTechnicianDialog';

const TechnicienManager: React.FC = () => {
  const {
    technicians,
    isLoading,
    showPasswords,
    setShowPasswords,
    loadTechnicians,
    toggleTechnicianStatus,
    deleteTechnician
  } = useTechnicians();
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleOpenAddDialog = () => {
    setSelectedTechnician(null);
    setFormDialogOpen(true);
  };
  
  const handleEdit = (technician: Technician) => {
    setSelectedTechnician(technician);
    setFormDialogOpen(true);
  };
  
  const handleDelete = (technician: Technician) => {
    setSelectedTechnician(technician);
    setErrorMessage(null);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedTechnician) return;
    
    setIsDeleting(true);
    setErrorMessage(null);
    
    try {
      const success = await deleteTechnician(selectedTechnician.id);
      
      if (success) {
        setDeleteDialogOpen(false);
        setSelectedTechnician(null);
      } else {
        setErrorMessage("Erro ao excluir o prestador. Tente novamente.");
      }
    } catch (error) {
      console.error("Exception during technician deletion:", error);
      setErrorMessage("Uma exceção ocorreu durante a exclusão.");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleToggleShowPasswords = () => {
    setShowPasswords(!showPasswords);
  };
  
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestion des Prestataires Techniques</CardTitle>
            <CardDescription>
              Ajoutez, modifiez ou supprimez des prestataires techniques
            </CardDescription>
          </div>
          <Button onClick={handleOpenAddDialog}>
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter un prestataire
          </Button>
        </CardHeader>
        <CardContent>
          <TechnicianList
            technicians={technicians}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={toggleTechnicianStatus}
            showPasswords={showPasswords}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Total: {technicians.length} prestataires
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleToggleShowPasswords}
            >
              {showPasswords ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Masquer les mots de passe
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Afficher les mots de passe
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <TechnicianFormDialog
        isOpen={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedTechnician(null);
        }}
        onSuccess={() => {
          setFormDialogOpen(false);
          setSelectedTechnician(null);
          loadTechnicians();
        }}
        technicianToEdit={selectedTechnician}
      />

      <DeleteTechnicianDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedTechnician(null);
          setErrorMessage(null);
        }}
        onConfirm={confirmDelete}
        technicianName={selectedTechnician?.name}
        isDeleting={isDeleting}
        errorMessage={errorMessage}
      />
    </>
  );
};

export default TechnicienManager;
