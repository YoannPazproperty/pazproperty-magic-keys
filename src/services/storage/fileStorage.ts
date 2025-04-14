
import { v4 as uuidv4 } from 'uuid';
import { getSupabase, checkBucketExists } from '../supabase';
import { toast } from "sonner";

// Fonction pour nettoyer le nom de fichier de caractères spéciaux
const sanitizeFileName = (fileName: string): string => {
  // Remplacer les caractères accentués par leur version non accentuée
  const normalized = fileName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Remplacer tous les caractères non alphanumériques (sauf points) par des underscores
  return normalized.replace(/[^a-zA-Z0-9._]/g, '_');
};

// Store a file (uniquement dans Supabase Storage)
export const storeFile = async (file: File): Promise<string> => {
  try {
    console.log("fileStorage: Starting file storage process for:", file.name);
    
    // Generate unique ID for file
    const fileId = uuidv4();
    console.log("fileStorage: Generated file ID:", fileId);
    
    // Vérifier si le bucket existe
    console.log("fileStorage: Checking if declaration-media bucket exists...");
    const bucketExists = await checkBucketExists('declaration-media');
    
    if (!bucketExists) {
      console.error("fileStorage: Bucket doesn't exist");
      toast.error("Erro de armazenamento", {
        description: "O bucket de armazenamento não existe. Contate o suporte."
      });
      throw new Error("Storage bucket doesn't exist");
    }
    
    // Essayer de stocker dans Supabase Storage
    const supabase = getSupabase();
    if (!supabase) {
      console.error("fileStorage: Supabase client not available");
      toast.error("Erro de conexão", {
        description: "Não foi possível conectar ao Supabase. Tente novamente mais tarde."
      });
      throw new Error("Supabase client not available");
    }
    
    // Sanitize filename before uploading
    const sanitizedFileName = sanitizeFileName(file.name);
    console.log(`fileStorage: Original filename: "${file.name}", sanitized: "${sanitizedFileName}"`);
    
    // Prepare safe filename with UUID prefix
    const filePath = `${fileId}-${sanitizedFileName}`;
    console.log(`fileStorage: Uploading file to path: ${filePath}...`);
    
    const bucketName = 'declaration-media';
    
    // Upload file
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error("fileStorage: Error uploading to Supabase Storage:", uploadError);
      console.log("fileStorage: Error message:", uploadError.message);
      toast.error("Erro ao fazer upload do arquivo", {
        description: uploadError.message || "Erro ao fazer upload do arquivo"
      });
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }
    
    console.log("fileStorage: File uploaded to Supabase Storage:", data);
    
    // Generate public URL for file
    const { data: publicURL } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    console.log("fileStorage: Generated Supabase public URL:", publicURL);
    
    toast.success("Arquivo carregado", {
      description: "Mídia salva no Supabase com sucesso"
    });
    
    return publicURL.publicUrl;
  } catch (error) {
    console.error('fileStorage: Error storing file:', error);
    throw error;
  }
};

// Retrieves a file by ID (récupère uniquement depuis Supabase)
export const getStoredFile = async (fileId: string): Promise<string | null> => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.error("fileStorage: Supabase client not available for file retrieval");
      return null;
    }
    
    const bucketName = 'declaration-media';
    
    // Vérifier si le bucket existe
    const bucketExists = await checkBucketExists(bucketName);
    if (!bucketExists) {
      console.error("fileStorage: Bucket doesn't exist for file retrieval");
      return null;
    }
    
    // Liste les fichiers dans le bucket qui commencent par l'ID
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        search: fileId
      });

    if (!error && files && files.length > 0) {
      const matchingFile = files.find(file => file.name.startsWith(fileId));
      if (matchingFile) {
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(matchingFile.name);
          
        return data.publicUrl;
      }
    }
    
    console.log("fileStorage: File not found by ID:", fileId);
    return null;
  } catch (error) {
    console.error("fileStorage: Error retrieving file:", error);
    return null;
  }
};

// Delete a file (supprime uniquement depuis Supabase)
export const deleteStoredFile = async (fileId: string): Promise<boolean> => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.error("fileStorage: Supabase client not available for file deletion");
      return false;
    }
    
    const bucketName = 'declaration-media';
    
    // Vérifier si le bucket existe
    const bucketExists = await checkBucketExists(bucketName);
    if (!bucketExists) {
      console.error("fileStorage: Bucket doesn't exist for file deletion");
      return false;
    }
    
    // Liste les fichiers dans le bucket qui commencent par l'ID
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        search: fileId
      });

    if (!error && files && files.length > 0) {
      const matchingFile = files.find(file => file.name.startsWith(fileId));
      if (matchingFile) {
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([matchingFile.name]);
          
        if (!error) {
          console.log("fileStorage: File deleted from Supabase Storage:", fileId);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error("fileStorage: Error deleting file:", error);
    return false;
  }
};
