
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { CommercialContact } from "@/services/types";

interface ContactInfoTabProps {
  contact: CommercialContact;
  onContactUpdated: () => void;
}

export const ContactInfoTab = ({ contact }: ContactInfoTabProps) => {
  return (
    <div className="space-y-4 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>Détails du contact commercial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Nom</Label>
              <p className="text-lg">{contact.nome}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-lg">{contact.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Téléphone</Label>
              <p className="text-lg">{contact.telefone || "-"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Type</Label>
              <p className="text-lg">{contact.tipo}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message / Note</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{contact.mensagem}</p>
        </CardContent>
      </Card>
    </div>
  );
};
