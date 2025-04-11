
import React, { useEffect } from "react";
import {
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import FileUpload from "@/components/FileUpload";
import { isSupabaseConnected, isStorageConnected } from "@/services/supabaseService";
import { useQuery } from "@tanstack/react-query";
import { Wifi, WifiOff, CloudOff } from "lucide-react";
import { toast } from "sonner";

interface ConnectionStatus {
  initialized: boolean;
  database: boolean;
  storage: boolean;
}

interface MediaUploadFieldProps {
  onChange: (files: File[]) => void;
  connectionStatus?: ConnectionStatus;
}

const MediaUploadField: React.FC<MediaUploadFieldProps> = ({ 
  onChange, 
  connectionStatus 
}) => {
  // Check Supabase connection status if not provided via props
  const { data: queryConnectionStatus, isLoading, refetch } = useQuery({
    queryKey: ['supabase-connection'],
    queryFn: async () => {
      // Skip query if connection status is provided via props
      if (connectionStatus) {
        console.log("MediaUploadField: Using provided connection status:", connectionStatus);
        return {
          database: connectionStatus.database,
          storage: connectionStatus.storage
        };
      }

      console.log("MediaUploadField: Checking Supabase connection...");
      try {
        // Check if database is available
        const dbConnected = await isSupabaseConnected();
        console.log("MediaUploadField: Database connection status:", dbConnected);
        
        // Check if storage is available
        const storageConnected = await isStorageConnected();
        console.log("MediaUploadField: Storage connection status:", storageConnected);
        
        if (dbConnected && storageConnected) {
          toast.success("Conectado ao Supabase", { 
            id: "supabase-connection",
            duration: 3000 
          });
        } else if (dbConnected) {
          toast.info("Armazenamento limitado", { 
            id: "supabase-connection",
            description: "Banco de dados está conectado mas o armazenamento pode usar o modo local", 
            duration: 5000 
          });
        } else {
          toast.warning("Modo offline - Os dados serão sincronizados mais tarde", { 
            id: "supabase-connection",
            duration: 5000 
          });
        }
        
        return {
          database: dbConnected,
          storage: storageConnected
        };
      } catch (error) {
        console.error("MediaUploadField: Error checking connection:", error);
        return {
          database: false,
          storage: false
        };
      }
    },
    enabled: !connectionStatus, // Only run if connection status is not provided via props
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
  
  // Combine connection status from props or query
  const finalConnectionStatus = connectionStatus 
    ? { database: connectionStatus.database, storage: connectionStatus.storage }
    : queryConnectionStatus;

  return (
    <div className="space-y-2">
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <FormLabel className="text-base">Adicionar média</FormLabel>
          
          <div className="flex items-center text-sm">
            {!connectionStatus && isLoading ? (
              <span className="text-gray-500">Verificando conexão...</span>
            ) : finalConnectionStatus?.database && finalConnectionStatus?.storage ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-4 w-4 mr-1" />
                <span>Conectado</span>
              </div>
            ) : finalConnectionStatus?.database ? (
              <div className="flex items-center text-blue-600">
                <CloudOff className="h-4 w-4 mr-1" />
                <span>Armazenamento limitado</span>
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
          {finalConnectionStatus?.database === false && (
            <span className="text-yellow-600 block mt-1">
              ⚠️ Modo offline: os ficheiros serão guardados localmente e sincronizados mais tarde.
            </span>
          )}
          {finalConnectionStatus?.database === true && finalConnectionStatus?.storage === false && (
            <span className="text-blue-600 block mt-1">
              ℹ️ Armazenamento limitado: os ficheiros podem ser guardados localmente.
            </span>
          )}
        </FormDescription>
      </div>
      <FileUpload 
        onChange={onChange} 
        maxFiles={5} 
        accept="image/*,video/*" 
        supabaseConnected={finalConnectionStatus?.storage || false}
      />
    </div>
  );
};

export default MediaUploadField;
