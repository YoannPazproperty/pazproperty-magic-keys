
import { Declaration } from "../types";

/**
 * Helper functions to convert between application and Supabase data formats
 */

// Convert Declaration to Supabase format
export const convertToSupabaseFormat = (declaration: Declaration) => {
  // S'il y a des mediaFiles et c'est un tableau, le convertir en string JSON
  const mediaFilesString = declaration.mediaFiles && Array.isArray(declaration.mediaFiles) && declaration.mediaFiles.length > 0 
    ? JSON.stringify(declaration.mediaFiles) 
    : null;
    
  return {
    ...declaration,
    // Convert mediaFiles array to string for Supabase
    mediaFiles: mediaFilesString
  };
};

// Convert Supabase format back to Declaration
export const convertFromSupabaseFormat = (record: any): Declaration => {
  let mediaFiles = null;
  
  // Parse mediaFiles string back to array if it exists
  if (record.mediaFiles) {
    try {
      // Si c'est déjà un array, on le garde tel quel
      if (Array.isArray(record.mediaFiles)) {
        mediaFiles = record.mediaFiles;
      } else {
        // Sinon on essaie de parser le JSON
        mediaFiles = JSON.parse(record.mediaFiles);
      }
    } catch (error) {
      console.error("Error parsing media files:", error);
      // Si on ne peut pas parser, on le traite comme un tableau avec un seul élément
      mediaFiles = record.mediaFiles ? [record.mediaFiles] : null;
    }
  }
  
  return {
    ...record,
    mediaFiles
  };
};
