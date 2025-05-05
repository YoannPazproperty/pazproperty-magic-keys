
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import type { ServiceProvider } from "@/services/types";

interface ProviderInfoCardProps {
  provider: ServiceProvider | null;
  loading: boolean;
  error: string | null;
}

export function ProviderInfoCard({ provider, loading, error }: ProviderInfoCardProps) {
  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          <span>Carregando informações do prestador...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardContent className="py-4 text-red-500">
          Erro ao carregar informações: {error}
        </CardContent>
      </Card>
    );
  }

  if (!provider) {
    console.log("No provider data available to display");
    return null;
  }

  console.log("Rendering provider info:", provider);

  return (
    <Card className="mb-6 border border-gray-200">
      <CardContent className="py-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-2 text-primary" />
            <span className="font-semibold text-lg">{provider.empresa}</span>
          </div>
          
          <Separator className="my-2" />
          
          {provider.endereco && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span>{provider.endereco}</span>
            </div>
          )}
          
          {(provider.codigo_postal || provider.cidade) && (
            <div className="flex items-center">
              <div className="h-4 w-4 mr-2"></div>  {/* Spacer for alignment */}
              <span>
                {[provider.codigo_postal, provider.cidade]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
          
          {provider.telefone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <span>{provider.telefone}</span>
            </div>
          )}
          
          {provider.email && (
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <span>{provider.email}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
