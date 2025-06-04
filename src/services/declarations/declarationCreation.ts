import { Declaration } from "../types";
import { storeFile } from "../storage/fileStorage";
import { createSupabaseDeclaration } from "./supabaseDeclarationStorage";
import { isSupabaseConnected, createBucketIfNotExists } from "../supabaseService";
import { toast } from "sonner";
import { generateUniqueId } from "./declarationStorage";
import { supabase } from "../../integrations/supabase/client";
import { assignCustomerRole } from "../../hooks/auth/roleService";

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
    
    // Si Supabase n'est pas connecté, renvoyer une erreur
    if (!supabaseConnected) {
      console.error("declarationCreation: Supabase is not connected, cannot create declaration");
      toast.error("Erro de conexão", {
        description: "Não foi possível conectar ao Supabase. Por favor, tente novamente mais tarde."
      });
      throw new Error("Cannot create declaration without Supabase connection");
    }
    
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
      status: "Novo",
      submittedAt: new Date().toISOString(),
      mediaFiles: mediaUrls
    };
    
    // Create declaration in Supabase
    const result = await createSupabaseDeclaration(newDeclaration);
    
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

    // Check if user is authenticated and assign customer role if needed
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Assign customer role if the user doesn't already have one
      await assignCustomerRole(session.user.id);
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
