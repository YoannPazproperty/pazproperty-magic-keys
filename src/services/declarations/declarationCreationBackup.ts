
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
    console.log("declarationCreation: Ensuring bucket exists before proceeding...");
    await createBucketIfNotExists('declaration-media');
    
    // Check if Supabase is connected
    console.log("declarationCreation: Checking Supabase connection status...");
    const supabaseConnected = await isSupabaseConnected();
    console.log("declarationCreation: Supabase connection status:", supabaseConnected);
    
    // Store files and get their URLs
    console.log(`declarationCreation: Starting storage of ${mediaFiles.length} files...`);
    
    const mediaUrls = await Promise.all(
      mediaFiles.map(async (file) => {
        console.log(`declarationCreation: Storing file: ${file.name}`);
        const url = await storeFile(file);
        console.log(`declarationCreation: File stored with URL: ${url}`);
        return url;
      })
    );
    
    console.log("declarationCreation: All files stored, URLs:", mediaUrls);
    
    // Create new declaration object
    const newDeclaration: Declaration = {
      ...declarationData,
      id: generateUniqueId(),
      status: "Novo", // Update from "pending" to "Novo"
      submittedAt: new Date().toISOString(),
      mediaFiles: mediaUrls  // Changé de string à string[]
    };
    
    console.log("declarationCreation: New declaration created:", newDeclaration);
    console.log("declarationCreation: Media files in declaration:", newDeclaration.mediaFiles);
    
    if (supabaseConnected) {
      console.log("declarationCreation: Supabase is connected, saving to Supabase...");
      try {
        // Create declaration in Supabase
        const result = await createSupabaseDeclaration(newDeclaration);
        console.log("declarationCreation: Result from Supabase save:", result);
        
        if (!result) {
          console.warn("declarationCreation: No result from Supabase, saving to localStorage as fallback");
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
      console.log("declarationCreation: Supabase is not connected, saving to localStorage");
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
