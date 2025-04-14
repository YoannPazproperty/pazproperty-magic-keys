
import { Declaration } from "../types";

/**
 * Helper functions to convert between application and Supabase data formats
 */

// Convert Declaration to Supabase format
export const convertToSupabaseFormat = (declaration: Declaration) => {
  console.log("supabaseFormatters: Converting to Supabase format:", declaration);
  console.log("supabaseFormatters: Media files before conversion:", declaration.mediaFiles);
  
  const mediaFilesString = declaration.mediaFiles && declaration.mediaFiles.length > 0 
    ? JSON.stringify(declaration.mediaFiles) 
    : null;
    
  console.log("supabaseFormatters: Media files after conversion:", mediaFilesString);
  
  return {
    ...declaration,
    // Convert mediaFiles array to string for Supabase
    mediaFiles: mediaFilesString
  };
};

// Convert Supabase format back to Declaration
export const convertFromSupabaseFormat = (record: any): Declaration => {
  console.log("supabaseFormatters: Converting from Supabase format:", record);
  
  let mediaFiles = [];
  
  // Parse mediaFiles string back to array
  if (record.mediaFiles) {
    try {
      mediaFiles = JSON.parse(record.mediaFiles);
      console.log("supabaseFormatters: Parsed media files:", mediaFiles);
    } catch (error) {
      console.error("supabaseFormatters: Error parsing media files:", error);
      mediaFiles = [];
    }
  }
  
  return {
    ...record,
    mediaFiles
  };
};
