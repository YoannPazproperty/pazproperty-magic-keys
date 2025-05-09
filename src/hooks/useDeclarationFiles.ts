import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DeclarationFile } from "@/services/types";
import { toast } from "sonner";

interface UseDeclarationFilesProps {
  declarationId: string;
  fileType?: "quote" | "image" | "video" | string;
}

export const useDeclarationFiles = ({ declarationId, fileType }: UseDeclarationFilesProps) => {
  const [files, setFiles] = useState<DeclarationFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Charger les fichiers
  const loadFiles = async () => {
    if (!declarationId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from("declaration_files")
        .select("*")
        .eq("declaration_id", declarationId);
      
      if (fileType) {
        query = query.eq("file_type", fileType);
      }
      
      const { data, error } = await query.order("uploaded_at", { ascending: false });
      
      if (error) {
        console.error("Erreur lors du chargement des fichiers:", error);
        toast.error("Erreur lors du chargement des fichiers");
        return;
      }
      
      setFiles(data || []);
    } catch (error) {
      console.error("Exception lors du chargement des fichiers:", error);
      toast.error("Erreur inattendue lors du chargement des fichiers");
    } finally {
      setIsLoading(false);
    }
  };

  // Téléverser un fichier
  const uploadFile = async (file: File, customFileType?: string): Promise<string | null> => {
    if (!declarationId || !file) return null;
    
    setIsUploading(true);
    try {
      // 1. Stocker le fichier dans le bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `declarations/${declarationId}/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from("declaration-media")
        .upload(filePath, file);
      
      if (uploadError) {
        console.error("Erreur lors du téléversement du fichier:", uploadError);
        toast.error("Erreur lors du téléversement du fichier");
        return null;
      }
      
      // 2. Obtenir l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from("declaration-media")
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData?.publicUrl;
      
      if (!publicUrl) {
        console.error("Impossible d'obtenir l'URL publique du fichier");
        toast.error("Erreur lors de la récupération de l'URL du fichier");
        return null;
      }
      
      // 3. Enregistrer le fichier dans la base de données
      const type = customFileType || (
        file.type.startsWith('image') 
          ? 'image' 
          : file.type.startsWith('video') 
          ? 'video' 
          : 'quote'
      );
      
      const { error: dbError } = await supabase
        .from("declaration_files")
        .insert({
          declaration_id: declarationId,
          file_path: publicUrl,
          file_type: type,
          file_name: file.name,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (dbError) {
        console.error("Erreur lors de l'enregistrement du fichier:", dbError);
        toast.error("Erreur lors de l'enregistrement du fichier");
        return null;
      }
      
      // 4. Recharger les fichiers
      await loadFiles();
      
      return publicUrl;
    } catch (error) {
      console.error("Exception lors du téléversement du fichier:", error);
      toast.error("Erreur inattendue lors du téléversement du fichier");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Supprimer un fichier
  const deleteFile = async (fileId: string, filePath: string): Promise<boolean> => {
    setIsUploading(true);
    try {
      // 1. Supprimer l'enregistrement de la base de données
      const { error: dbError } = await supabase
        .from("declaration_files")
        .delete()
        .eq("id", fileId);
      
      if (dbError) {
        console.error("Erreur lors de la suppression de l'enregistrement:", dbError);
        toast.error("Erreur lors de la suppression du fichier");
        return false;
      }
      
      // 2. Supprimer le fichier du stockage (extraction du chemin relatif)
      const storageFilePath = filePath.split('/').slice(-3).join('/');
      
      const { error: storageError } = await supabase.storage
        .from("declaration-media")
        .remove([storageFilePath]);
      
      if (storageError) {
        console.error("Erreur lors de la suppression du fichier du stockage:", storageError);
        // Ne pas bloquer si le fichier n'existe pas dans le stockage
      }
      
      // 3. Recharger les fichiers
      await loadFiles();
      
      return true;
    } catch (error) {
      console.error("Exception lors de la suppression du fichier:", error);
      toast.error("Erreur inattendue lors de la suppression du fichier");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  // Charger les fichiers au montage
  useEffect(() => {
    if (declarationId) {
      loadFiles();
    }
  }, [declarationId]);

  return {
    files,
    isLoading,
    isUploading,
    uploadFile,
    deleteFile,
    refreshFiles: loadFiles
  };
};
