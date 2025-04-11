
import { v4 as uuidv4 } from 'uuid';
import { getSupabase, createBucketIfNotExists } from '../supabaseService';

// Fonction pour convertir un fichier en base64 (pour le fallback localStorage)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Interface pour les fichiers stockés
interface StoredFile {
  id: string;
  name: string;
  type: string;
  data: string;
  createdAt: string;
}

// Stocker un fichier (priorité à Supabase Storage, fallback à localStorage)
export const storeFile = async (file: File): Promise<string> => {
  try {
    console.log("Starting file storage process for:", file.name);
    
    // Générer un ID unique pour le fichier
    const fileId = uuidv4();
    console.log("Generated file ID:", fileId);
    
    // Essayer de stocker dans Supabase Storage
    const supabase = getSupabase();
    if (!supabase) {
      console.log("Supabase client not available, falling back to localStorage");
      return storeFileLocally(file, fileId);
    }
    
    const bucketName = 'declaration-media';
    
    // Essayer de créer le bucket s'il n'existe pas
    const bucketCreated = await createBucketIfNotExists(bucketName);
    if (!bucketCreated) {
      console.log("Failed to create or verify bucket, falling back to localStorage");
      return storeFileLocally(file, fileId);
    }
    
    try {
      // Télécharger le fichier
      const filePath = `${fileId}-${file.name.replace(/\s+/g, '_')}`;
      console.log(`Uploading file to path: ${filePath}...`);
      
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error("Error uploading to Supabase Storage:", uploadError);
        return storeFileLocally(file, fileId);
      }
      
      console.log("File uploaded to Supabase Storage:", data);
      
      // Générer une URL publique pour le fichier
      const { data: publicURL } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      console.log("Generated Supabase public URL:", publicURL);
      return publicURL.publicUrl;
    } catch (supabaseError) {
      console.error("Supabase storage error:", supabaseError);
      return storeFileLocally(file, fileId);
    }
  } catch (error) {
    console.error('Error storing file:', error);
    throw error;
  }
};

// Stocker un fichier localement (fallback)
const storeFileLocally = async (file: File, fileId: string): Promise<string> => {
  console.log("Falling back to localStorage storage for file:", file.name);
  const base64Data = await fileToBase64(file);
  console.log("File converted to base64 successfully");
  
  // Créer l'objet fichier à stocker
  const storedFile: StoredFile = {
    id: fileId,
    name: file.name,
    type: file.type,
    data: base64Data,
    createdAt: new Date().toISOString()
  };
  
  // Récupérer les fichiers existants
  const existingFiles = getStoredFiles();
  console.log("Existing files count:", existingFiles.length);
  
  // Ajouter le nouveau fichier
  existingFiles.push(storedFile);
  
  // Sauvegarder dans le localStorage
  localStorage.setItem('storedFiles', JSON.stringify(existingFiles));
  console.log("File saved to localStorage successfully");
  
  // Retourner l'URL du fichier
  const fileUrl = `/api/files/${fileId}`;
  console.log("Generated file URL:", fileUrl);
  return fileUrl;
};

// Récupérer tous les fichiers stockés (pour le mode fallback)
export const getStoredFiles = (): StoredFile[] => {
  const stored = localStorage.getItem('storedFiles');
  const files = stored ? JSON.parse(stored) : [];
  console.log("Retrieved stored files count:", files.length);
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
        console.log("Bucket doesn't exist, falling back to localStorage for file retrieval");
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
    console.log("Retrieved file by ID:", fileId, file ? "Found" : "Not found");
    return file;
  } catch (error) {
    console.error("Error retrieving file:", error);
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
              console.log("File deleted from Supabase Storage:", fileId);
            }
          }
        }
      }
    }
    
    // Supprimer aussi du localStorage (au cas où il existe dans les deux)
    const localFiles = getStoredFiles();
    const filteredFiles = localFiles.filter(file => file.id !== fileId);
    localStorage.setItem('storedFiles', JSON.stringify(filteredFiles));
    console.log("File removed from localStorage:", fileId);
    
    return deleted || localFiles.length !== filteredFiles.length;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};
