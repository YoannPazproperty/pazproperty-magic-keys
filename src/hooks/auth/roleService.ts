import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "./types";

export const fetchUserRole = async (userId: string): Promise<UserRole> => {
  try {
    console.log("Retrieving role for user:", userId);
    
    // First check if the user is a technical service provider (prestadores_tecnicos)
    const { data: prestadorRole, error: prestadorError } = await supabase
      .from('prestadores_roles')
      .select('nivel')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (prestadorRole) {
      console.log("User identified as an external service provider:", prestadorRole);
      return 'provider'; // Map prestadores_tecnicos to provider role
    }
    
    // If not a service provider, check for internal roles
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
      
    if (error) {
      console.error("Error retrieving role:", error);
      
      // Check if error is due to lack of records
      if (error.code === 'PGRST116') {
        console.log("No role found for the user, assigning default role");
        
        // Get user email to check domain
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        const userEmail = userData?.user?.email || '';
        
        console.log("User email for role assignment:", userEmail);
        
        // Check if user has a pazproperty.pt email address
        if (userEmail.endsWith('@pazproperty.pt')) {
          // Assign admin role for @pazproperty.pt emails
          console.log("Assigning admin role for @pazproperty.pt email");
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({ 
              user_id: userId,
              role: 'admin' as UserRole
            });
            
          if (insertError) {
            console.error("Error assigning admin role:", insertError);
          } else {
            console.log("'admin' role automatically assigned for @pazproperty.pt address");
            return 'admin';
          }
        } else {
          // Check if user metadata indicates this is a provider
          if (userData?.user?.user_metadata?.is_provider) {
            // This is a provider based on metadata
            console.log("User metadata indicates provider role");
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ 
                user_id: userId,
                role: 'provider' as UserRole
              });
              
            if (insertError) {
              console.error("Error assigning provider role:", insertError);
            } else {
              console.log("'provider' role assigned based on user metadata");
              return 'provider';
            }
          } else {
            // Assign default role (user) for others
            console.log("No specific role indicators, assigning default 'user' role");
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ 
                user_id: userId,
                role: 'user' as UserRole
              });
              
            if (insertError) {
              console.error("Error assigning default role:", insertError);
            } else {
              console.log("'user' role assigned successfully");
              return 'user';
            }
          }
        }
      }
      
      return null;
    }
    
    console.log("Role retrieved for user:", data?.role);
    return data?.role as UserRole || null;
  } catch (err) {
    console.error("Unexpected error retrieving role:", err);
    return null;
  }
};

export const getEmailDomain = (email: string | null | undefined): string | null => {
  if (!email || !email.includes('@')) return null;
  return email.split('@')[1] || null;
};

export const resolveRedirectPathByRole = (role: UserRole, email: string | null | undefined): string => {
  console.log("Résolution du chemin de redirection - Rôle:", role, "Email:", email);
  
  // PRIORITÉ: Si l'email est @pazproperty.pt, toujours rediriger vers /admin
  const userEmail = email || '';
  if (userEmail.endsWith('@pazproperty.pt')) {
    console.log("Redirection vers /admin basée sur l'email @pazproperty.pt (priorité)");
    return "/admin";
  }
  
  // Sinon, redirections basées sur le rôle
  switch (role) {
    case 'admin':
      console.log("Redirection vers /admin basée sur le rôle admin");
      return "/admin";
    case 'provider':
      console.log("Redirection vers /extranet-technique basée sur le rôle provider");
      return "/extranet-technique";
    case 'customer':
      console.log("Redirection vers /area-cliente basée sur le rôle customer");
      return "/area-cliente";
    case 'user':
      console.log("Redirection vers / basée sur le rôle user");
      return "/";
    default:
      // If no role, redirect to a default page
      console.log("Redirection vers / par défaut (aucun rôle spécifié)");
      return "/";
  }
};

/**
 * Assign the customer role to a user if they don't already have a role
 * @param userId The user's ID
 * @returns A boolean indicating whether the role was assigned
 */
export const assignCustomerRole = async (userId: string): Promise<boolean> => {
  try {
    console.log("Checking existing role for user:", userId);
    
    // First check if the user already has a role in user_roles
    const { data: existingRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
      
    if (roleError) {
      // No existing role found, check if this is a provider or admin
      console.log("No existing role found in user_roles, checking if provider");
      
      // Check if user is a provider
      const { data: providerData } = await supabase
        .from('prestadores_roles')
        .select('nivel')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (providerData) {
        console.log("User is a provider, not assigning customer role");
        return false;
      }
      
      // Check if user has an @pazproperty.pt email (admin)
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (userData?.user?.email?.endsWith('@pazproperty.pt')) {
        console.log("User has @pazproperty.pt email, not assigning customer role");
        return false;
      }
      
      // No role and not a special case, assign customer role
      console.log("Assigning customer role to user:", userId);
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId,
          role: 'customer' as UserRole
        });
        
      if (insertError) {
        console.error("Error assigning customer role:", insertError);
        return false;
      }
      
      console.log("Customer role successfully assigned");
      return true;
    }
    
    console.log("User already has a role:", existingRole?.role);
    return false; // Role already exists, no change needed
  } catch (err) {
    console.error("Unexpected error assigning customer role:", err);
    return false;
  }
};
