
import { Declaration } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { convertToSupabaseFormat, convertFromSupabaseFormat } from "./supabaseFormatters";
import { toast } from "sonner";

const DECLARATIONS_TABLE = 'declarations';

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

// Update an existing declaration
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

// Update declaration status
export const updateSupabaseDeclarationStatus = async (id: string, status: Declaration["status"]): Promise<boolean> => {
  try {
    const result = await updateSupabaseDeclaration(id, { status });
    return result !== null;
  } catch (error) {
    return false;
  }
};
