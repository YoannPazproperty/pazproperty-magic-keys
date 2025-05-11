
export type UserRole = "admin" | "manager" | "provider" | "customer" | "user" | null;

// Define the structure of the authentication context
// Update the AuthContextType to include userRole
export interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  userRole?: UserRole; // Add userRole to context
  signIn: (email: string, password: string) => Promise<{ error: any; success: boolean }>;
  signInWithGoogle: () => Promise<{ error: any; success: boolean }>;
  resetPassword: (email: string) => Promise<any>;
  signOut: () => Promise<{ error: any; success: boolean }>;
  getUserRole: () => Promise<UserRole>;
}
