
import { Declaration } from "../types";
import { saveDeclarations, loadDeclarations } from "../storageService";
import { generateUniqueId } from "./declarationStorage";
import { notifyNewDeclaration } from "./declarationNotification";
import { storeFile } from "../storage/fileStorage";
import { createSupabaseDeclaration } from "./supabaseDeclarationStorage";
import { isSupabaseConnected, getSupabase } from "../supabaseService";

// Fonction pour s'assurer que le bucket existe
const ensureMediaBucketExists = async (): Promise<boolean> => {
  try {
    const supabase = getSupabase();
    if (!supabase) return false;
    
    const bucketName = 'declaration-media';
    
    // Vérifier si le bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Erreur lors de la vérification des buckets:", listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Le bucket ${bucketName} existe déjà.`);
      return true;
    }
    
    // Créer le bucket s'il n'existe pas
    console.log(`Création du bucket ${bucketName}...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true
    });
    
    if (createError) {
      console.error("Erreur lors de la création du bucket:", createError);
      return false;
    }
    
    console.log(`Bucket ${bucketName} créé avec succès.`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification/création du bucket:", error);
    return false;
  }
};

// Create a new declaration with media files
export const addWithMedia = async (
  declarationData: Omit<Declaration, 'id' | 'status' | 'submittedAt'>,
  mediaFiles: File[]
): Promise<Declaration> => {
  try {
    // Vérifier si Supabase est connecté
    const supabaseConnected = await isSupabaseConnected();
    
    // S'assurer que le bucket existe si Supabase est connecté
    if (supabaseConnected) {
      await ensureMediaBucketExists();
    }
    
    // Stocker les fichiers et obtenir leurs URLs
    console.log(`Début du stockage de ${mediaFiles.length} fichiers...`);
    const mediaUrls = await Promise.all(
      mediaFiles.map(file => storeFile(file))
    );
    console.log("URLs des fichiers stockés:", mediaUrls);
    
    const newDeclaration: Declaration = {
      ...declarationData,
      id: generateUniqueId(),
      status: "pending",
      submittedAt: new Date().toISOString(),
      mediaFiles: mediaUrls
    };
    
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
