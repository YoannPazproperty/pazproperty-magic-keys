
import React, { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserCreationProvider } from '@/contexts/UserCreationContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <LanguageProvider>
      <UserCreationProvider>
        {children}
      </UserCreationProvider>
    </LanguageProvider>
  );
};
