
import { Declaration } from "../types";
import { 
  getSupabaseDeclarations,
  getSupabaseDeclarationById, 
  updateSupabaseDeclaration,
  updateSupabaseDeclarationStatus
} from "./supabaseDeclarationStorage";
import { isSupabaseConnected } from "../supabaseService";
import { toast } from "sonner";

// Generate unique ID for new declarations
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Get all declarations with optional filters
export const getDeclarations = async (statusFilter: Declaration["status"] | null = null): Promise<Declaration[]> => {
  // Vérifier si Supabase est connecté
  const supabaseConnected = await isSupabaseConnected();
  
  if (!supabaseConnected) {
    console.error("declarationStorage: Supabase not connected, cannot get declarations");
    toast.error("Erro de conexão", {
      description: "Não foi possível conectar ao Supabase para obter declarações."
    });
    return [];
  }
  
  try {
    return await getSupabaseDeclarations(statusFilter);
  } catch (err) {
    console.error("declarationStorage: Error getting declarations from Supabase:", err);
    toast.error("Erro ao obter declarações", {
      description: "Ocorreu um erro ao obter declarações."
    });
    return [];
  }
};

// Get a single declaration by ID
export const getDeclarationById = async (id: string): Promise<Declaration | undefined> => {
  // Vérifier si Supabase est connecté
  const supabaseConnected = await isSupabaseConnected();
  
  if (!supabaseConnected) {
    console.error("declarationStorage: Supabase not connected, cannot get declaration");
    toast.error("Erro de conexão", {
      description: "Não foi possível conectar ao Supabase para obter a declaração."
    });
    return undefined;
  }
  
  try {
    return await getSupabaseDeclarationById(id);
  } catch (err) {
    console.error(`declarationStorage: Error getting declaration ${id} from Supabase:`, err);
    toast.error("Erro ao obter declaração", {
      description: "Ocorreu um erro ao obter a declaração."
    });
    return undefined;
  }
};

// Update an existing declaration
export const updateDeclaration = async (id: string, updates: Partial<Declaration>): Promise<Declaration | null> => {
  // Vérifier si Supabase est connecté
  const supabaseConnected = await isSupabaseConnected();
  
  if (!supabaseConnected) {
    console.error("declarationStorage: Supabase not connected, cannot update declaration");
    toast.error("Erro de conexão", {
      description: "Não foi possível conectar ao Supabase para atualizar a declaração."
    });
    return null;
  }
  
  try {
    return await updateSupabaseDeclaration(id, updates);
  } catch (err) {
    console.error(`declarationStorage: Error updating declaration ${id} in Supabase:`, err);
    toast.error("Erro ao atualizar declaração", {
      description: "Ocorreu um erro ao atualizar a declaração."
    });
    return null;
  }
};

// Update declaration status 
export const updateDeclarationStatus = async (id: string, status: Declaration["status"]): Promise<boolean> => {
  // Vérifier si Supabase est connecté
  const supabaseConnected = await isSupabaseConnected();
  
  if (!supabaseConnected) {
    console.error("declarationStorage: Supabase not connected, cannot update declaration status");
    toast.error("Erro de conexão", {
      description: "Não foi possível conectar ao Supabase para atualizar o status da declaração."
    });
    return false;
  }
  
  try {
    return await updateSupabaseDeclarationStatus(id, status);
  } catch (err) {
    console.error(`declarationStorage: Error updating declaration status ${id} in Supabase:`, err);
    toast.error("Erro ao atualizar status", {
      description: "Ocorreu um erro ao atualizar o status da declaração."
    });
    return false;
  }
};
