
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ServiceProvider } from "@/services/types";
import { restoreProvider } from "@/services/providers/providerArchiveQueries";
import { toast } from "sonner";
import { format } from "date-fns";

interface ArchivedProvidersListProps {
  providers: ServiceProvider[];
  isLoading: boolean;
  onRefresh: () => void;
  onRestoreSuccess: () => void;
}

export function ArchivedProvidersList({ 
  providers, 
  isLoading, 
  onRefresh, 
  onRestoreSuccess 
}: ArchivedProvidersListProps) {
  
  const handleRestore = async (provider: ServiceProvider) => {
    try {
      const success = await restoreProvider(provider.id);
      if (success) {
        toast.success("Prestador restaurado com sucesso");
        onRefresh();
        onRestoreSuccess();
      } else {
        toast.error("Erro ao restaurar prestador");
      }
    } catch (error) {
      console.error("Error restoring provider:", error);
      toast.error("Erro ao restaurar prestador");
    }
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
    <div className="rounded-lg border bg-card">
      <div className="flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold">Prestadores Arquivados</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Tipo de Obras</TableHead>
            <TableHead>Nome do Gerente</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Data de Exclusão</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((provider) => (
            <TableRow key={provider.id}>
              <TableCell className="font-medium">{provider.empresa}</TableCell>
              <TableCell>{provider.tipo_de_obras}</TableCell>
              <TableCell>{provider.nome_gerente}</TableCell>
              <TableCell>
                {provider.email}
                {provider.telefone && <div className="text-sm text-muted-foreground">{provider.telefone}</div>}
              </TableCell>
              <TableCell>
                {provider.deleted_at && format(new Date(provider.deleted_at), 'dd/MM/yyyy HH:mm')}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRestore(provider)}
                >
                  <Undo2 className="h-4 w-4 mr-1" />
                  Restaurar
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {providers.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Nenhum prestador de serviços arquivado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
