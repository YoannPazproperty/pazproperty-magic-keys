
import { Declaration } from "../types";
import { saveDeclarations, loadDeclarations } from "../storageService";
import { generateUniqueId } from "./declarationStorage";
import { notifyNewDeclaration } from "./declarationNotification";
import { storeFile } from "../storage/fileStorage";
import { createSupabaseDeclaration } from "./supabaseDeclarationStorage";
import { isSupabaseConnected, createBucketIfNotExists } from "../supabaseService";
import { toast } from "sonner";

// Create a new declaration with media files
export const addWithMedia = async (
  declarationData: Omit<Declaration, 'id' | 'status' | 'submittedAt'>,
  mediaFiles: File[]
): Promise<Declaration> => {
  try {
    // First, make sure the bucket exists
    await createBucketIfNotExists('declaration-media');
    
    // Check if Supabase is connected
    const supabaseConnected = await isSupabaseConnected();
    
    // Store files and get their URLs
    const mediaUrls = await Promise.all(
      mediaFiles.map(async (file) => {
        const url = await storeFile(file);
        return url;
      })
    );
    
    // Create new declaration object
    const newDeclaration: Declaration = {
      ...declarationData,
      id: generateUniqueId(),
      status: "Novo", // Update from "pending" to "Novo"
      submittedAt: new Date().toISOString(),
      mediaFiles: mediaUrls  // Changé de string à string[]
    };
    
    if (supabaseConnected) {
      try {
        // Create declaration in Supabase
        const result = await createSupabaseDeclaration(newDeclaration);
        
        if (!result) {
          // If failed, save to localStorage as fallback
          const declarations = loadDeclarations();
          declarations.push(newDeclaration);
          saveDeclarations(declarations);
          
          toast.warning("Declaração salva localmente", {
            description: "Não foi possível salvar no Supabase. Os dados serão sincronizados mais tarde."
          });
        } else {
          toast.success("Declaração salva com sucesso", {
            description: "Sua declaração foi registrada no Supabase."
          });
          
          // Send notification with the declaration ID only after successful save
          await notifyNewDeclaration(newDeclaration.id);
        }
      } catch (supabaseError) {
        console.error("declarationCreation: Error saving to Supabase:", supabaseError);
        // In case of error, save locally
        const declarations = loadDeclarations();
        declarations.push(newDeclaration);
        saveDeclarations(declarations);
        
        toast.warning("Erro ao salvar no Supabase", {
          description: "Declaração salva localmente. Será sincronizada mais tarde."
        });
      }
    } else {
      // If Supabase is not connected, use localStorage
      const declarations = loadDeclarations();
      declarations.push(newDeclaration);
      saveDeclarations(declarations);
      
      toast.info("Salvo no modo offline", {
        description: "Declaração salva localmente. Será sincronizada quando houver conexão."
      });
      
      // Only send notification if we have an ID, even in offline mode
      await notifyNewDeclaration(newDeclaration.id);
    }
    
    return newDeclaration;
  } catch (error) {
    console.error("declarationCreation: Error creating declaration with media:", error);
    toast.error("Erro ao criar declaração", {
      description: "Ocorreu um erro inesperado ao processar sua declaração."
    });
    throw error;
  }
};
