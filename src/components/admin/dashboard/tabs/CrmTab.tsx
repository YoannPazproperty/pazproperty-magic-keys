
import { useState, useEffect } from "react";
import { ContactsList } from "@/components/admin/ContactsList";
import { getContactsList } from "@/services/contacts/contactQueries";
import { toast } from "sonner";
import type { CommercialContact } from "@/services/types";

export const CrmTab = () => {
  const [contacts, setContacts] = useState<CommercialContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const allContacts = await getContactsList();
      setContacts(allContacts);
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast.error("Erro ao carregar contatos");
    } finally {
      setIsLoadingContacts(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-card p-6 mb-4">
        <h2 className="text-2xl font-semibold mb-4">CRM</h2>
        <p className="text-muted-foreground mb-4">Gerencie seus contatos comerciais aqui.</p>
      </div>
      <ContactsList 
        contacts={contacts}
        isLoading={isLoadingContacts}
        onRefresh={loadContacts}
      />
    </>
  );
};
