
import { supabase } from "../../../integrations/supabase/client";
import type { CompanyUser, GetCompanyUsersResult } from "./types";

export const getCompanyUsers = async (): Promise<GetCompanyUsersResult> => {
  try {
    console.log("Fetching company users...");
    
    const { data: companyUsers, error } = await supabase
      .from('company_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching company users:", error);
      return {
        success: false,
        error,
        message: "Erreur lors de la récupération des utilisateurs"
      };
    }

    const users: CompanyUser[] = (companyUsers || []).map(user => ({
      id: user.id,
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      level: user.level as CompanyUser['level'],
      created_at: user.created_at || new Date().toISOString()
    }));

    console.log("Company users fetched successfully:", users);

    return {
      success: true,
      users
    };
  } catch (error) {
    console.error("Exception fetching company users:", error);
    return {
      success: false,
      error,
      message: "Erreur lors de la récupération des utilisateurs"
    };
  }
};

export const getCompanyUserById = async (userId: string): Promise<CompanyUser | null> => {
  try {
    const { data: user, error } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error("Error fetching company user:", error);
      return null;
    }

    return {
      id: user.id,
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      level: user.level as CompanyUser['level'],
      created_at: user.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error("Exception fetching company user:", error);
    return null;
  }
};
