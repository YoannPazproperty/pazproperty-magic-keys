
import { User } from '@supabase/supabase-js';

export interface CreateProviderAccountParams {
  email: string;
  nome: string;
  empresa: string;
}

export interface CreateAccountResult {
  success: boolean;
  message?: string;
  userId?: string;
  emailSent: boolean;
  emailError?: { message: string; code: string };
}
