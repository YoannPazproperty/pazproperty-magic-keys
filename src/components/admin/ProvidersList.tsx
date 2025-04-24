
import { useState } from "react";
import { ServiceProviderFormDialog } from "./ServiceProviderFormDialog";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ServiceProvider } from "@/services/types";
import { deleteProvider } from "@/services/providers/providerQueries";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProvidersListProps {
  providers: ServiceProvider[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ProvidersList({ providers, isLoading, onRefresh }: ProvidersListProps) {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [providerToDelete, setProviderToDelete] = useState<ServiceProvider | null>(null);

  const handleEdit = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setFormDialogOpen(true);
  };

  const handleDelete = async (provider: ServiceProvider) => {
    setProviderToDelete(provider);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!providerToDelete) return;

    const success = await deleteProvider(providerToDelete.id);
    if (success) {
      toast.success("Prestador excluído com sucesso");
      onRefresh();
    } else {
      toast.error("Erro ao excluir prestador");
    }
    setDeleteDialogOpen(false);
    setProviderToDelete(null);
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
      <div className="rounded-lg border bg-card">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-semibold">Prestadores de Serviços</h2>
          <Button onClick={() => setFormDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Prestador
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Tipo de Obras</TableHead>
              <TableHead>Nome do Gerente</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Cidade</TableHead>
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
                <TableCell>{provider.cidade || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(provider)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(provider)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {providers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhum prestador de serviços cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ServiceProviderFormDialog
        isOpen={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setSelectedProvider(null);
        }}
        onSuccess={() => {
          setFormDialogOpen(false);
          setSelectedProvider(null);
          onRefresh();
        }}
        providerToEdit={selectedProvider}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o prestador "{providerToDelete?.empresa}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProviderToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
