
import { Declaration } from "../types";
import { loadDeclarations, saveDeclarations } from "../storageService";
import { 
  getSupabaseDeclarations,
  getSupabaseDeclarationById, 
  updateSupabaseDeclaration,
  updateSupabaseDeclarationStatus
} from "./supabaseDeclarationStorage";
import { isSupabaseConnected } from "../supabaseService";

// Generate unique ID for new declarations
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Get all declarations with optional filters
export const getDeclarations = async (statusFilter: string | null = null): Promise<Declaration[]> => {
  // Vérifier si Supabase est connecté
  const supabaseConnected = await isSupabaseConnected();
  
  if (supabaseConnected) {
    try {
      return await getSupabaseDeclarations(statusFilter);
    } catch (err) {
      console.error("Erreur lors de la récupération des déclarations depuis Supabase:", err);
      // Fallback au localStorage en cas d'erreur
    }
  }
  
  // Utiliser localStorage si Supabase n'est pas disponible
  let declarations = loadDeclarations();
  
  if (statusFilter) {
    declarations = declarations.filter(decl => decl.status === statusFilter);
  }
  
  // Sort by submission date, newest first
  return declarations.sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
};

// Get a single declaration by ID
export const getDeclarationById = async (id: string): Promise<Declaration | undefined> => {
  // Vérifier si Supabase est connecté
  const supabaseConnected = await isSupabaseConnected();
  
  if (supabaseConnected) {
    try {
      return await getSupabaseDeclarationById(id);
    } catch (err) {
      console.error(`Erreur lors de la récupération de la déclaration ${id} depuis Supabase:`, err);
      // Fallback au localStorage en cas d'erreur
    }
  }
  
  // Utiliser localStorage si Supabase n'est pas disponible
  const declarations = loadDeclarations();
  return declarations.find(decl => decl.id === id);
};

// Update an existing declaration
export const updateDeclaration = async (id: string, updates: Partial<Declaration>): Promise<Declaration | null> => {
  // Vérifier si Supabase est connecté
  const supabaseConnected = await isSupabaseConnected();
  
  if (supabaseConnected) {
    try {
      return await updateSupabaseDeclaration(id, updates);
    } catch (err) {
      console.error(`Erreur lors de la mise à jour de la déclaration ${id} dans Supabase:`, err);
      // Fallback au localStorage en cas d'erreur
    }
  }
  
  // Utiliser localStorage si Supabase n'est pas disponible
  const declarations = loadDeclarations();
  const index = declarations.findIndex(decl => decl.id === id);
  
  if (index === -1) return null;
  
  // Update the declaration
  declarations[index] = {
    ...declarations[index],
    ...updates,
  };
  
  saveDeclarations(declarations);
  
  return declarations[index];
};

// Update declaration status 
export const updateDeclarationStatus = async (id: string, status: Declaration["status"]): Promise<boolean> => {
  // Vérifier si Supabase est connecté
  const supabaseConnected = await isSupabaseConnected();
  
  if (supabaseConnected) {
    try {
      return await updateSupabaseDeclarationStatus(id, status);
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du statut de la déclaration ${id} dans Supabase:`, err);
      // Fallback au localStorage en cas d'erreur
    }
  }
  
  // Utiliser localStorage si Supabase n'est pas disponible
  const result = updateDeclaration(id, { status });
  return result !== null;
};
