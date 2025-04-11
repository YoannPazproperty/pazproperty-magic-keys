
import React, { useEffect } from "react";
import {
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import FileUpload from "@/components/FileUpload";
import { isSupabaseConnected, createBucketIfNotExists } from "@/services/supabaseService";
import { useQuery } from "@tanstack/react-query";
import { Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

interface MediaUploadFieldProps {
  onChange: (files: File[]) => void;
}

const MediaUploadField: React.FC<MediaUploadFieldProps> = ({ onChange }) => {
  // Check Supabase connection status
  const { data: supabaseConnected, isLoading, refetch } = useQuery({
    queryKey: ['supabase-connection'],
    queryFn: async () => {
      console.log("MediaUploadField: Checking Supabase connection and bucket...");
      try {
        // Try to create the bucket if it doesn't exist
        const bucketCreated = await createBucketIfNotExists('declaration-media');
        console.log("MediaUploadField: Bucket creation result:", bucketCreated);
        
        // Check if Supabase is connected
        const connected = await isSupabaseConnected();
        console.log("MediaUploadField: Supabase connection status:", connected);
        
        if (connected) {
          toast.success("Conectado ao Supabase", { 
            id: "supabase-connection",
            duration: 3000 
          });
        } else {
          toast.warning("Modo offline - Os dados serão sincronizados mais tarde", { 
            id: "supabase-connection",
            duration: 5000 
          });
        }
        
        return connected;
      } catch (error) {
        console.error("MediaUploadField: Error checking connection:", error);
        return false;
      }
    },
    retry: 2,
    staleTime: 30000, // 30 seconds
  });
  
  // Refresh connection status when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

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
