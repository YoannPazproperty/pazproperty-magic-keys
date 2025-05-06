
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "manager" | "provider" | "user";
  emailDomain?: string;
}

const ProtectedRoute = ({ children, requiredRole, emailDomain }: ProtectedRouteProps) => {
  const { user, loading, getUserRole } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(!!requiredRole);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [roleChecked, setRoleChecked] = useState(false);
  const [timeout, setTimeout] = useState<number | null>(null);

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

    // Add a safety timeout to avoid infinite checking
    const safetyTimeout = window.setTimeout(() => {
      console.log("Safety timeout triggered after 5 seconds");
      if (checkingRole) {
        setCheckingRole(false);
        
        // In development mode, grant access by default when timeout occurs
        if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('localhost')) {
          console.log("⚠️ Safety timeout - Development mode - Granting access by default");
          setHasAccess(true);
          setRoleChecked(true);
          toast.warning("Role verification timed out", { 
            description: "Access granted by default in development mode",
            id: "role-timeout"
          });
        } else {
          setHasAccess(false);
          setRoleChecked(true);
          toast.error("Authorization timeout", { 
            description: "Could not verify your permissions in time",
            id: "role-timeout-error"
          });
        }
      }
    }, 5000); // 5 seconds timeout
    
    // Store timeout reference for cleanup
    setTimeout(safetyTimeout);

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

        // Special case: if user email is from pazproperty.pt and trying to access admin
        if (requiredRole === 'admin' && user.email?.endsWith('@pazproperty.pt')) {
          console.log("User has pazproperty.pt email, granting admin access");
          setHasAccess(true);
          setCheckingRole(false);
          setRoleChecked(true);
          return;
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
          
          // If we've reached max attempts or no role is found
          if (!userRole || checkAttempts >= 2) {
            console.log("⚠️ No role found for user or max attempts reached:", checkAttempts);
            
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
            setCheckingRole(false);
          } else {
            // If no role is found and this is not the last try, retry
            if (!userRole) {
              console.log("⚠️ No role found for user, retrying attempt:", checkAttempts + 1);
              setCheckAttempts(prev => prev + 1);
              return; // Don't set checkingRole to false yet
            }
            
            // User with a role that doesn't have the required permission
            setHasAccess(false);
            setRoleChecked(true);
            setCheckingRole(false);
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

    return () => {
      // Clear safety timeout on unmount
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [user, requiredRole, getUserRole, checkAttempts, roleChecked, emailDomain, timeout]);

  // Show a loading screen during verification
  if (loading || checkingRole) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-center text-gray-500">
            {checkingRole ? "Checking permissions..." : "Loading..."}
          </p>
          {checkAttempts > 0 && (
            <p className="text-center text-gray-400 text-sm">
              Attempt {checkAttempts + 1}...
            </p>
          )}
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
