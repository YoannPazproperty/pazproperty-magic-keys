
// Types pour la gestion de l'authentification

// Définition des rôles utilisateur possibles
export type UserRole = 'admin' | 'employee' | 'provider' | 'customer' | 'user' | 'referral_partner' | 'manager' | null;

// Interface pour les données utilisateur étendues
export interface UserWithMetadata {
  id: string;
  email: string;
  role: UserRole;
  userName?: string;
  avatarUrl?: string;
  createdAt: string;
  lastSignIn?: string;
}

// Interface pour les options de création d'utilisateur
export interface CreateUserOptions {
  email: string;
  password: string;
  role?: UserRole;
  metadata?: Record<string, any>;
  emailConfirm?: boolean;
}
