
import { Declaration } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { generateUniqueId } from "./declarationStorage";
import { toast } from "sonner";

const DECLARATIONS_TABLE = 'declarations';

// Helper function to convert our app's Declaration to Supabase format
const convertToSupabaseFormat = (declaration: Declaration) => {
  console.log("supabaseDeclarationStorage: Converting to Supabase format:", declaration);
  console.log("supabaseDeclarationStorage: Media files before conversion:", declaration.mediaFiles);
  
  const mediaFilesString = declaration.mediaFiles && declaration.mediaFiles.length > 0 
    ? JSON.stringify(declaration.mediaFiles) 
    : null;
    
  console.log("supabaseDeclarationStorage: Media files after conversion:", mediaFilesString);
  
  return {
    ...declaration,
    // Convert mediaFiles array to string for Supabase
    mediaFiles: mediaFilesString
  };
};

// Helper function to convert Supabase format back to our app's Declaration
const convertFromSupabaseFormat = (record: any): Declaration => {
  console.log("supabaseDeclarationStorage: Converting from Supabase format:", record);
  
  let mediaFiles = [];
  
  // Parse mediaFiles string back to array
  if (record.mediaFiles) {
    try {
      mediaFiles = JSON.parse(record.mediaFiles);
      console.log("supabaseDeclarationStorage: Parsed media files:", mediaFiles);
    } catch (error) {
      console.error("supabaseDeclarationStorage: Error parsing media files:", error);
      mediaFiles = [];
    }
  }
  
  return {
    ...record,
    mediaFiles
  };
};

// Get all declarations with optional filters
export const getSupabaseDeclarations = async (statusFilter: string | null = null): Promise<Declaration[]> => {
  try {
    if (!supabase) {
      console.error('Supabase non disponible');
      toast.error("Erro de conexão", {
        description: "Não foi possível conectar ao Supabase para obter declarações."
      });
      return [];
    }
    
    let query = supabase.from(DECLARATIONS_TABLE).select('*');
    
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }
    
    const { data, error } = await query.order('submittedAt', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des déclarations:', error);
      toast.error("Erro ao obter declarações", {
        description: error.message
      });
      return [];
    }
    
    console.log('Déclarations récupérées depuis Supabase:', data);
    // Convert from Supabase format to our app's format
    return (data || []).map(convertFromSupabaseFormat);
  } catch (err) {
    console.error('Erreur lors de la récupération des déclarations:', err);
    toast.error("Erro ao processar declarações", {
      description: "Ocorreu um erro inesperado ao processar os dados."
    });
    return [];
  }
};

// Get a declaration by ID
export const getSupabaseDeclarationById = async (id: string): Promise<Declaration | undefined> => {
  try {
    if (!supabase) {
      console.error('Supabase non disponible');
      toast.error("Erro de conexão", {
        description: "Não foi possível conectar ao Supabase para obter a declaração."
      });
      return undefined;
    }
    
    const { data, error } = await supabase
      .from(DECLARATIONS_TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error(`Erreur lors de la récupération de la déclaration ${id}:`, error);
      toast.error("Erro ao obter declaração", {
        description: error.message
      });
      return undefined;
    }
    
    // Convert from Supabase format
    return data ? convertFromSupabaseFormat(data) : undefined;
  } catch (err) {
    console.error(`Erreur lors de la récupération de la déclaration ${id}:`, err);
    toast.error("Erro ao processar declaração", {
      description: "Ocorreu um erro inesperado ao processar os dados."
    });
    return undefined;
  }
};

// Create a new declaration in Supabase
export const createSupabaseDeclaration = async (declaration: Declaration): Promise<Declaration | null> => {
  try {
    if (!supabase) {
      console.error('Supabase non disponible');
      toast.error("Erro de conexão", {
        description: "Não foi possível conectar ao Supabase para criar a declaração."
      });
      throw new Error("Supabase client not available");
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
      
      toast.error("Erro ao salvar no Supabase", {
        description: error.message
      });
      
      throw new Error(`Error creating declaration in Supabase: ${error.message}`);
    }
    
    console.log('Déclaration créée avec succès dans Supabase:', data);
    // Convert from Supabase format
    return convertFromSupabaseFormat(data);
  } catch (err) {
    console.error('Erreur lors de la création de la déclaration:', err);
    
    toast.error("Erro inesperado", {
      description: "Não foi possível salvar a declaração no Supabase."
    });
    
    throw err;
  }
};

// Mettre à jour une déclaration existante
export const updateSupabaseDeclaration = async (id: string, updates: Partial<Declaration>): Promise<Declaration | null> => {
  try {
    if (!supabase) {
      console.error('Supabase non disponible');
      toast.error("Erro de conexão", {
        description: "Não foi possível conectar ao Supabase para atualizar a declaração."
      });
      throw new Error("Supabase client not available");
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
      
      toast.error("Erro ao atualizar declaração", {
        description: error.message
      });
      
      throw new Error(`Error updating declaration: ${error.message}`);
    }
    
    return convertFromSupabaseFormat(data);
  } catch (err) {
    console.error(`Erreur lors de la mise à jour de la déclaration ${id}:`, err);
    
    toast.error("Erro ao atualizar declaração", {
      description: "Ocorreu um erro inesperado."
    });
    
    throw err;
  }
};

// Mettre à jour le statut d'une déclaration
export const updateSupabaseDeclarationStatus = async (id: string, status: Declaration["status"]): Promise<boolean> => {
  try {
    const result = await updateSupabaseDeclaration(id, { status });
    return result !== null;
  } catch (error) {
    return false;
  }
};
