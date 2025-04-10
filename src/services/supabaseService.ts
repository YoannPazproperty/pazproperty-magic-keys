
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

// Fonction pour vérifier si la connexion à Supabase est établie
export const isSupabaseConnected = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    console.log('Vérification de la connexion à Supabase...');
    
    // Faire une requête simple pour tester la connexion
    const { data, error } = await supabase
      .from('declarations')
      .select('count()', { count: 'exact', head: true });
    
    if (error) {
      console.error('Erreur lors de la vérification de la connexion à Supabase:', error);
      return false;
    }
    
    console.log('Connexion à Supabase établie avec succès');
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
