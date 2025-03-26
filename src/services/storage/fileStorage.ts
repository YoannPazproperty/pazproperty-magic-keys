import { v4 as uuidv4 } from 'uuid';

// Fonction pour convertir un fichier en base64
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

// Stocker un fichier
export const storeFile = async (file: File): Promise<string> => {
  try {
    console.log("Starting file storage process for:", file.name);
    
    // Générer un ID unique pour le fichier
    const fileId = uuidv4();
    console.log("Generated file ID:", fileId);
    
    // Convertir le fichier en base64
    console.log("Converting file to base64...");
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

// Récupérer tous les fichiers stockés
export const getStoredFiles = (): StoredFile[] => {
  const stored = localStorage.getItem('storedFiles');
  const files = stored ? JSON.parse(stored) : [];
  console.log("Retrieved stored files count:", files.length);
  return files;
};

// Récupérer un fichier par son ID
export const getStoredFile = (fileId: string): StoredFile | null => {
  const files = getStoredFiles();
  const file = files.find(file => file.id === fileId) || null;
  console.log("Retrieved file by ID:", fileId, file ? "Found" : "Not found");
  return file;
};

// Supprimer un fichier
export const deleteStoredFile = (fileId: string): boolean => {
  const files = getStoredFiles();
  const filteredFiles = files.filter(file => file.id !== fileId);
  localStorage.setItem('storedFiles', JSON.stringify(filteredFiles));
  console.log("Deleted file:", fileId);
  return true;
}; 