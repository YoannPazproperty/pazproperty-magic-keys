
import { Declaration } from "../types";
import { notifyNewDeclaration } from "./declarationNotification";
import { storeFile } from "../storage/fileStorage";
import { createSupabaseDeclaration } from "./supabaseDeclarationStorage";
import { isSupabaseConnected, createBucketIfNotExists } from "../supabaseService";
import { toast } from "sonner";
import { generateUniqueId } from "./declarationStorage";

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
    
    // Si Supabase n'est pas connecté, renvoyer une erreur
    if (!supabaseConnected) {
      console.error("declarationCreation: Supabase is not connected, cannot create declaration");
      toast.error("Erro de conexão", {
        description: "Não foi possível conectar ao Supabase. Por favor, tente novamente mais tarde."
      });
      throw new Error("Cannot create declaration without Supabase connection");
    }
    
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
      mediaFiles: mediaUrls
    };
    
    console.log("declarationCreation: New declaration created:", newDeclaration);
    console.log("declarationCreation: Media files in declaration:", newDeclaration.mediaFiles);
    
    // Create declaration in Supabase
    const result = await createSupabaseDeclaration(newDeclaration);
    console.log("declarationCreation: Result from Supabase save:", result);
    
    if (!result) {
      console.error("declarationCreation: Failed to save to Supabase");
      toast.error("Erro ao salvar declaração", {
        description: "Não foi possível salvar sua declaração. Por favor, tente novamente."
      });
      throw new Error("Failed to save declaration to Supabase");
    } 
    
    toast.success("Declaração salva com sucesso", {
      description: "Sua declaração foi registrada no Supabase."
    });
    
    // Send notification
    await notifyNewDeclaration(newDeclaration);
    
    return newDeclaration;
  } catch (error) {
    console.error("declarationCreation: Error creating declaration with media:", error);
    toast.error("Erro ao criar declaração", {
      description: "Ocorreu um erro inesperado ao processar sua declaração."
    });
    throw error;
  }
};
