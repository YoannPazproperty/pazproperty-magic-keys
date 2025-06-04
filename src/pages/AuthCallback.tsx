
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen } from '../components/LoadingScreen';

interface AuthState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    error: null,
    success: false
  });

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Wait for auth state to be determined
        if (user) {
          setAuthState((prev: AuthState) => ({ 
            ...prev, 
            isLoading: false, 
            success: true 
          }));
          
          // Redirect based on user role
          if (user.role === 'admin') {
            navigate('/admin');
          } else if (user.role === 'provider') {
            navigate('/extranet-technique');
          } else {
            navigate('/');
          }
        } else {
          setAuthState((prev: AuthState) => ({ 
            ...prev, 
            isLoading: false, 
            error: 'Authentication failed' 
          }));
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setAuthState((prev: AuthState) => ({ 
          ...prev, 
          isLoading: false, 
          error: 'An error occurred during authentication' 
        }));
      }
    };

    handleAuthCallback();
  }, [user, navigate]);

  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  if (authState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{authState.error}</p>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <LoadingScreen />;
}
