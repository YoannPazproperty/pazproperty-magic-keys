import { Declaration } from "../types";
import { saveDeclarations, loadDeclarations } from "../storageService";
import { generateUniqueId } from "./declarationStorage";
import { notifyNewDeclaration } from "./declarationNotification";
import { storeFile } from "../storage/fileStorage";

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
    
    const declarations = loadDeclarations();
    declarations.push(newDeclaration);
    saveDeclarations(declarations);
    
    // Send notification
    await notifyNewDeclaration(newDeclaration);
    
    return newDeclaration;
  } catch (error) {
    console.error("Error creating declaration with media:", error);
    throw error;
  }
};
