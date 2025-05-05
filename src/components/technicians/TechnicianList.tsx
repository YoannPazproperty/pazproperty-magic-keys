
import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { TechnicianListProps } from './types';

export const TechnicianList: React.FC<TechnicianListProps> = ({
  technicians,
  onEdit,
  onDelete,
  onToggleStatus,
  showPasswords
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>
              <div className="flex items-center space-x-1">
                <span>Mot de passe</span>
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
                    <Button variant="ghost" size="icon" onClick={() => onToggleStatus(tech.id)}>
                      {tech.isActive ? (
                        <span className="text-red-500 text-xs">Désactiver</span>
                      ) : (
                        <span className="text-green-500 text-xs">Activer</span>
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(tech)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(tech)}>
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
  );
};
