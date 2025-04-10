
import { Declaration } from "../types";
import { getSupabase } from "../supabaseService";
import { loadDeclarations, saveDeclarations } from "../storageService";
import { generateUniqueId } from "./declarationStorage";

const DECLARATIONS_TABLE = 'declarations';

// Fonction pour migrer les déclarations de localStorage vers Supabase
export const migrateDeclarationsToSupabase = async (): Promise<boolean> => {
  try {
    const supabase = getSupabase();
    // Si Supabase n'est pas disponible, on ne tente pas la migration
    if (!supabase) {
      console.log('Supabase non disponible, impossible de migrer les données');
      return false;
    }
    
    const localDeclarations = loadDeclarations();
    
    if (localDeclarations.length === 0) {
      console.log('Aucune déclaration locale à migrer');
      return true;
    }
    
    console.log(`Migration de ${localDeclarations.length} déclarations vers Supabase`);
    
    // Insérer toutes les déclarations dans Supabase
    const { error } = await supabase
      .from(DECLARATIONS_TABLE)
      .upsert(
        localDeclarations.map(decl => ({
          ...decl,
          // Assurer que les champs sont correctement formatés pour Postgres
          created_at: decl.submittedAt,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'id' }
      );
    
    if (error) {
      console.error('Erreur lors de la migration des déclarations vers Supabase:', error);
      return false;
    }
    
    console.log('Migration des déclarations terminée avec succès');
    return true;
  } catch (err) {
    console.error('Erreur lors de la migration des déclarations:', err);
    return false;
  }
};

// Obtenir toutes les déclarations avec filtres optionnels
export const getSupabaseDeclarations = async (statusFilter: string | null = null): Promise<Declaration[]> => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.log('Supabase non disponible, utilisation des données locales');
      return loadDeclarations().filter(d => !statusFilter || d.status === statusFilter)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }
    
    let query = supabase.from(DECLARATIONS_TABLE).select('*');
    
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query.order('submittedAt', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des déclarations:', error);
      // Fallback aux données locales si Supabase échoue
      return loadDeclarations().filter(d => !statusFilter || d.status === statusFilter)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }
    
    return data as Declaration[];
  } catch (err) {
    console.error('Erreur lors de la récupération des déclarations:', err);
    // Fallback aux données locales
    return loadDeclarations().filter(d => !statusFilter || d.status === statusFilter)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }
};

// Obtenir une déclaration par ID
export const getSupabaseDeclarationById = async (id: string): Promise<Declaration | undefined> => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.log('Supabase non disponible, utilisation des données locales');
      return loadDeclarations().find(d => d.id === id);
    }
    
    const { data, error } = await supabase
      .from(DECLARATIONS_TABLE)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erreur lors de la récupération de la déclaration ${id}:`, error);
      // Fallback aux données locales
      return loadDeclarations().find(d => d.id === id);
    }
    
    return data as Declaration;
  } catch (err) {
    console.error(`Erreur lors de la récupération de la déclaration ${id}:`, err);
    // Fallback aux données locales
    return loadDeclarations().find(d => d.id === id);
  }
};

// Mettre à jour une déclaration existante
export const updateSupabaseDeclaration = async (id: string, updates: Partial<Declaration>): Promise<Declaration | null> => {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.log('Supabase non disponible, utilisation des données locales');
      // Fallback à localStorage
      const declarations = loadDeclarations();
      const index = declarations.findIndex(d => d.id === id);
      
      if (index === -1) return null;
      
      declarations[index] = { ...declarations[index], ...updates };
      saveDeclarations(declarations);
      
      return declarations[index];
    }
    
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from(DECLARATIONS_TABLE)
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Erreur lors de la mise à jour de la déclaration ${id}:`, error);
      
      // Fallback à localStorage
      const declarations = loadDeclarations();
      const index = declarations.findIndex(d => d.id === id);
      
      if (index === -1) return null;
      
      declarations[index] = { ...declarations[index], ...updates };
      saveDeclarations(declarations);
      
      return declarations[index];
    }
    
    return data as Declaration;
  } catch (err) {
    console.error(`Erreur lors de la mise à jour de la déclaration ${id}:`, err);
    
    // Fallback à localStorage
    const declarations = loadDeclarations();
    const index = declarations.findIndex(d => d.id === id);
    
    if (index === -1) return null;
    
    declarations[index] = { ...declarations[index], ...updates };
    saveDeclarations(declarations);
    
    return declarations[index];
  }
};

// Mettre à jour le statut d'une déclaration
export const updateSupabaseDeclarationStatus = async (id: string, status: Declaration["status"]): Promise<boolean> => {
  const result = await updateSupabaseDeclaration(id, { status });
  return result !== null;
};
