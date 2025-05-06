import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserRole, resolveRedirectPathByRole } from "./roleService";
import { UserRole } from "./types";

interface AuthEffectsProps {
  setUser: (user: any) => void;
  setSession: (session: any) => void;
  setLoading: (loading: boolean) => void;
  setUserRole: (role: any) => void;
}

export const useAuthEffects = ({
  setUser,
  setSession,
  setLoading,
  setUserRole,
}: AuthEffectsProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email);
        
        // Use setTimeout to avoid potential blocking in the callback
        setTimeout(() => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (event === "SIGNED_OUT") {
            navigate("/auth");
            setUserRole(null);
          } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            console.log("User logged in or token refreshed");
            
            // Check user's role for redirection
            if (newSession?.user?.id) {
              setTimeout(async () => {
                try {
                  // PRIORITÉ: Vérifier d'abord si l'email se termine par @pazproperty.pt
                  const userEmail = newSession.user.email || '';
                  console.log("Vérification de l'email pour redirection:", userEmail);
                  
                  if (userEmail.endsWith('@pazproperty.pt')) {
                    console.log("Détecté email @pazproperty.pt, redirection vers Admin");
                    // Si oui, assigner le rôle admin et rediriger vers /admin
                    setUserRole('admin');
                    navigate("/admin");
                    return;
                  }
                  
                  // Si l'email n'est pas @pazproperty.pt, vérifier si c'est un prestataire technique
                  console.log("Vérification si l'utilisateur est un prestataire technique");
                  const { data: prestadorData } = await supabase
                    .from('prestadores_roles')
                    .select('nivel')
                    .eq('user_id', newSession.user.id)
                    .maybeSingle();
                  
                  if (prestadorData) {
                    // This is a technical service provider, redirect to extranet technique
                    console.log("Utilisateur identifié comme prestataire technique");
                    setUserRole('prestadores_tecnicos');
                    navigate("/extranet-technique");
                    return;
                  }
                  
                  // Si non, vérifier les rôles standard
                  console.log("Vérification des rôles standard");
                  const role = await fetchUserRole(newSession.user.id);
                  setUserRole(role);
                  console.log("Rôle récupéré:", role);
                  
                  // Si les métadonnées indiquent que c'est un prestataire, rediriger vers extranet
                  if (role === 'provider' || 
                      (newSession.user.user_metadata && newSession.user.user_metadata.is_provider)) {
                    console.log("Métadonnées indiquent prestataire, redirection vers Extranet");
                    navigate("/extranet-technique");
                  } else {
                    // Sinon, utiliser la redirection standard basée sur le rôle
                    const redirectPath = resolveRedirectPathByRole(role, newSession.user.email);
                    console.log("Redirection standard basée sur le rôle vers:", redirectPath);
                    navigate(redirectPath);
                  }
                } catch (err) {
                  console.error("Error checking role:", err);
                  // Redirect to default page in case of error
                  navigate("/");
                }
              }, 0);
            }
          } else if (event === "PASSWORD_RECOVERY") {
            navigate("/auth/callback?reset=true");
          }
        }, 0);
      }
    );

    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error retrieving initial session:", error);
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          // Retrieve role if user is logged in
          if (data.session?.user) {
            // PRIORITÉ: Vérifier d'abord si l'email se termine par @pazproperty.pt
            const userEmail = data.session.user.email || '';
            console.log("Session initiale - Vérification de l'email:", userEmail);
            
            if (userEmail.endsWith('@pazproperty.pt')) {
              console.log("Session initiale - Détecté email @pazproperty.pt");
              setUserRole('admin');
              return;
            }
            
            // Check for provider status in both roles and metadata
            const { data: prestadorData } = await supabase
              .from('prestadores_roles')
              .select('nivel')
              .eq('user_id', data.session.user.id)
              .maybeSingle();
              
            if (prestadorData || 
                (data.session.user.user_metadata && 
                 data.session.user.user_metadata.is_provider)) {
              setUserRole('provider');
            } else {
              const role = await fetchUserRole(data.session.user.id);
              setUserRole(role);
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Unexpected error retrieving session:", err);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, setLoading, setSession, setUser, setUserRole]);
};
