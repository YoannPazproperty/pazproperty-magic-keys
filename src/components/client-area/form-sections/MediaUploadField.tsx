
import React, { useEffect, useState } from "react";
import {
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import FileUpload from "@/components/FileUpload";
import { isSupabaseConnected } from "@/services/supabaseService";
import { useQuery } from "@tanstack/react-query";
import { Wifi, WifiOff } from "lucide-react";

interface MediaUploadFieldProps {
  onChange: (files: File[]) => void;
}

const MediaUploadField: React.FC<MediaUploadFieldProps> = ({ onChange }) => {
  // Vérifier l'état de la connexion à Supabase
  const { data: supabaseConnected, isLoading } = useQuery({
    queryKey: ['supabase-connection'],
    queryFn: async () => {
      return await isSupabaseConnected();
    },
    staleTime: 30000, // 30 secondes
  });

  return (
    <div className="space-y-2">
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base">Adicionar média</FormLabel>
          
          <div className="flex items-center text-sm">
            {isLoading ? (
              <span className="text-gray-500">Verificando conexão...</span>
            ) : supabaseConnected ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-4 w-4 mr-1" />
                <span>Conectado</span>
              </div>
            ) : (
              <div className="flex items-center text-amber-600">
                <WifiOff className="h-4 w-4 mr-1" />
                <span>Modo offline</span>
              </div>
            )}
          </div>
        </div>
        
        <FormDescription>
          Pode adicionar fotos ou vídeos para ajudar a descrever o problema (opcional).
          {supabaseConnected === false && (
            <span className="text-yellow-600 block mt-1">
              ⚠️ Modo offline: os ficheiros serão guardados localmente e sincronizados mais tarde.
            </span>
          )}
        </FormDescription>
      </div>
      <FileUpload 
        onChange={onChange} 
        maxFiles={5} 
        accept="image/*,video/*" 
        supabaseConnected={supabaseConnected}
      />
    </div>
  );
};

export default MediaUploadField;
