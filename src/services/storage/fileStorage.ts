
import { v4 as uuidv4 } from 'uuid';
import { getSupabase } from '../supabaseService';

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
    const bucketName = 'declaration-media';
    
    // Vérifier si le bucket existe, sinon créer un fallback
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (bucketExists || await createBucketIfNotExists(bucketName)) {
      const filePath = `${fileId}-${file.name.replace(/\s+/g, '_')}`;
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (!error) {
        console.log("File uploaded to Supabase Storage:", data);
        
        // Générer une URL publique pour le fichier
        const { data: publicURL } = await supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
          
        console.log("Generated Supabase public URL:", publicURL);
        return publicURL.publicUrl;
      } else {
        console.error("Error uploading to Supabase Storage:", error);
        // Fallback au localStorage
      }
    } else {
      console.log("Bucket doesn't exist and couldn't be created, falling back to localStorage");
    }
    
    // Fallback: Stocker dans localStorage
    console.log("Falling back to localStorage storage");
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
  } catch (error) {
    console.error('Error storing file:', error);
    throw error;
  }
};

// Créer un bucket dans Supabase Storage s'il n'existe pas
const createBucketIfNotExists = async (bucketName: string): Promise<boolean> => {
  try {
    const supabase = getSupabase();
    const { data: buckets } = await supabase.storage.listBuckets();
    
    if (!buckets?.some(bucket => bucket.name === bucketName)) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (error) {
        console.error("Error creating bucket:", error);
        return false;
      }
      
      console.log(`Bucket '${bucketName}' created successfully`);
      return true;
    }
    
    console.log(`Bucket '${bucketName}' already exists`);
    return true;
  } catch (error) {
    console.error("Error checking/creating bucket:", error);
    return false;
  }
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
    const bucketName = 'declaration-media';
    
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
    const bucketName = 'declaration-media';
    
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
