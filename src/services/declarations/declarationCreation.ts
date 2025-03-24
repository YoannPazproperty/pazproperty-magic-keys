
import { Declaration } from "../types";
import { saveDeclarations, loadDeclarations } from "../storageService";
import { generateUniqueId } from "./declarationStorage";
import { notifyNewDeclaration } from "./declarationNotification";

// Create a new declaration with media files
export const addWithMedia = async (
  declarationData: Omit<Declaration, 'id' | 'status' | 'submittedAt'>,
  mediaFiles: File[]
): Promise<Declaration> => {
  const newDeclaration: Declaration = {
    ...declarationData,
    id: generateUniqueId(),
    status: "pending",
    submittedAt: new Date().toISOString(),
    mediaFiles: []
  };
  
  const declarations = loadDeclarations();
  declarations.push(newDeclaration);
  saveDeclarations(declarations);
  
  // Send notification
  await notifyNewDeclaration(newDeclaration);
  
  return newDeclaration;
};
