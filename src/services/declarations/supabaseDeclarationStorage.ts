
import { Declaration } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { loadDeclarations, saveDeclarations } from "../storageService";
import { generateUniqueId } from "./declarationStorage";

const DECLARATIONS_TABLE = 'declarations';

// Helper function to convert our app's Declaration to Supabase format
const convertToSupabaseFormat = (declaration: Declaration) => {
  return {
    ...declaration,
    // Convert mediaFiles array to string for Supabase
    mediaFiles: declaration.mediaFiles && declaration.mediaFiles.length > 0 
      ? JSON.stringify(declaration.mediaFiles) 
      : null
  };
};

// Helper function to convert Supabase format back to our app's Declaration
const convertFromSupabaseFormat = (record: any): Declaration => {
  return {
    ...record,
    // Parse mediaFiles string back to array
    mediaFiles: record.mediaFiles ? JSON.parse(record.mediaFiles) : []
  };
};

// Fonction pour migrer les déclarations de localStorage vers Supabase
export const migrateDeclarationsToSupabase = async (): Promise<boolean> => {
  try {
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
    
    // Convert declarations to Supabase format before inserting
    const supabaseFormattedDeclarations = localDeclarations.map(convertToSupabaseFormat);
    
    // Insérer toutes les déclarations dans Supabase
    const { error } = await supabase
      .from(DECLARATIONS_TABLE)
      .upsert(supabaseFormattedDeclarations, { onConflict: 'id' });
    
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
    
    console.log('Déclarations récupérées depuis Supabase:', data);
    // Convert from Supabase format to our app's format
    return (data || []).map(convertFromSupabaseFormat);
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
    
    // Convert from Supabase format
    return data ? convertFromSupabaseFormat(data) : undefined;
  } catch (err) {
    console.error(`Erreur lors de la récupération de la déclaration ${id}:`, err);
    // Fallback aux données locales
    return loadDeclarations().find(d => d.id === id);
  }
};

// Créer une nouvelle déclaration dans Supabase
export const createSupabaseDeclaration = async (declaration: Declaration): Promise<Declaration | null> => {
  try {
    if (!supabase) {
      console.log('Supabase non disponible, utilisation des données locales');
      // Fallback au stockage local
      const declarations = loadDeclarations();
      declarations.push(declaration);
      saveDeclarations(declarations);
      return declaration;
    }
    
    console.log('Tentative de création de déclaration dans Supabase:', declaration);
    
    // Convert to Supabase format
    const supabaseDeclaration = convertToSupabaseFormat(declaration);
    
    console.log('Format Supabase de la déclaration:', supabaseDeclaration);
    
    const { data, error } = await supabase
      .from(DECLARATIONS_TABLE)
      .insert(supabaseDeclaration)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création de la déclaration dans Supabase:', error);
      console.error('Détails de la déclaration qui a échoué:', supabaseDeclaration);
      
      // Fallback au stockage local
      const declarations = loadDeclarations();
      declarations.push(declaration);
      saveDeclarations(declarations);
      
      return declaration;
    }
    
    console.log('Déclaration créée avec succès dans Supabase:', data);
    // Convert from Supabase format
    return convertFromSupabaseFormat(data);
  } catch (err) {
    console.error('Erreur lors de la création de la déclaration:', err);
    
    // Fallback au stockage local
    const declarations = loadDeclarations();
    declarations.push(declaration);
    saveDeclarations(declarations);
    
    return declaration;
  }
};

// Mettre à jour une déclaration existante
export const updateSupabaseDeclaration = async (id: string, updates: Partial<Declaration>): Promise<Declaration | null> => {
  try {
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
    
    // Create a supabase-compatible update object
    const supabaseUpdates: any = { ...updates };
    
    // If mediaFiles is included in the updates, convert it
    if (updates.mediaFiles !== undefined) {
      supabaseUpdates.mediaFiles = updates.mediaFiles && updates.mediaFiles.length > 0 
        ? JSON.stringify(updates.mediaFiles) 
        : null;
    }
    
    const { data, error } = await supabase
      .from(DECLARATIONS_TABLE)
      .update(supabaseUpdates)
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
    
    return convertFromSupabaseFormat(data);
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
