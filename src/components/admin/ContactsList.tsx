
import { useState } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Trash, Eye } from "lucide-react";
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
import { toast } from "sonner";
import type { CommercialContact } from "@/services/types";
import { deleteContact } from "@/services/contacts/contactQueries";
import { ContactFormDialog } from "./ContactFormDialog";
import { ContactDetailsDialog } from "./contact-details/ContactDetailsDialog";

interface ContactsListProps {
  contacts: CommercialContact[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const ContactsList = ({ contacts, isLoading, onRefresh }: ContactsListProps) => {
  const [contactToEdit, setContactToEdit] = useState<CommercialContact | undefined>();
  const [contactToDelete, setContactToDelete] = useState<CommercialContact | undefined>();
  const [contactToView, setContactToView] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const handleAddNew = () => {
    setContactToEdit(undefined);
    setIsFormOpen(true);
  };
  
  const handleEdit = (contact: CommercialContact) => {
    setContactToEdit(contact);
    setIsFormOpen(true);
  };

  const handleView = (contactId: string) => {
    setContactToView(contactId);
    setIsDetailsOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;
    
    try {
      const success = await deleteContact(contactToDelete.id);
      
      if (success) {
        toast.success("Contato excluído com sucesso");
        onRefresh();
      } else {
        toast.error("Erro ao excluir contato");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Erro ao excluir contato");
    } finally {
      setContactToDelete(undefined);
    }
  };
  
  const handleFormClose = () => {
    setIsFormOpen(false);
    setContactToEdit(undefined);
  };
  
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setContactToEdit(undefined);
    onRefresh();
  };

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setContactToView(null);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Carregando contatos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Contactos Comerciais</h2>
        <Button onClick={handleAddNew}>Adicionar Contato</Button>
      </div>
      
      {contacts.length === 0 ? (
        <div className="rounded-lg border bg-card p-6">
          <p className="text-muted-foreground">Nenhum contato encontrado.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.nome}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.telefone || '-'}</TableCell>
                  <TableCell>{contact.tipo}</TableCell>
                  <TableCell className="max-w-xs truncate">{contact.mensagem}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(contact.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(contact.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(contact)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setContactToDelete(contact)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Contact Form Dialog */}
      <ContactFormDialog 
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        contactToEdit={contactToEdit}
      />

      {/* Contact Details Dialog */}
      <ContactDetailsDialog
        isOpen={isDetailsOpen}
        onClose={handleDetailsClose}
        contactId={contactToView}
        onContactUpdated={onRefresh}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!contactToDelete} onOpenChange={(open) => !open && setContactToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir contato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o contato {contactToDelete?.nome}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
