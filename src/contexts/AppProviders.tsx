
import React, { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserCreationProvider } from '@/contexts/UserCreationContext';
import { AuthProvider } from '@/hooks/auth';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <UserCreationProvider>
          {children}
        </UserCreationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};
