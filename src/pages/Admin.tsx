import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, LogOut, Settings, Loader2, Bell } from "lucide-react";
import declarationService, { 
  Declaration, 
  setupNotificationWebhook, 
  getWebhookIntegrations, 
  deleteWebhook, 
  getNotificationPreferences,
  saveNotificationPreferences,
  NotificationPreference
} from "@/services/declarationService";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "pazproperty2024";

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

const translateUrgency = (urgency: string): string => {
  const translations: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    emergency: "Emergência",
  };
  return translations[urgency] || urgency;
};

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
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [selectedDeclaration, setSelectedDeclaration] = useState<Declaration | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [mondayApiKey, setMondayApiKey] = useState<string>("");
  const [mondayBoardId, setMondayBoardId] = useState<string>("");
  const [mondayConfigStatus, setMondayConfigStatus] = useState<{valid: boolean, message: string} | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("declarations");
  
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState<boolean>(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference>({
    email: true,
    sms: false,
    push: false
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDeclarations();
      loadMondayConfig();
      loadNotificationPreferences();
      loadWebhooks();
    }
  }, [isAuthenticated]);

  const loadDeclarations = () => {
    const allDeclarations = declarationService.getAll();
    setDeclarations(allDeclarations);
  };
  
  const loadMondayConfig = () => {
    const config = declarationService.getMondayConfig();
    setMondayApiKey(config.apiKey);
    setMondayBoardId(config.boardId);
    
    if (config.apiKey && config.boardId) {
      validateMondayConfig(config.apiKey, config.boardId);
    }
  };
  
  const loadNotificationPreferences = () => {
    const preferences = getNotificationPreferences();
    setNotificationPreferences(preferences);
  };
  
  const loadWebhooks = async () => {
    if (!mondayApiKey || !mondayBoardId) return;
    
    setIsLoadingWebhooks(true);
    try {
      const result = await getWebhookIntegrations();
      if (result.success) {
        setWebhooks(result.webhooks || []);
      } else {
        console.error("Failed to load webhooks:", result.message);
      }
    } catch (error) {
      console.error("Error loading webhooks:", error);
    } finally {
      setIsLoadingWebhooks(false);
    }
  };
  
  const validateMondayConfig = async (apiKey: string, boardId: string) => {
    const result = await declarationService.validateMondayConfig(apiKey, boardId);
    setMondayConfigStatus(result);
    return result;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuthenticated", "true");
      toast("Connexion réussie", {
        description: "Bienvenue dans l'interface d'administration."
      });
      loadDeclarations();
    } else {
      toast.error("Échec de la connexion", {
        description: "Nom d'utilisateur ou mot de passe incorrect."
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
    toast("Déconnexion réussie", {
      description: "Vous avez été déconnecté avec succès."
    });
  };

  const viewDeclarationDetails = (declaration: Declaration) => {
    setSelectedDeclaration(declaration);
    setIsDetailOpen(true);
  };

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

  const translateStatus = (status: string): string => {
    const translations: Record<string, string> = {
      pending: "Em espera",
      in_progress: "Em progresso",
      resolved: "Resolvido",
    };
    return translations[status] || status;
  };

  const updateDeclarationStatus = (id: string, newStatus: Declaration["status"]) => {
    const updatedDeclaration = declarationService.updateStatus(id, newStatus);
    
    if (updatedDeclaration) {
      loadDeclarations();
      
      if (selectedDeclaration && selectedDeclaration.id === id) {
        setSelectedDeclaration({ ...selectedDeclaration, status: newStatus });
      }
      
      toast("Statut mis à jour", {
        description: `La déclaration a été mise à jour avec le statut "${translateStatus(newStatus)}".`
      });
    }
  };
  
  const handleSaveMondayConfig = async () => {
    setIsTesting(true);
    
    try {
      const result = await declarationService.setMondayConfig(mondayApiKey, mondayBoardId);
      
      setMondayConfigStatus(result);
      
      if (result.valid) {
        toast.success("Configuration Monday.com sauvegardée", {
          description: result.message
        });
      } else {
        toast.error("Erreur de configuration", {
          description: result.message
        });
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde", {
        description: "Une erreur s'est produite lors de la sauvegarde de la configuration."
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleSaveNotificationPreferences = () => {
    try {
      saveNotificationPreferences(notificationPreferences);
      toast.success("Préférences de notification enregistrées");
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast.error("Erreur lors de l'enregistrement des préférences");
    }
  };
  
  const handleSetupWebhook = async () => {
    if (!webhookUrl) {
      toast.error("Veuillez entrer une URL de webhook");
      return;
    }
    
    setIsTesting(true);
    try {
      const result = await setupNotificationWebhook(webhookUrl);
      if (result.success) {
        toast.success("Webhook configuré avec succès", {
          description: result.message
        });
        setWebhookUrl("");
        loadWebhooks();
      } else {
        toast.error("Erreur de configuration du webhook", {
          description: result.message
        });
      }
    } catch (error) {
      console.error("Error setting up webhook:", error);
      toast.error("Erreur lors de la configuration du webhook");
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      const result = await deleteWebhook(webhookId);
      if (result.success) {
        toast.success("Webhook supprimé avec succès");
        loadWebhooks();
      } else {
        toast.error("Erreur lors de la suppression du webhook", {
          description: result.message
        });
      }
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast.error("Erreur lors de la suppression du webhook");
    }
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
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="declarations">Déclarations</TabsTrigger>
                  <TabsTrigger value="settings">Paramètres API</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                
                <TabsContent value="declarations">
                  <Card>
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
                          {declarations.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-4">
                                Aucune déclaration trouvée
                              </TableCell>
                            </TableRow>
                          ) : (
                            declarations.map((declaration) => (
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
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuration de Monday.com</CardTitle>
                      <CardDescription>
                        Configurez l'intégration avec Monday.com pour synchroniser les déclarations.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="monday-api-key" className="font-medium">
                          Clé API Monday.com
                        </label>
                        <Input
                          id="monday-api-key"
                          type="password"
                          value={mondayApiKey}
                          onChange={(e) => setMondayApiKey(e.target.value)}
                          placeholder="Votre clé API Monday.com"
                        />
                        <p className="text-sm text-gray-500">
                          Pour obtenir votre clé API, allez dans votre compte Monday.com ➝ Profile ➝ Developer ➝ API v2 Token
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="monday-board-id" className="font-medium">
                          ID du Tableau Monday.com
                        </label>
                        <Input
                          id="monday-board-id"
                          value={mondayBoardId}
                          onChange={(e) => setMondayBoardId(e.target.value)}
                          placeholder="ID du tableau (ex: 123456789)"
                        />
                        <p className="text-sm text-gray-500">
                          L'ID du tableau se trouve dans l'URL de votre tableau: https://your-domain.monday.com/boards/[ID DU TABLEAU]
                        </p>
                      </div>
                      
                      {mondayConfigStatus && (
                        <div className={`p-4 border rounded-md ${mondayConfigStatus.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <p className={`text-sm ${mondayConfigStatus.valid ? 'text-green-800' : 'text-red-800'}`}>
                            {mondayConfigStatus.message}
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setMondayApiKey("");
                          setMondayBoardId("");
                          setMondayConfigStatus(null);
                          localStorage.removeItem('mondayApiKey');
                          localStorage.removeItem('mondayBoardId');
                          toast("Configuration réinitialisée");
                        }}
                      >
                        Réinitialiser
                      </Button>
                      <Button 
                        onClick={handleSaveMondayConfig}
                        disabled={!mondayApiKey || !mondayBoardId || isTesting}
                      >
                        {isTesting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Test en cours...
                          </>
                        ) : (
                          <>
                            <Settings className="mr-2 h-4 w-4" />
                            Tester et Sauvegarder
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Préférences de notification</CardTitle>
                        <CardDescription>
                          Configurez comment vous souhaitez recevoir les notifications.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="notify-email" 
                            checked={notificationPreferences.email}
                            onCheckedChange={(checked) => 
                              setNotificationPreferences({
                                ...notificationPreferences,
                                email: checked === true
                              })
                            }
                          />
                          <label
                            htmlFor="notify-email"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Notifications par email
                          </label>
                        </div>
                        
                        {notificationPreferences.email && (
                          <div className="ml-6 space-y-2">
                            <label htmlFor="recipient-email" className="text-sm font-medium">
                              Email du destinataire
                            </label>
                            <Input
                              id="recipient-email"
                              type="email"
                              placeholder="email@exemple.com"
                              value={notificationPreferences.recipientEmail || ''}
                              onChange={(e) => 
                                setNotificationPreferences({
                                  ...notificationPreferences,
                                  recipientEmail: e.target.value
                                })
                              }
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="notify-sms" 
                            checked={notificationPreferences.sms}
                            onCheckedChange={(checked) => 
                              setNotificationPreferences({
                                ...notificationPreferences,
                                sms: checked === true
                              })
                            }
                          />
                          <label
                            htmlFor="notify-sms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Notifications par SMS
                          </label>
                        </div>
                        
                        {notificationPreferences.sms && (
                          <div className="ml-6 space-y-2">
                            <label htmlFor="recipient-phone" className="text-sm font-medium">
                              Numéro de téléphone
                            </label>
                            <Input
                              id="recipient-phone"
                              type="tel"
                              placeholder="+33 6 12 34 56 78"
                              value={notificationPreferences.recipientPhone || ''}
                              onChange={(e) => 
                                setNotificationPreferences({
                                  ...notificationPreferences,
                                  recipientPhone: e.target.value
                                })
                              }
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="notify-push" 
                            checked={notificationPreferences.push}
                            onCheckedChange={(checked) => 
                              setNotificationPreferences({
                                ...notificationPreferences,
                                push: checked === true
                              })
                            }
                          />
                          <label
                            htmlFor="notify-push"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Notifications push dans l'interface
                          </label>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button onClick={handleSaveNotificationPreferences}>
                          <Bell className="mr-2 h-4 w-4" />
                          Enregistrer les préférences
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Webhooks Monday.com</CardTitle>
                        <CardDescription>
                          Configurez des webhooks pour recevoir des notifications lors de changements dans Monday.com.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <label htmlFor="webhook-url" className="font-medium">
                            URL du Webhook
                          </label>
                          <Input
                            id="webhook-url"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://votreserveur.com/webhook"
                          />
                          <p className="text-sm text-gray-500">
                            L'URL de votre endpoint qui recevra les notifications de Monday.com.
                          </p>
                        </div>
                        
                        <Button 
                          onClick={handleSetupWebhook} 
                          disabled={!webhookUrl || isTesting}
                          className="w-full"
                        >
                          {isTesting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Configuration en cours...
                            </>
                          ) : (
                            "Configurer le Webhook"
                          )}
                        </Button>
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Webhooks configurés</h3>
                          
                          {isLoadingWebhooks ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                            </div>
                          ) : webhooks.length === 0 ? (
                            <p className="text-sm text-gray-500 py-2">
                              Aucun webhook configuré.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {webhooks.map((webhook) => (
                                <div 
                                  key={webhook.id} 
                                  className="border rounded-md p-3 flex justify-between items-center"
                                >
                                  <div>
                                    <p className="text-sm font-medium truncate max-w-xs">
                                      {webhook.url}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Événement: {webhook.event}
                                    </p>
                                  </div>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteWebhook(webhook.id)}
                                  >
                                    Supprimer
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
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
