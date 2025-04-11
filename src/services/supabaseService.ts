
import { supabase } from '@/integrations/supabase/client';

// Fonction pour initialiser le client Supabase
export const initSupabase = () => {
  try {
    if (!supabase) {
      console.error('Supabase n\'est pas initialisé.');
      return null;
    }
    console.log('Supabase client initialisé');
    return supabase;
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de Supabase:', err);
    return null;
  }
};

// Fonction pour créer un bucket s'il n'existe pas
export const createBucketIfNotExists = async (bucketName: string) => {
  if (!supabase) return false;
  
  try {
    console.log(`Vérification de l'existence du bucket "${bucketName}"...`);
    
    // Vérifier si le bucket existe déjà
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erreur lors de la vérification des buckets:', listError);
      return false;
    }
    
    const bucketExists = existingBuckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Le bucket "${bucketName}" existe déjà.`);
      return true;
    }
    
    // Créer le bucket s'il n'existe pas
    console.log(`Création du bucket "${bucketName}"...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true
    });
    
    if (createError) {
      console.error(`Erreur lors de la création du bucket "${bucketName}":`, createError);
      return false;
    }
    
    console.log(`Bucket "${bucketName}" créé avec succès.`);
    return true;
  } catch (err) {
    console.error(`Erreur lors de la création du bucket "${bucketName}":`, err);
    return false;
  }
};

// Fonction pour vérifier si la connexion à Supabase est établie
export const isSupabaseConnected = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    console.log('Vérification de la connexion à Supabase...');
    
    // Tester avec une requête simple pour vérifier la connexion à la DB
    const { data, error } = await supabase
      .from('declarations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Erreur lors de la vérification de la connexion à Supabase:', error);
      return false;
    }
    
    // Essayer de créer le bucket declaration-media s'il n'existe pas
    const bucketName = 'declaration-media';
    const bucketCreated = await createBucketIfNotExists(bucketName);
    
    if (!bucketCreated) {
      console.error(`Impossible de créer ou vérifier le bucket "${bucketName}"`);
      return false;
    }
    
    console.log('Connexion à Supabase établie avec succès.');
    return true;
  } catch (err) {
    console.error('Erreur lors de la vérification de la connexion à Supabase:', err);
    return false;
  }
};

// Fonction pour obtenir le client Supabase
export const getSupabase = () => {
  return supabase;
};

// Fonction pour initialiser la base de données
export const initializeDatabase = async () => {
  try {
    // Vérifier si Supabase est disponible
    if (!supabase) {
      console.log('Supabase n\'est pas disponible - utilisation du localStorage uniquement');
      return false;
    }
    
    console.log('Vérification de la connexion à Supabase...');
    const isConnected = await isSupabaseConnected();
    
    if (isConnected) {
      console.log('Connexion à Supabase établie avec succès');
      return true;
    } else {
      console.log('Impossible de se connecter à Supabase - utilisation du localStorage uniquement');
      return false;
    }
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de la base de données:', err);
    return false;
  }
};
