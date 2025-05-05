
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEdit = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setFormDialogOpen(true);
  };

  const handleDelete = async (provider: ServiceProvider) => {
    setProviderToDelete(provider);
    setErrorMessage(null);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!providerToDelete) return;
    
    setIsDeleting(true);
    setErrorMessage(null);
    
    try {
      console.log(`Confirming deletion of provider: ${providerToDelete.empresa}`);
      const success = await deleteProvider(providerToDelete.id);
      
      if (success) {
        toast.success("Prestador excluído com sucesso");
        setDeleteDialogOpen(false);
        setProviderToDelete(null);
        onRefresh();
      } else {
        const consoleError = console.error;
        console.error = (...args) => {
          // Capture error messages about declarations
          const errorString = args.join(' ');
          if (errorString.includes('declarations') && !errorMessage) {
            setErrorMessage("Este prestador está associado a declarações. As associações foram removidas e você pode tentar excluir novamente.");
          }
          return consoleError.apply(console, args);
        };
        
        toast.error("Erro ao excluir prestador", {
          description: "Verifique os logs do console para mais detalhes."
        });
        console.error = consoleError;
      }
    } catch (error) {
      console.error("Exception during provider deletion:", error);
      toast.error("Erro ao excluir prestador", {
        description: "Ocorreu uma exceção durante a exclusão."
      });
    } finally {
      setIsDeleting(false);
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
              {errorMessage && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md">
                  {errorMessage}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setProviderToDelete(null);
              setErrorMessage(null);
            }} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
