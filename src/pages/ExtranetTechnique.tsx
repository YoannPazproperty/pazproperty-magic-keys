
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import TechnicienRapportForm from '@/components/TechnicienRapportForm';
import { Clock, CheckCircle2, AlertTriangle, FileCheck } from 'lucide-react';

const ExtranetTechnique = () => {
  const [selectedIntervention, setSelectedIntervention] = useState<number | null>(null);
  
  // Données fictives pour démonstration
  const interventions = [
    { 
      id: 1, 
      date: '2023-06-10', 
      client: 'Marie Durand', 
      adresse: '15 rue des Lilas, 75011 Paris', 
      telephone: '06 12 34 56 78', 
      email: 'marie.durand@email.com',
      probleme: 'Plomberie', 
      description: 'Fuite sous l\'évier de la cuisine', 
      statut: 'en_attente' 
    },
    { 
      id: 2, 
      date: '2023-06-09', 
      client: 'Jean Martin', 
      adresse: '8 avenue Victor Hugo, 75016 Paris', 
      telephone: '07 23 45 67 89', 
      email: 'jean.martin@email.com',
      probleme: 'Électricité', 
      description: 'Prise électrique qui ne fonctionne pas dans le salon', 
      statut: 'en_cours' 
    },
    { 
      id: 3, 
      date: '2023-06-08', 
      client: 'Sophie Petit', 
      adresse: '22 boulevard Haussmann, 75009 Paris', 
      telephone: '06 98 76 54 32', 
      email: 'sophie.petit@email.com',
      probleme: 'Plomberie', 
      description: 'Chasse d\'eau qui fuit continuellement', 
      statut: 'termine' 
    }
  ];
  
  const renderStatutBadge = (statut: string) => {
    switch(statut) {
      case 'en_attente':
        return (
          <div className="flex items-center gap-1 text-amber-500">
            <Clock className="h-4 w-4" />
            <span>En attente</span>
          </div>
        );
      case 'en_cours':
        return (
          <div className="flex items-center gap-1 text-blue-500">
            <AlertTriangle className="h-4 w-4" />
            <span>En cours</span>
          </div>
        );
      case 'termine':
        return (
          <div className="flex items-center gap-1 text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            <span>Terminé</span>
          </div>
        );
      default:
        return <span>{statut}</span>;
    }
  };
  
  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Extranet Prestataire Technique</h1>
      
      <Tabs defaultValue="interventions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interventions">Mes Interventions</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>
        
        <TabsContent value="interventions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Interventions à réaliser</CardTitle>
              <CardDescription>
                Liste des interventions en attente ou en cours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Problème</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interventions.filter(i => i.statut !== 'termine').map(intervention => (
                    <TableRow key={intervention.id}>
                      <TableCell>{intervention.date}</TableCell>
                      <TableCell>{intervention.client}</TableCell>
                      <TableCell>{intervention.probleme}</TableCell>
                      <TableCell>{renderStatutBadge(intervention.statut)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedIntervention(intervention.id)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {selectedIntervention && (
            <InterventionDetails 
              intervention={interventions.find(i => i.id === selectedIntervention)!} 
              onClose={() => setSelectedIntervention(null)}
            />
          )}
        </TabsContent>
        
        <TabsContent value="historique" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des interventions</CardTitle>
              <CardDescription>
                Liste des interventions terminées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Problème</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interventions.filter(i => i.statut === 'termine').map(intervention => (
                    <TableRow key={intervention.id}>
                      <TableCell>{intervention.date}</TableCell>
                      <TableCell>{intervention.client}</TableCell>
                      <TableCell>{intervention.probleme}</TableCell>
                      <TableCell>{renderStatutBadge(intervention.statut)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedIntervention(intervention.id)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface InterventionDetailsProps {
  intervention: {
    id: number;
    date: string;
    client: string;
    adresse: string;
    telephone: string;
    email: string;
    probleme: string;
    description: string;
    statut: string;
  };
  onClose: () => void;
}

const InterventionDetails: React.FC<InterventionDetailsProps> = ({ intervention, onClose }) => {
  const [showRapportForm, setShowRapportForm] = useState(false);
  
  return (
    <Card className="mt-6">
      <CardHeader className="bg-muted/50">
        <div className="flex justify-between items-center">
          <CardTitle>Détails de l'intervention #{intervention.id}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>Fermer</Button>
        </div>
        <CardDescription>
          {intervention.date} - {renderStatutBadge(intervention.statut)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Informations client</h3>
            <ul className="space-y-2">
              <li><strong>Nom:</strong> {intervention.client}</li>
              <li><strong>Adresse:</strong> {intervention.adresse}</li>
              <li><strong>Téléphone:</strong> {intervention.telephone}</li>
              <li><strong>Email:</strong> {intervention.email}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Problème signalé</h3>
            <p><strong>Type:</strong> {intervention.probleme}</p>
            <p><strong>Description:</strong> {intervention.description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.href = `tel:${intervention.telephone}`}>
            Appeler
          </Button>
          <Button variant="outline" onClick={() => window.location.href = `mailto:${intervention.email}`}>
            Envoyer un email
          </Button>
        </div>
        
        {intervention.statut !== 'termine' && (
          <Button onClick={() => setShowRapportForm(true)}>
            <FileCheck className="mr-2 h-4 w-4" />
            Soumettre un rapport
          </Button>
        )}
      </CardFooter>
      
      {showRapportForm && (
        <div className="p-6 border-t">
          <TechnicienRapportForm 
            interventionId={intervention.id} 
            onSubmitSuccess={() => {
              setShowRapportForm(false);
              onClose();
            }}
            onCancel={() => setShowRapportForm(false)}
          />
        </div>
      )}
    </Card>
  );
};

// Helper pour afficher les badges de statut
const renderStatutBadge = (statut: string) => {
  switch(statut) {
    case 'en_attente':
      return (
        <div className="flex items-center gap-1 text-amber-500">
          <Clock className="h-4 w-4" />
          <span>En attente</span>
        </div>
      );
    case 'en_cours':
      return (
        <div className="flex items-center gap-1 text-blue-500">
          <AlertTriangle className="h-4 w-4" />
          <span>En cours</span>
        </div>
      );
    case 'termine':
      return (
        <div className="flex items-center gap-1 text-green-500">
          <CheckCircle2 className="h-4 w-4" />
          <span>Terminé</span>
        </div>
      );
    default:
      return <span>{statut}</span>;
  }
};

export default ExtranetTechnique;
