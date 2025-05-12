
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getStatusBadgeColor, translateStatus } from "@/utils/translationUtils";
import { toast } from "sonner";
import { Declaration } from "@/services/types";
import { DeclarationDetailsDialog } from "../admin/DeclarationDetailsDialog";
import { useProviderDeclarations } from "@/hooks/useProviderDeclarations";

export function ProviderDeclarationList() {
  const { declarations, isLoading, refresh } = useProviderDeclarations();
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleOpenDetails = (declaration: Declaration) => {
    setSelectedDeclaration(declaration);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedDeclaration(null);
  };

  const handleStatusUpdate = async (id: string, status: Declaration["status"]) => {
    try {
      // Mock status update for now - this will be replaced with actual service call
      toast.success("Estado atualizado com sucesso");
      // Refresh declarations to show the updated status
      refresh();
    } catch (error) {
      console.error('Exception updating status:', error);
      toast.error("Erro durante a atualização do estado");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Minhas Declarações</CardTitle>
        <Button size="sm" variant="outline" onClick={refresh}>
          Refrescar
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Loading state
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : declarations.length === 0 ? (
          // No declarations found
          <div className="text-center py-8 text-muted-foreground">
            Não tem declarações atribuídas.
          </div>
        ) : (
          // Declarations table
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Problema</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {declarations.map(declaration => (
                <TableRow key={declaration.id}>
                  <TableCell className="font-medium">{declaration.id}</TableCell>
                  <TableCell>{declaration.name}</TableCell>
                  <TableCell>{declaration.issueType}</TableCell>
                  <TableCell>{formatDate(declaration.submittedAt)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(declaration.status as string)}>
                      {translateStatus(declaration.status as string)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleOpenDetails(declaration)}
                    >
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Declaration details dialog */}
        <DeclarationDetailsDialog 
          declaration={selectedDeclaration}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          onStatusUpdate={handleStatusUpdate}
        />
      </CardContent>
    </Card>
  );
}
