
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "manager" | "prestadores_tecnicos" | "user";
  emailDomain?: string;
}

const ProtectedRoute = ({ children, requiredRole, emailDomain }: ProtectedRouteProps) => {
  const { user, loading, getUserRole } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(!!requiredRole);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setCheckingRole(false);
      return;
    }

    if (!requiredRole && !emailDomain) {
      // If no role or domain is required, authenticated user has access
      setHasAccess(true);
      setCheckingRole(false);
      return;
    }

    // If we've already checked the role for this user and this page, don't recheck
    if (roleChecked) {
      return;
    }

    const checkRole = async () => {
      try {
        // Check domain restriction first if specified
        if (emailDomain && user.email) {
          const userEmailDomain = user.email.split('@')[1];
          if (userEmailDomain !== emailDomain) {
            console.log(`Access denied: email ${user.email} is not from domain ${emailDomain}`);
            toast.error("Access denied", { 
              description: `This area is restricted to users with an email @${emailDomain}`,
              id: "domain-restricted"
            });
            setHasAccess(false);
            setCheckingRole(false);
            setRoleChecked(true);
            return;
          }
        }

        // Then check role if needed
        if (requiredRole) {
          const userRole = await getUserRole();
          console.log("User's role verified:", userRole);
          console.log("Required role for this page:", requiredRole);
          
          // If user is admin, they have access to everything
          if (userRole === "admin") {
            setHasAccess(true);
            setCheckingRole(false);
            setRoleChecked(true);
            return;
          }
          
          // Specific access rules for different roles
          if (userRole === requiredRole) {
            setHasAccess(true);
            setCheckingRole(false);
            setRoleChecked(true);
            return;
          }

          // Special case: manager can access user pages
          if (userRole === "manager" && requiredRole === "user") {
            setHasAccess(true);
            setCheckingRole(false);
            setRoleChecked(true);
            return;
          }
          
          if (!userRole) {
            console.log("⚠️ No role found for user, attempt:", checkAttempts + 1);
            
            // If no role is found and this is the first try, maybe the roles table is empty
            if (checkAttempts < 3) {
              setCheckAttempts(prev => prev + 1);
              setTimeout(() => checkRole(), 1000); // Retry after 1 second
              return;
            }
            
            // For development purposes, grant access by default
            if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('localhost')) {
              console.log("⚠️ Development mode detected - Granting access by default");
              setHasAccess(true);
              setRoleChecked(true);
              toast.warning("No role defined", { 
                description: "Access is granted by default in development mode",
                id: "role-warning"
              });
            } else {
              setHasAccess(false);
              setRoleChecked(true);
              toast.error("Authorization error", { 
                description: "Your account doesn't have an assigned role",
                id: "role-error"
              });
            }
          } else {
            // User with a role that doesn't have the required permission
            setHasAccess(false);
            setRoleChecked(true);
            toast.error("Access denied", { 
              description: `You have the role "${userRole}" but this page requires the role "${requiredRole}"`,
              id: "access-denied"
            });
          }
        } else {
          // If only checking the domain and we reach here, the domain is correct
          setHasAccess(true);
          setCheckingRole(false);
          setRoleChecked(true);
        }
      } catch (error) {
        console.error("Error checking role:", error);
        
        // In case of error, in development mode, authorize access
        if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('localhost')) {
          console.log("⚠️ Development mode detected - Granting access despite error");
          setHasAccess(true);
          setRoleChecked(true);
          toast.warning("Role verification error", { 
            description: "Access is granted by default in development mode despite the error",
            id: "role-error"
          });
        } else {
          setHasAccess(false);
          setRoleChecked(true);
        }
        
        setCheckingRole(false);
      }
    };

    checkRole();
  }, [user, requiredRole, getUserRole, checkAttempts, roleChecked, emailDomain]);

  // Show a loading screen during verification
  if (loading || checkingRole) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-center text-gray-500">
            {checkingRole ? "Checking permissions..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login page if user is not logged in
  if (!user) {
    console.log("User not logged in, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  // Redirect to access denied page if user doesn't have the required role or email domain
  if (hasAccess === false) {
    console.log("Access denied for user:", user.email);
    return <Navigate to="/access-denied" replace />;
  }

  // Display the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
