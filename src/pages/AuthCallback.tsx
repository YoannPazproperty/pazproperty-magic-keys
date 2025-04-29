import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Info, Wrench } from "lucide-react";
import { testLogin } from "@/services/supabase/auth";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any | null>(null);
  const [testLoginResult, setTestLoginResult] = useState<any | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [isProviderReset, setIsProviderReset] = useState(false);

  useEffect(() => {
    // Process the authentication callback
    const handleAuthCallback = async () => {
      try {
        setLoading(true);
        console.log("Processing authentication callback");
        console.log("Current URL:", window.location.href);
        
        // Extract all possible parameters - from URL and hash
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Log important parameters to console for debugging
        const urlParamsObj = Object.fromEntries(urlParams.entries());
        const hashParamsObj = Object.fromEntries(hashParams.entries());
        
        console.log("URL Search params:", urlParamsObj);
        console.log("Hash params:", hashParamsObj);
        
        // Check all possible indicators of password reset
        const isReset = urlParams.get("reset") === "true";
        const type = urlParams.get("type") || hashParams.get("type");
        const email = urlParams.get("email");
        const explicitToken = urlParams.get("token");
        const isProvider = urlParams.get("provider") === "true";
        const forceReset = urlParams.get("force_reset") === "true";
        setIsProviderReset(isProvider);
        
        // Retrieve the token from either URL parameters or hash
        const accessToken = explicitToken || hashParams.get("access_token") || urlParams.get("access_token");
        
        const debugData = { 
          isReset, 
          type, 
          accessToken: accessToken ? "present" : "absent",
          token: accessToken ? accessToken.substring(0, 8) + "..." : null,
          email: email || "not specified",
          hash: window.location.hash,
          search: window.location.search,
          isProvider,
          forceReset
        };
        
        console.log("Debug parameters:", debugData);
        setDebugInfo(debugData);
        
        // If it's a password reset or if we have a token in the hash/search
        if (isReset || type === "recovery" || accessToken || forceReset) {
          console.log("Detected a password reset flow");
          setIsPasswordReset(true);
          
          // Store the token for use during reset
          if (accessToken) {
            console.log("Reset token found:", accessToken.substring(0, 8) + "...");
            setToken(accessToken);
            
            // Immediately check the token's validity
            try {
              console.log("Immediate verification of token validity");
              const supabaseUrl = 'https://ubztjjxmldogpwawcnrj.supabase.co';
              const response = await fetch(
                `${supabaseUrl}/functions/v1/get-token-info`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    token: accessToken
                  })
                }
              );
              
              const data = await response.json();
              
              if (!response.ok) {
                console.error("Token is invalid:", data);
                setTokenValid(false);
                setDebugInfo(prev => ({
                  ...prev,
                  errorDetails: data.details || data.error,
                  tokenValid: false
                }));
              } else {
                console.log("Valid token, information retrieved:", data);
                setTokenValid(true);
                setUserEmail(data.userEmail);
                setDebugInfo(prev => ({
                  ...prev,
                  userEmail: data.userEmail,
                  userId: data.userId,
                  tokenValid: true
                }));
              }
            } catch (error) {
              console.error("Error verifying token:", error);
              setTokenValid(false);
              setDebugInfo(prev => ({
                ...prev,
                verificationError: error instanceof Error ? error.message : String(error),
                tokenValid: false
              }));
            }
          }
          
          // Store the email if present in the URL
          if (email) {
            console.log("Email found in URL:", email);
            setUserEmail(email);
          }
          
          setLoading(false);
          return; // Wait for user to enter a new password
        }
        
        // Extract the authorization code from the URL if it exists
        const code = urlParams.get("code");
        
        if (code) {
          console.log("Authorization code found, attempting exchange");
          try {
            const { data, error: exchangeError } = 
              await supabase.auth.exchangeCodeForSession(code);
              
            if (exchangeError) {
              console.error("Error exchanging code:", exchangeError);
              setError(exchangeError.message);
              toast.error("Authentication error", {
                description: exchangeError.message
              });
              setTimeout(() => navigate("/auth"), 3000);
            } else if (data.session) {
              console.log("Session created successfully via code exchange");
              toast.success("Login successful");
              
              // Check user role before redirecting
              try {
                // First check if user is a technical service provider
                const { data: prestadorData } = await supabase
                  .from('prestadores_roles')
                  .select('*')
                  .eq('user_id', data.session.user.id)
                  .maybeSingle();
                  
                if (prestadorData) {
                  // This is a technical provider
                  navigate("/extranet-technique");
                  return;
                }
                
                // Check if user is an admin with @pazproperty.pt email
                const userEmail = data.session.user.email || '';
                if (userEmail.endsWith('@pazproperty.pt')) {
                  navigate("/admin");
                  return;
                }
                
                // Default redirect to home
                navigate("/");
              } catch (roleError) {
                console.error("Error checking user role:", roleError);
                // Default to home page
                navigate("/");
              }
            } else {
              console.error("No session returned after code exchange");
              setError("Unable to finalize login");
              toast.error("Unable to finalize login");
              setTimeout(() => navigate("/auth"), 3000);
            }
          } catch (exchangeErr: any) {
            console.error("Exception during code exchange:", exchangeErr);
            setError(exchangeErr.message || "Error during code exchange");
            toast.error("Authentication error");
            setTimeout(() => navigate("/auth"), 3000);
          }
        } else {
          // Retrieve the current session
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Error retrieving session:", sessionError);
            setError(sessionError.message);
            toast.error("Authentication failed", {
              description: sessionError.message
            });
            setTimeout(() => navigate("/auth"), 3000);
          } else if (data?.session) {
            console.log("Session retrieved successfully");
            toast.success("Login successful");
            
            // Check if user is a service provider or admin
            try {
              // First check if user is a technical service provider
              const { data: prestadorData } = await supabase
                .from('prestadores_roles')
                .select('*')
                .eq('user_id', data.session.user.id)
                .maybeSingle();
                
              if (prestadorData) {
                // This is a technical provider
                navigate("/extranet-technique");
                return;
              }
              
              // Check for admin role with @pazproperty.pt email
              const userEmail = data.session.user.email || '';
              if (userEmail.endsWith('@pazproperty.pt')) {
                // Check if user has admin role
                const { data: roleData } = await supabase
                  .from('user_roles')
                  .select('role')
                  .eq('user_id', data.session.user.id)
                  .maybeSingle();
                  
                if (roleData && roleData.role === 'admin') {
                  navigate("/admin");
                  return;
                }
              }
              
              // Default redirect to home
              navigate("/");
            } catch (roleError) {
              console.error("Error checking role:", roleError);
              // Default to home page
              navigate("/");
            }
          } else {
            // If no code and no session, redirect to authentication
            console.log("No code found in URL and no active session");
            setError("No authentication information found");
            setTimeout(() => navigate("/auth"), 2000);
          }
        }
      } catch (err: any) {
        console.error("Unexpected error during callback:", err);
        setError(err.message || "An error occurred during authentication");
        toast.error("An error occurred during authentication");
        setTimeout(() => navigate("/auth"), 3000);
      } finally {
        setLoading(false);
        setProcessingComplete(true);
      }
    };

    if (!isPasswordReset && !processingComplete) {
      handleAuthCallback();
    }
  }, [navigate, isPasswordReset, processingComplete]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setTestLoginResult(null);
    
    if (newPassword.length < 8) {
      setPasswordError("The password must contain at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("The passwords do not match");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Attempt to reset password");
      
      if (!token && !userEmail) {
        console.error("No access token or email found");
        setPasswordError("Invalid or expired reset link");
        setLoading(false);
        return;
      }

      // Use our custom Edge function to reset the password
      console.log("Using custom Edge function with token:", token ? token.substring(0, 8) + "..." : "not available");
      console.log("User email (if available):", userEmail);
      
      const supabaseUrl = 'https://ubztjjxmldogpwawcnrj.supabase.co';
      const response = await fetch(
        `${supabaseUrl}/functions/v1/set-admin-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: newPassword,
            recoveryToken: token,
            email: userEmail || undefined
          })
        }
      );

      const data = await response.json();
      console.log("Password reset response:", data);
      
      if (!response.ok) {
        console.error("Error resetting password with token:", data);
        setPasswordError(data.error || "Password reset failed");
        toast.error("Password reset failed", {
          description: data.error || "An error occurred"
        });
        
        // Display additional debug information
        if (data.details || data.debugData) {
          console.error("Error details:", data.details || data.debugData);
          setDebugInfo({
            ...debugInfo,
            errorDetails: data.details,
            debugData: data.debugData
          });
        }
      } else {
        console.log("Password updated successfully");
        toast.success("Password updated successfully");
        
        // Try to automatically log in with the new password
        const resetEmail = data.userEmail || userEmail;
        
        if (resetEmail) {
          console.log("Attempting automatic login with email:", resetEmail);
          
          try {
            // Wait a short time for changes to apply
            await new Promise(r => setTimeout(r, 500));
            
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: resetEmail,
              password: newPassword,
            });
            
            if (signInError) {
              console.error("Automatic login failed:", signInError);
              
              // Check for timing issues
              setTimeout(async () => {
                try {
                  console.log("Second attempt after delay...");
                  const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                    email: resetEmail,
                    password: newPassword,
                  });
                  
                  if (retryError) {
                    console.error("Second attempt failed:", retryError);
                    toast.error("Login failed", {
                      description: "Please log in manually with your new password."
                    });
                    
                    // Redirect to appropriate login page with email pre-filled
                    setTimeout(() => {
                      if (isProviderReset) {
                        navigate(`/auth?provider=true&email=${encodeURIComponent(resetEmail)}`);
                      } else {
                        navigate(`/auth?email=${encodeURIComponent(resetEmail)}`);
                      }
                    }, 2000);
                  } else {
                    console.log("Login successful after second attempt!");
                    // Mark that user needs to change password
                    await supabase.auth.updateUser({
                      data: { 
                        password_reset_required: isProviderReset ? true : false,
                        password_reset_at: new Date().toISOString()
                      }
                    });
                    toast.success("Login successful!");
                    
                    // Redirect to appropriate page after short delay
                    setTimeout(() => {
                      if (isProviderReset) {
                        navigate("/extranet-technique");
                      } else {
                        navigate("/admin");
                      }
                    }, 1000);
                  }
                } catch (retryErr) {
                  console.error("Error during second attempt:", retryErr);
                }
              }, 1500);
            } else {
              console.log("Automatic login successful");
              // Mark that user needs to change password
              await supabase.auth.updateUser({
                data: { 
                  password_reset_required: isProviderReset ? true : false,
                  password_reset_at: new Date().toISOString() 
                }
              });
              toast.success("Login successful!");
              
              // Redirect to appropriate page after short delay
              setTimeout(() => {
                if (isProviderReset) {
                  navigate("/extranet-technique");
                } else {
                  navigate("/admin");
                }
              }, 1000);
            }
          } catch (err: any) {
            console.error("Exception during automatic login attempt:", err);
            toast.error("Technical error", {
              description: "Login failed: " + (err.message || "unknown error")
            });
            
            // Redirect to appropriate login page
            setTimeout(() => {
              if (isProviderReset) {
                navigate(`/auth?provider=true`);
              } else {
                navigate(`/auth`);
              }
            }, 3000);
          }
        } else {
          // If no email available for automatic login
          toast.info("Please log in with your new password", {
            duration: 5000,
          });
          setTimeout(() => {
            if (isProviderReset) {
              navigate("/auth?provider=true");
            } else {
              navigate("/auth");
            }
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error("Exception during password reset:", err);
      setPasswordError(err.message || "Technical error");
      toast.error("Technical error during password reset");
    } finally {
      setLoading(false);
    }
  };

  // Function to manually test login
  const handleTestLogin = async () => {
    if (!userEmail || !newPassword) {
      toast.error("Email or password missing for test");
      return;
    }
    
    setLoading(true);
    try {
      const result = await testLogin(userEmail, newPassword);
      setTestLoginResult(result);
      
      if (result.success) {
        toast.success("Test login successful", {
          description: "Login works correctly, you will be redirected."
        });
        
        setTimeout(() => {
          if (isProviderReset) {
            navigate("/extranet-technique");
          } else {
            navigate("/admin");
          }
        }, 2000);
      } else {
        toast.error("Test login failed", {
          description: result.message || "Login failed for an unknown reason."
        });
      }
    } catch (err) {
      console.error("Error during test login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4">
      {isPasswordReset ? (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Password Reset</h2>
          
          {tokenValid === false && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The reset token is invalid or expired. 
                Please request a new reset link.
              </AlertDescription>
            </Alert>
          )}
          
          {userEmail && (
            <div className="mb-4 bg-blue-50 p-3 rounded">
              <p className="text-sm flex items-center text-blue-800">
                <Info className="h-4 w-4 mr-2" />
                Reset password for: <span className="font-medium ml-1">{userEmail}</span>
                {isProviderReset && <span className="ml-1 text-xs">(Technical Service Provider)</span>}
              </p>
            </div>
          )}
          
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                disabled={tokenValid === false || loading}
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Repeat your password"
                required
                minLength={8}
                disabled={tokenValid === false || loading}
              />
            </div>
            
            {passwordError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            <button
              type="submit"
              className={`w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors ${
                tokenValid === false || loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading || tokenValid === false}
            >
              {loading ? "Resetting password..." : "Reset my password"}
            </button>
            
            {tokenValid === false && (
              <button
                type="button"
                className="w-full mt-2 border border-gray-300 py-2 px-4 rounded-md"
                onClick={() => {
                  if (isProviderReset) {
                    navigate("/auth?provider=true&tab=forgot-password");
                  } else {
                    navigate("/auth?tab=forgot-password");
                  }
                }}
              >
                Request a new reset link
              </button>
            )}
            
            {userEmail && newPassword.length >= 8 && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={handleTestLogin}
                disabled={loading}
              >
                Test login directly
              </Button>
            )}
          </form>
          
          {(process.env.NODE_ENV === 'development' || window.location.hostname.includes('localhost')) && debugInfo && (
            <div className="mt-4 bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
              <p className="font-bold mb-1">Debug Information:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
          
          {(process.env.NODE_ENV === 'development' || window.location.hostname.includes('localhost')) && testLoginResult && (
            <div className="mt-4 bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
              <p className="font-bold mb-1">Test Login Result:</p>
              <pre>{JSON.stringify(testLoginResult, null, 2)}</pre>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-center text-gray-500">
            {error ? "Authentication error..." : "Authentication in progress..."}
          </p>
          {error && (
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {(process.env.NODE_ENV === 'development' || window.location.hostname.includes('localhost')) && debugInfo && (
            <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-w-md max-h-48">
              <p className="font-bold mb-1">Debug Information:</p>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
