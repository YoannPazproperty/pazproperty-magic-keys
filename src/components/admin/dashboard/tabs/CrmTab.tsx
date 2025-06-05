import { useState, useEffect } from "react";
import { ContactsList } from "../../ContactsList";
import { toast } from "sonner";
import type { CommercialContact } from "../../../../services/types";

export const CrmTab = () => {
  const [contacts, setContacts] = useState<CommercialContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const { getContacts } = await import("../../../../services/contacts/contactQueries");
      const allContacts = await getContacts();
      console.log("Loaded contacts:", allContacts);
      setContacts(allContacts);
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast.error("Erreur lors du chargement des contacts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContactsList 
      contacts={contacts} 
      isLoading={isLoading} 
      onRefresh={loadContacts}
    />
  );
};
