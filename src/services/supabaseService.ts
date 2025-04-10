
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Declaration, NotificationPreference, TechnicianReport } from './types';

// Le client Supabase est créé automatiquement lors de l'initialisation de la page
// via l'intégration native de Lovable avec Supabase
let supabase: SupabaseClient;

// Tables dans Supabase
const DECLARATIONS_TABLE = 'declarations';
const NOTIFICATION_PREFS_TABLE = 'notification_preferences';
const MONDAY_CONFIG_TABLE = 'monday_configs';
const MEDIA_FILES_TABLE = 'media_files';
const TECHNICIAN_REPORTS_TABLE = 'technician_reports';

// Initialisation du client Supabase
export const initSupabase = () => {
  // @ts-ignore - Ces variables sont injectées par l'intégration Lovable-Supabase
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  // @ts-ignore - Ces variables sont injectées par l'intégration Lovable-Supabase
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Les variables d\'environnement Supabase ne sont pas définies');
    return null;
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
};

// Obtenir le client Supabase ou l'initialiser s'il n'existe pas
export const getSupabase = (): SupabaseClient => {
  if (!supabase) {
    return initSupabase()!;
  }
  return supabase;
};

// Fonction pour vérifier si la connexion à Supabase est établie
export const isSupabaseConnected = async (): Promise<boolean> => {
  try {
    const supabase = getSupabase();
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
    const supabase = getSupabase();
    
    // Cette fonction serait normalement utilisée si on créait des tables via des requêtes SQL
    // Avec Supabase, nous allons plutôt créer les tables via l'interface web de Supabase
    // On la garde ici au cas où nous aurions besoin de migrations ou de modifications futures
    
    console.log('Vérification de la connexion à Supabase...');
    const isConnected = await isSupabaseConnected();
    
    if (isConnected) {
      console.log('Connexion à Supabase établie avec succès');
    } else {
      console.error('Impossible de se connecter à Supabase');
    }
    
    return isConnected;
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de la base de données:', err);
    return false;
  }
};
