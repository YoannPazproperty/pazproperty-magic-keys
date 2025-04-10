
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Declaration, NotificationPreference, TechnicianReport } from './types';

// Le client Supabase est créé automatiquement lors de l'initialisation de la page
// via l'intégration native de Lovable avec Supabase
let supabase: SupabaseClient;
let isSupabaseAvailable = false;

// Tables dans Supabase
const DECLARATIONS_TABLE = 'declarations';
const NOTIFICATION_PREFS_TABLE = 'notification_preferences';
const MONDAY_CONFIG_TABLE = 'monday_configs';
const MEDIA_FILES_TABLE = 'media_files';
const TECHNICIAN_REPORTS_TABLE = 'technician_reports';

// Initialisation du client Supabase
export const initSupabase = () => {
  // Ces variables peuvent être définies soit par l'intégration Lovable-Supabase
  // soit par notre méthode de secours avec localStorage
  try {
    // @ts-ignore - Ces variables sont injectées par l'intégration Lovable-Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    // @ts-ignore - Ces variables sont injectées par l'intégration Lovable-Supabase
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('Variables d\'environnement Supabase non disponibles - utilisation du mode localStorage uniquement');
      isSupabaseAvailable = false;
      return null;
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    isSupabaseAvailable = true;
    console.log('Client Supabase initialisé avec succès');
    return supabase;
  } catch (error) {
    console.log('Erreur lors de l\'initialisation de Supabase - mode localStorage uniquement:', error);
    isSupabaseAvailable = false;
    return null;
  }
};

// Obtenir le client Supabase ou l'initialiser s'il n'existe pas
export const getSupabase = (): SupabaseClient | null => {
  if (!supabase && isSupabaseAvailable) {
    return initSupabase();
  }
  return supabase || null;
};

// Fonction pour vérifier si la connexion à Supabase est établie
export const isSupabaseConnected = async (): Promise<boolean> => {
  if (!isSupabaseAvailable) return false;
  
  try {
    const supabase = getSupabase();
    if (!supabase) return false;
    
    const { data, error } = await supabase.from(DECLARATIONS_TABLE).select('count()', { count: 'exact', head: true });
    
    return !error;
  } catch (err) {
    console.error('Erreur lors de la vérification de la connexion à Supabase:', err);
    return false;
  }
};

// Fonction pour créer les tables si elles n'existent pas
export const initializeDatabase = async () => {
  try {
    // Vérifier si Supabase est disponible
    if (!isSupabaseAvailable) {
      console.log('Supabase n\'est pas disponible - utilisation du localStorage uniquement');
      return false;
    }
    
    const supabase = getSupabase();
    if (!supabase) {
      console.log('Client Supabase non disponible - utilisation du localStorage uniquement');
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
