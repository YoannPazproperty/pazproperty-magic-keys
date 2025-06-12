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
export const convertFromSupabaseFormat = (item: any): Declaration => {
  const mediaFilesRaw = item.mediaFiles;
  let mediaFiles: string[] = [];

  if (typeof mediaFilesRaw === 'string') {
    try {
      const parsed = JSON.parse(mediaFilesRaw);
      if (Array.isArray(parsed)) {
        mediaFiles = parsed;
      } else {
        mediaFiles = [String(parsed)];
      }
    } catch (e) {
      mediaFiles = [mediaFilesRaw];
    }
  } else if (Array.isArray(mediaFilesRaw)) {
    mediaFiles = mediaFilesRaw;
  }
  
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    property: item.property,
    city: item.city,
    postalCode: item.postal_code,
    issueType: item.issue_type,
    description: item.description,
    urgency: item.urgency,
    status: item.status || "Novo",
    submittedAt: item.submitted_at,
    mediaFiles,
    appointment_date: item.appointment_date,
    appointment_notes: item.appointment_notes
  };
};
