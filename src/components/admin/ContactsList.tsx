
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CommercialContact } from "@/services/types";

interface ContactsListProps {
  contacts: CommercialContact[];
  isLoading: boolean;
}

export const ContactsList = ({ contacts, isLoading }: ContactsListProps) => {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Carregando contatos...</p>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Nenhum contato encontrado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Mensagem</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>{contact.nome}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>{contact.telefone || '-'}</TableCell>
              <TableCell>{contact.tipo}</TableCell>
              <TableCell className="max-w-md truncate">{contact.mensagem}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(contact.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
