
import { Declaration } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { convertFromSupabaseFormat } from "./supabaseFormatters";
import { toast } from "sonner";

const DECLARATIONS_TABLE = 'declarations';

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
