
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { CommercialContact } from "@/services/types";
import { AffairesTab } from "./tabs/AffairesTab";
import { ContactInfoTab } from "./tabs/ContactInfoTab";

interface ContactDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string | null;
  onContactUpdated: () => void;
}

export const ContactDetailsDialog = ({
  isOpen,
  onClose,
  contactId,
  onContactUpdated
}: ContactDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState("infos");
  const [contact, setContact] = useState<CommercialContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContactDetails = async () => {
      if (!contactId) return;
      
      setIsLoading(true);
      try {
        // Import dynamically to avoid circular dependencies
        const { getContactById } = await import("@/services/contacts/contactQueries");
        const contactData = await getContactById(contactId);
        setContact(contactData);
      } catch (error) {
        console.error("Error fetching contact details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && contactId) {
      fetchContactDetails();
    } else {
      setContact(null);
    }
  }, [contactId, isOpen]);

  // Reset active tab when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("infos");
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? (
              <Skeleton className="h-8 w-1/3" />
            ) : (
              contact ? `Détails du contact : ${contact.nome}` : "Contact non trouvé"
            )}
          </DialogTitle>
        </DialogHeader>

        {contact ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="infos" className="flex-1">Informations du contact</TabsTrigger>
              <TabsTrigger value="affaires" className="flex-1">Affaires liées</TabsTrigger>
            </TabsList>
            
            <TabsContent value="infos">
              <ContactInfoTab contact={contact} onContactUpdated={onContactUpdated} />
            </TabsContent>
            
            <TabsContent value="affaires">
              <AffairesTab contactId={contact.id} contactName={contact.nome} />
            </TabsContent>
          </Tabs>
        ) : isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Contact non trouvé ou supprimé.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
