import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "./types";

export const fetchUserRole = async (userId: string): Promise<UserRole> => {
  try {
    const { data: roleData, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (error || !roleData) return null;

    return roleData.role as UserRole;
  } catch (err) {
    console.error("Error fetching user role:", err);
    return null;
  }
};

export const getEmailDomain = (email: string | null | undefined): string | null => {
  return email?.split("@")[1] || null;
};

export const resolveRedirectPathByRole = (role: UserRole, email: string | null | undefined): string => {
  if (email?.endsWith("@pazproperty.pt")) return "/admin";

  switch (role) {
    case "admin":
      return "/admin";
    case "provider":
      return "/extranet-technique";
    case "customer":
      return "/area-cliente";
    default:
      return "/";
  }
};