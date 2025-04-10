
import React from "react";
import {
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import FileUpload from "@/components/FileUpload";
import { isSupabaseConnected } from "@/services/supabaseService";
import { useQuery } from "@tanstack/react-query";

interface MediaUploadFieldProps {
  onChange: (files: File[]) => void;
}

const MediaUploadField: React.FC<MediaUploadFieldProps> = ({ onChange }) => {
  // Vérifier l'état de la connexion à Supabase
  const { data: supabaseConnected } = useQuery({
    queryKey: ['supabase-connection'],
    queryFn: async () => {
      return await isSupabaseConnected();
    },
    staleTime: 30000, // 30 secondes
  });

  return (
    <div className="space-y-2">
      <div className="mb-2">
        <FormLabel className="text-base">Adicionar média</FormLabel>
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
      />
    </div>
  );
};

export default MediaUploadField;
