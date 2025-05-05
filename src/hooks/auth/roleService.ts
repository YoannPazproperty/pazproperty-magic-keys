
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
      return 'prestadores_tecnicos'; // External service providers are always 'prestadores_tecnicos'
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
        
        // Check if user has a pazproperty.pt email address
        const userEmail = userId; // This is just a placeholder, we'll need the actual email
        if (userEmail.endsWith('@pazproperty.pt')) {
          // Assign admin role for @pazproperty.pt emails
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({ 
              user_id: userId,
              role: 'admin'
            });
            
          if (insertError) {
            console.error("Error assigning admin role:", insertError);
          } else {
            console.log("'admin' role automatically assigned for @pazproperty.pt address");
            return 'admin';
          }
        } else {
          // Check if user metadata indicates this is a provider
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
          
          if (!userError && userData?.user?.user_metadata?.is_provider) {
            // This is a provider based on metadata
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ 
                user_id: userId,
                role: 'provider'
              });
              
            if (insertError) {
              console.error("Error assigning provider role:", insertError);
            } else {
              console.log("'provider' role assigned based on user metadata");
              return 'provider';
            }
          } else {
            // Assign default role (user) for others
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ 
                user_id: userId,
                role: 'user'
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
  switch (role) {
    case 'admin':
      // Check if email is @pazproperty.pt
      const userEmail = email || '';
      if (userEmail.endsWith('@pazproperty.pt')) {
        return "/admin";
      } else {
        // If role is admin but not @pazproperty.pt, there's an error
        console.warn("User with admin role but without @pazproperty.pt email");
        return "/";
      }
    case 'provider':
      return "/extranet-technique";
    case 'prestadores_tecnicos':
      return "/extranet-technique";
    case 'user':
      return "/";
    default:
      // If no role, redirect to a default page
      return "/";
  }
};
