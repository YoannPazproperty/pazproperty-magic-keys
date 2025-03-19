
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, LogOut } from "lucide-react";

// Les identifiants admin sont définis ici pour simplifier
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "pazproperty2024";

// Interface pour les déclarations
interface Declaration {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  issueType: string;
  description: string;
  urgency: string;
  status: "pending" | "in_progress" | "resolved";
  submittedAt: string;
}

// Exemple de données pour la démo
const mockDeclarations: Declaration[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "+351 912 345 678",
    property: "Avenida de Lisboa, 1",
    issueType: "plumbing",
    description: "Il y a une fuite d'eau dans la salle de bain principale.",
    urgency: "high",
    status: "in_progress",
    submittedAt: "2024-03-18T14:30:00Z",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "+351 923 456 789",
    property: "Rua do Comércio, 23",
    issueType: "electrical",
    description: "La prise électrique dans la cuisine ne fonctionne pas.",
    urgency: "medium",
    status: "pending",
    submittedAt: "2024-03-17T10:15:00Z",
  },
  {
    id: "3",
    name: "António Ferreira",
    email: "antonio.ferreira@email.com",
    phone: "+351 934 567 890",
    property: "Praça do Rossio, 45",
    issueType: "heating",
    description: "Le chauffage central ne chauffe pas correctement.",
    urgency: "medium",
    status: "pending",
    submittedAt: "2024-03-16T08:45:00Z",
  },
  {
    id: "4",
    name: "Sofia Lopes",
    email: "sofia.lopes@email.com",
    phone: "+351 945 678 901",
    property: "Rua Augusta, 78",
    issueType: "pest",
    description: "J'ai vu des cafards dans la cuisine à plusieurs reprises.",
    urgency: "low",
    status: "resolved",
    submittedAt: "2024-03-15T16:20:00Z",
  },
];

// Fonction utilitaire pour traduire les types de problèmes
const translateIssueType = (type: string): string => {
  const translations: Record<string, string> = {
    plumbing: "Encanamento",
    electrical: "Elétrico",
    appliance: "Eletrodomésticos",
    heating: "Aquecimento/Refrigeração",
    structural: "Estrutural",
    pest: "Pragas",
    other: "Outro",
  };
  return translations[type] || type;
};

// Fonction utilitaire pour traduire les niveaux d'urgence
const translateUrgency = (urgency: string): string => {
  const translations: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    emergency: "Emergência",
  };
  return translations[urgency] || urgency;
};

// Fonction utilitaire pour formater la date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [declarations, setDeclarations] = useState<Declaration[]>(mockDeclarations);
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est déjà authentifié
  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Gérer la connexion
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuthenticated", "true");
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans l'interface d'administration.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description: "Nom d'utilisateur ou mot de passe incorrect.",
      });
    }
  };

  // Gérer la déconnexion
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès.",
    });
  };

  // Afficher les détails d'une déclaration
  const viewDeclarationDetails = (declaration: Declaration) => {
    setSelectedDeclaration(declaration);
    setIsDetailOpen(true);
  };

  // Obtenir la couleur du badge en fonction du statut
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "in_progress":
        return "bg-blue-500 hover:bg-blue-600";
      case "resolved":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Traduire le statut
  const translateStatus = (status: string): string => {
    const translations: Record<string, string> = {
      pending: "Em espera",
      in_progress: "Em progresso",
      resolved: "Resolvido",
    };
    return translations[status] || status;
  };

  // Mise à jour du statut d'une déclaration
  const updateDeclarationStatus = (id: string, newStatus: Declaration["status"]) => {
    const updatedDeclarations = declarations.map(declaration => 
      declaration.id === id ? { ...declaration, status: newStatus } : declaration
    );
    setDeclarations(updatedDeclarations);
    
    if (selectedDeclaration && selectedDeclaration.id === id) {
      setSelectedDeclaration({ ...selectedDeclaration, status: newStatus });
    }
    
    toast({
      title: "Statut mis à jour",
      description: `La déclaration a été mise à jour avec le statut "${translateStatus(newStatus)}".`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4">
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Administration Pazproperty</CardTitle>
                  <CardDescription>
                    Connectez-vous pour accéder à l'interface d'administration.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium">
                        Nom d'utilisateur
                      </label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">
                        Mot de passe
                      </label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Se connecter
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Interface d'Administration</h1>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Déclarations des Locataires</CardTitle>
                  <CardDescription>
                    Liste de toutes les déclarations soumises par les locataires.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>Liste des déclarations récentes</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Locataire</TableHead>
                        <TableHead>Propriété</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Urgence</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {declarations.map((declaration) => (
                        <TableRow key={declaration.id}>
                          <TableCell className="font-medium">
                            {formatDate(declaration.submittedAt)}
                          </TableCell>
                          <TableCell>{declaration.name}</TableCell>
                          <TableCell>{declaration.property}</TableCell>
                          <TableCell>{translateIssueType(declaration.issueType)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                declaration.urgency === "emergency" || declaration.urgency === "high"
                                  ? "border-red-500 text-red-500"
                                  : declaration.urgency === "medium"
                                  ? "border-yellow-500 text-yellow-500"
                                  : "border-green-500 text-green-500"
                              }
                            >
                              {translateUrgency(declaration.urgency)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(declaration.status)}>
                              {translateStatus(declaration.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewDeclarationDetails(declaration)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> Voir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        {selectedDeclaration && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails de la déclaration</DialogTitle>
              <DialogDescription>
                Soumise le {formatDate(selectedDeclaration.submittedAt)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Informations du locataire</h3>
                <p><span className="font-medium">Nom:</span> {selectedDeclaration.name}</p>
                <p><span className="font-medium">Email:</span> {selectedDeclaration.email}</p>
                <p><span className="font-medium">Téléphone:</span> {selectedDeclaration.phone}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Informations du problème</h3>
                <p><span className="font-medium">Propriété:</span> {selectedDeclaration.property}</p>
                <p>
                  <span className="font-medium">Type:</span> {translateIssueType(selectedDeclaration.issueType)}
                </p>
                <p>
                  <span className="font-medium">Urgence:</span> {translateUrgency(selectedDeclaration.urgency)}
                </p>
                <p>
                  <span className="font-medium">Statut:</span>{" "}
                  <Badge className={getStatusBadgeColor(selectedDeclaration.status)}>
                    {translateStatus(selectedDeclaration.status)}
                  </Badge>
                </p>
              </div>
            </div>
            
            <div className="space-y-2 py-2">
              <h3 className="font-semibold">Description du problème</h3>
              <div className="bg-gray-50 p-3 rounded-md border">
                <p>{selectedDeclaration.description}</p>
              </div>
            </div>
            
            <div className="space-y-2 py-2">
              <h3 className="font-semibold">Mettre à jour le statut</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateDeclarationStatus(selectedDeclaration.id, "pending")}
                  className={selectedDeclaration.status === "pending" ? "bg-yellow-100" : ""}
                >
                  En attente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateDeclarationStatus(selectedDeclaration.id, "in_progress")}
                  className={selectedDeclaration.status === "in_progress" ? "bg-blue-100" : ""}
                >
                  En cours
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateDeclarationStatus(selectedDeclaration.id, "resolved")}
                  className={selectedDeclaration.status === "resolved" ? "bg-green-100" : ""}
                >
                  Résolu
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Admin;
