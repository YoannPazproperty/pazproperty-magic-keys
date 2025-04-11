import { v4 as uuidv4 } from 'uuid';
import { getSupabase, createBucketIfNotExists } from '../supabaseService';
import { toast } from "sonner";

// Convert file to base64 (for local storage fallback)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Interface for stored files
interface StoredFile {
  id: string;
  name: string;
  type: string;
  data: string;
  createdAt: string;
}

// Store a file (prioritize Supabase Storage, fallback to localStorage)
export const storeFile = async (file: File): Promise<string> => {
  try {
    console.log("fileStorage: Starting file storage process for:", file.name);
    
    // Generate unique ID for file
    const fileId = uuidv4();
    console.log("fileStorage: Generated file ID:", fileId);
    
    // First, ensure the bucket exists
    console.log("fileStorage: Ensuring declaration-media bucket exists...");
    const bucketCreated = await createBucketIfNotExists('declaration-media');
    
    if (!bucketCreated) {
      console.log("fileStorage: Failed to create or verify bucket, falling back to localStorage");
      return storeFileLocally(file, fileId);
    }
    
    // Try to store in Supabase Storage
    const supabase = getSupabase();
    if (!supabase) {
      console.log("fileStorage: Supabase client not available, falling back to localStorage");
      return storeFileLocally(file, fileId);
    }
    
    // Prepare safe filename
    const filePath = `${fileId}-${file.name.replace(/\s+/g, '_')}`;
    console.log(`fileStorage: Uploading file to path: ${filePath}...`);
    
    const bucketName = 'declaration-media';
    
    try {
      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error("fileStorage: Error uploading to Supabase Storage:", uploadError);
        console.log("fileStorage: Error details:", uploadError.message, uploadError.details);
        return storeFileLocally(file, fileId);
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
    } catch (supabaseError) {
      console.error("fileStorage: Supabase storage error:", supabaseError);
      return storeFileLocally(file, fileId);
    }
  } catch (error) {
    console.error('fileStorage: Error storing file:', error);
    toast.error("Erro ao salvar arquivo", {
      description: "Salvando localmente como backup"
    });
    
    // Generate unique ID for error fallback
    const errorFileId = uuidv4();
    return storeFileLocally(file, errorFileId);
  }
};

// Store file locally (fallback)
const storeFileLocally = async (file: File, fileId: string): Promise<string> => {
  console.log("fileStorage: Falling back to localStorage storage for file:", file.name);
  
  try {
    const base64Data = await fileToBase64(file);
    console.log("fileStorage: File converted to base64 successfully");
    
    // Create file object to store
    const storedFile: StoredFile = {
      id: fileId,
      name: file.name,
      type: file.type,
      data: base64Data,
      createdAt: new Date().toISOString()
    };
    
    // Get existing files
    const existingFiles = getStoredFiles();
    console.log("fileStorage: Existing files count:", existingFiles.length);
    
    // Add new file
    existingFiles.push(storedFile);
    
    // Save to localStorage
    localStorage.setItem('storedFiles', JSON.stringify(existingFiles));
    console.log("fileStorage: File saved to localStorage successfully");
    
    toast.info("Arquivo salvo localmente", {
      description: "Será enviado para o servidor quando houver conexão"
    });
    
    // Return file URL
    const fileUrl = `/api/files/${fileId}`;
    console.log("fileStorage: Generated local file URL:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("fileStorage: Error storing file locally:", error);
    toast.error("Erro ao salvar arquivo localmente", {
      description: "Não foi possível salvar o arquivo"
    });
    throw error;
  }
};

// Get all stored files (for fallback mode)
export const getStoredFiles = (): StoredFile[] => {
  const stored = localStorage.getItem('storedFiles');
  const files = stored ? JSON.parse(stored) : [];
  console.log("fileStorage: Retrieved stored files count:", files.length);
  return files;
};

// Récupérer un fichier par son ID (en vérifiant d'abord Supabase puis le localStorage)
export const getStoredFile = async (fileId: string): Promise<StoredFile | string | null> => {
  try {
    // Essayer d'abord Supabase
    const supabase = getSupabase();
    if (supabase) {
      const bucketName = 'declaration-media';
      
      // Vérifier si le bucket existe
      const bucketExists = await createBucketIfNotExists(bucketName);
      if (!bucketExists) {
        console.log("fileStorage: Bucket doesn't exist, falling back to localStorage for file retrieval");
        // Fallback au localStorage si le bucket n'existe pas
        const localFiles = getStoredFiles();
        return localFiles.find(file => file.id === fileId) || null;
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
    }
    
    // Fallback au localStorage
    const localFiles = getStoredFiles();
    const file = localFiles.find(file => file.id === fileId) || null;
    console.log("fileStorage: Retrieved file by ID:", fileId, file ? "Found" : "Not found");
    return file;
  } catch (error) {
    console.error("fileStorage: Error retrieving file:", error);
    return null;
  }
};

// Supprimer un fichier
export const deleteStoredFile = async (fileId: string): Promise<boolean> => {
  try {
    let deleted = false;
    
    // Essayer d'abord de supprimer de Supabase
    const supabase = getSupabase();
    if (supabase) {
      const bucketName = 'declaration-media';
      
      // Vérifier si le bucket existe
      const bucketExists = await createBucketIfNotExists(bucketName);
      if (bucketExists) {
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
              deleted = true;
              console.log("fileStorage: File deleted from Supabase Storage:", fileId);
            }
          }
        }
      }
    }
    
    // Supprimer aussi du localStorage (au cas où il existe dans les deux)
    const localFiles = getStoredFiles();
    const filteredFiles = localFiles.filter(file => file.id !== fileId);
    localStorage.setItem('storedFiles', JSON.stringify(filteredFiles));
    console.log("fileStorage: File removed from localStorage:", fileId);
    
    return deleted || localFiles.length !== filteredFiles.length;
  } catch (error) {
    console.error("fileStorage: Error deleting file:", error);
    return false;
  }
};
