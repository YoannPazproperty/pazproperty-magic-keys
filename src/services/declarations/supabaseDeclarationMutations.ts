import { Declaration } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { convertToSupabaseFormat, convertFromSupabaseFormat } from "./supabaseFormatters";
import { toast } from "sonner";

const DECLARATIONS_TABLE = 'declarations';

// Status mapping from app statuses to Supabase enum values
const supabaseStatusMap: Record<string, string> = {
  NEW: "Novo",
  TRANSMITTED: "Transmitido",
  AWAITING_DIAGNOSTIC: "Em espera do encontro de diagnostico",
  DIAGNOSTIC_SCHEDULED: "Encontramento de diagnostico planeado",
  CANCELLED: "Annulé",
  QUOTE_RECEIVED: "Orçamento recebido",
  IN_REPAIR: "Em curso de reparação",
  RESOLVED: "Resolvido",
  // Direct mappings
  "Novo": "Novo",
  "Transmitido": "Transmitido",
  "Orçamento recebido": "Orçamento recebido",
  "Em cours de reparação": "Em cours de reparação",
  "Resolvido": "Resolvido",
  "Em espera do encontro de diagnostico": "Em espera do encontro de diagnostico",
  "Encontramento de diagnostico planeado": "Encontramento de diagnostico planeado",
  "Annulé": "Annulé"
};

// Helper with explicit return type to silence TS errors
const mapStatusToSupabase = (
  status: string
): "Novo" | "Transmitido" | "Orçamento recebido" | "Em cours de reparação" |
   "Resolvido" | "Em espera do encontro de diagnostico" |
   "Encontramento de diagnostico planeado" | "Annulé" => {
  return supabaseStatusMap[status] || "Novo";
};

// Create a new declaration
export const createSupabaseDeclaration = async (declaration: Declaration): Promise<Declaration | null> => {
  try {
    if (!supabase) {
      toast.error("Erreur de connexion", {
        description: "Supabase non disponible pour la création."
      });
      throw new Error("Supabase client not available");
    }

    const supabaseDeclaration = {
      ...convertToSupabaseFormat(declaration),
      status: mapStatusToSupabase(declaration.status)
    };

    const { data, error } = await supabase
      .from(DECLARATIONS_TABLE)
      .insert(supabaseDeclaration)
      .select()
      .single();

    if (error) {
      toast.error("Erreur Supabase", { description: error.message });
      console.error("❌ Erreur insert Supabase :", supabaseDeclaration, error);
      throw new Error(error.message);
    }

    return convertFromSupabaseFormat(data);
  } catch (err) {
    console.error("❌ Erreur de création de déclaration :", err);
    toast.error("Erreur inattendue", {
      description: "Échec de la création de la déclaration."
    });
    throw err;
  }
};

// Update an existing declaration
export const updateSupabaseDeclaration = async (
  id: string,
  updates: Partial<Declaration>
): Promise<Declaration | null> => {
  try {
    if (!supabase) {
      toast.error("Erreur de connexion", {
        description: "Supabase non disponible pour la mise à jour."
      });
      throw new Error("Supabase client not available");
    }

    const supabaseUpdates: any = { ...updates };

    if (updates.mediaFiles !== undefined) {
      supabaseUpdates.mediaFiles = updates.mediaFiles.length > 0
        ? JSON.stringify(updates.mediaFiles)
        : null;
    }

    if (updates.status) {
      supabaseUpdates.status = mapStatusToSupabase(updates.status as string);
    }

    const { data, error } = await supabase
      .from(DECLARATIONS_TABLE)
      .update(supabaseUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      toast.error("Erreur Supabase", { description: error.message });
      console.error("❌ Erreur update Supabase :", supabaseUpdates, error);
      throw new Error(error.message);
    }

    return convertFromSupabaseFormat(data);
  } catch (err) {
    console.error("❌ Erreur de mise à jour de déclaration :", err);
    toast.error("Erreur inattendue", {
      description: "Échec de la mise à jour."
    });
    throw err;
  }
};

// Update only the status
export const updateSupabaseDeclarationStatus = async (
  id: string,
  status: Declaration["status"]
): Promise<boolean> => {
  try {
    const result = await updateSupabaseDeclaration(id, { status });
    return result !== null;
  } catch {
    return false;
  }
};