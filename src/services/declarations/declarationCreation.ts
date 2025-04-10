
import { Declaration } from "../types";
import { saveDeclarations, loadDeclarations } from "../storageService";
import { generateUniqueId } from "./declarationStorage";
import { notifyNewDeclaration } from "./declarationNotification";
import { storeFile } from "../storage/fileStorage";
import { createSupabaseDeclaration } from "./supabaseDeclarationStorage";
import { isSupabaseConnected } from "../supabaseService";
import { supabase } from "@/integrations/supabase/client";

// Create a new declaration with media files
export const addWithMedia = async (
  declarationData: Omit<Declaration, 'id' | 'status' | 'submittedAt'>,
  mediaFiles: File[]
): Promise<Declaration> => {
  try {
    // Stocker les fichiers et obtenir leurs URLs
    const mediaUrls = await Promise.all(
      mediaFiles.map(file => storeFile(file))
    );
    
    const newDeclaration: Declaration = {
      ...declarationData,
      id: generateUniqueId(),
      status: "pending",
      submittedAt: new Date().toISOString(),
      mediaFiles: mediaUrls
    };
    
    // Vérifier si Supabase est connecté
    const supabaseConnected = await isSupabaseConnected();
    
    if (supabaseConnected) {
      console.log('Supabase est connecté, tentative d\'enregistrement dans Supabase');
      try {
        const result = await createSupabaseDeclaration(newDeclaration);
        console.log('Résultat de l\'enregistrement dans Supabase:', result);
        
        if (!result) {
          console.warn('Aucun résultat retourné par Supabase, sauvegarde dans localStorage');
          // En cas d'échec, sauvegarder en local
          const declarations = loadDeclarations();
          declarations.push(newDeclaration);
          saveDeclarations(declarations);
        }
      } catch (supabaseError) {
        console.error('Erreur lors de l\'enregistrement dans Supabase:', supabaseError);
        // En cas d'erreur, sauvegarder en local
        const declarations = loadDeclarations();
        declarations.push(newDeclaration);
        saveDeclarations(declarations);
      }
    } else {
      console.log('Supabase n\'est pas connecté, sauvegarde dans localStorage');
      // Si Supabase n'est pas connecté, utiliser localStorage
      const declarations = loadDeclarations();
      declarations.push(newDeclaration);
      saveDeclarations(declarations);
    }
    
    // Send notification
    await notifyNewDeclaration(newDeclaration);
    
    return newDeclaration;
  } catch (error) {
    console.error("Error creating declaration with media:", error);
    throw error;
  }
};
