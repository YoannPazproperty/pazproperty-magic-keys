
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, UserCog, UserX } from "lucide-react";
import { toast } from "sonner";
import { AdminUserFormDialog } from "../../users/AdminUserFormDialog";
import { getCompanyUsers } from "@/services/admin/companyUserService";

interface CompanyUser {
  id: string;
  user_id: string;
  email: string;
  name: string;
  level: string;
  created_at: string;
}

export const AdminUsersTab = () => {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await getCompanyUsers();
      if (result.success) {
        setUsers(result.users || []);
      } else {
        toast.error("Impossible de récupérer les utilisateurs", {
          description: result.message || "Une erreur est survenue"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      toast.error("Une erreur est survenue lors de la récupération des utilisateurs");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const handleCreateSuccess = () => {
    setDialogOpen(false);
    loadUsers();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Gestion des Employés PazProperty</h2>
          <p className="text-gray-500">
            Créez et gérez les comptes employés avec des adresses @pazproperty.pt
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouvel Employé
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs PazProperty</CardTitle>
          <CardDescription>
            Employés avec accès à l'interface d'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                      {isLoading ? 
                        "Chargement des utilisateurs..." : 
                        "Aucun utilisateur trouvé"}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.level === 'admin' ? "default" : "outline"}>
                          {user.level === 'admin' ? (
                            <span className="flex items-center">
                              <UserCog className="h-3 w-3 mr-1" />
                              Admin
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <UserX className="h-3 w-3 mr-1" />
                              User
                            </span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Voir détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour créer un nouvel utilisateur */}
      <AdminUserFormDialog 
        isOpen={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};
