import React, { ReactNode } from 'react';
import { LanguageProvider } from './LanguageContext';
import { UserCreationProvider } from './UserCreationContext';
import { AuthProvider } from '../hooks/auth';

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
