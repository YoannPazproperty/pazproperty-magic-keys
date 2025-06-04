import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ServiceProviderFormDialog } from "./ServiceProviderFormDialog";
import { getProviders } from "../../services/providers/providerQueries";
import { deleteProvider } from "../../services/providers/providerQueries";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import type { ServiceProvider } from "../../services/types";

export const ProvidersList = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    const filtered = providers.filter(provider =>
      provider.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.nome_gerente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.tipo_de_obras.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProviders(filtered);
  }, [providers, searchTerm]);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const data = await getProviders();
      setProviders(data);
    } catch (error) {
      console.error("Error loading providers:", error);
      toast.error("Erreur lors du chargement des prestataires");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setIsFormOpen(true);
  };

  const handleDelete = async (providerId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce prestataire ?")) {
      try {
        await deleteProvider(providerId);
        await loadProviders();
        toast.success("Prestataire supprimé avec succès");
      } catch (error) {
        console.error("Error deleting provider:", error);
        toast.error("Erreur lors de la suppression du prestataire");
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedProvider(undefined);
    loadProviders();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProvider(undefined);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      "Eletricidade": "bg-yellow-100 text-yellow-800",
      "Canalização": "bg-blue-100 text-blue-800",
      "Alvenaria": "bg-gray-100 text-gray-800",
      "Caixilharias": "bg-green-100 text-green-800",
      "Obras gerais": "bg-purple-100 text-purple-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Prestataires de services</h2>
          <p className="text-muted-foreground">
            Gérez les prestataires de services et leurs spécialités
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau prestataire
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par entreprise, manager, email ou type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProviders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "Aucun prestataire trouvé pour cette recherche" : "Aucun prestataire trouvé"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{provider.empresa}</CardTitle>
                    <CardDescription>{provider.nome_gerente}</CardDescription>
                  </div>
                  <Badge className={getTypeColor(provider.tipo_de_obras)}>
                    {provider.tipo_de_obras}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <p><span className="font-medium">Email:</span> {provider.email}</p>
                  {provider.telefone && (
                    <p><span className="font-medium">Téléphone:</span> {provider.telefone}</p>
                  )}
                  {provider.cidade && (
                    <p><span className="font-medium">Ville:</span> {provider.cidade}</p>
                  )}
                  {provider.nif && (
                    <p><span className="font-medium">NIF:</span> {provider.nif}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(provider)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(provider.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ServiceProviderFormDialog
        selectedProvider={selectedProvider}
        providerToEdit={selectedProvider}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};
