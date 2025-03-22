
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from "sonner";
import technicienService, { Technician } from '@/services/technicienService';

const TechnicienManager: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    loadTechnicians();
  }, []);
  
  const loadTechnicians = () => {
    const techs = technicienService.getAll();
    setTechnicians(techs);
  };
  
  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setSpecialty('');
    setIsActive(true);
    setSelectedTechnician(null);
  };
  
  const openAddDialog = () => {
    resetForm();
    setFormMode('add');
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (technician: Technician) => {
    setName(technician.name);
    setEmail(technician.email);
    setPassword(technician.password);
    setPhone(technician.phone || '');
    setSpecialty(technician.specialty || '');
    setIsActive(technician.isActive);
    setSelectedTechnician(technician.id);
    setFormMode('edit');
    setIsDialogOpen(true);
  };
  
  const openDeleteDialog = (id: string) => {
    setSelectedTechnician(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formMode === 'add') {
        technicienService.add({
          name,
          email,
          password,
          phone,
          specialty,
          isActive
        });
        toast.success("Technicien ajouté avec succès");
      } else if (formMode === 'edit' && selectedTechnician) {
        technicienService.update(selectedTechnician, {
          name,
          email,
          password,
          phone,
          specialty,
          isActive
        });
        toast.success("Technicien mis à jour avec succès");
      }
      
      loadTechnicians();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Erreur", { description: error.message });
      } else {
        toast.error("Une erreur s'est produite");
      }
    }
  };
  
  const handleDelete = () => {
    if (selectedTechnician) {
      const success = technicienService.delete(selectedTechnician);
      
      if (success) {
        toast.success("Technicien supprimé avec succès");
        loadTechnicians();
      } else {
        toast.error("Erreur lors de la suppression");
      }
      
      setIsDeleteDialogOpen(false);
      setSelectedTechnician(null);
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
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
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
          <Button onClick={openAddDialog}>
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter un prestataire
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border mb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Mot de passe</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicians.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      Aucun prestataire technique trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  technicians.map((tech) => (
                    <TableRow key={tech.id}>
                      <TableCell className="font-medium">{tech.name}</TableCell>
                      <TableCell>{tech.email}</TableCell>
                      <TableCell>
                        {showPasswords ? tech.password : '••••••••'}
                      </TableCell>
                      <TableCell>{tech.specialty || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          tech.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tech.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(tech.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => toggleTechnicianStatus(tech.id)}>
                            {tech.isActive ? (
                              <span className="text-red-500 text-xs">Désactiver</span>
                            ) : (
                              <span className="text-green-500 text-xs">Activer</span>
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(tech)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(tech.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Total: {technicians.length} prestataires
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPasswords(!showPasswords)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'add' ? 'Ajouter un prestataire' : 'Modifier le prestataire'}
            </DialogTitle>
            <DialogDescription>
              {formMode === 'add' 
                ? 'Créez un nouveau compte prestataire technique.'
                : 'Modifiez les informations du prestataire technique.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="specialty">Spécialité</Label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plomberie">Plomberie</SelectItem>
                    <SelectItem value="électricité">Électricité</SelectItem>
                    <SelectItem value="chauffage">Chauffage</SelectItem>
                    <SelectItem value="serrurerie">Serrurerie</SelectItem>
                    <SelectItem value="menuiserie">Menuiserie</SelectItem>
                    <SelectItem value="peinture">Peinture</SelectItem>
                    <SelectItem value="maçonnerie">Maçonnerie</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  id="active-status"
                />
                <Label htmlFor="active-status">Compte actif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {formMode === 'add' ? 'Ajouter' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce prestataire technique ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TechnicienManager;
