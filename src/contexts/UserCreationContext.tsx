import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserCreationContext as UserContextType } from '../services/auth/userCreationService';

interface UserCreationContextProps {
  context: UserContextType;
  setContext: (context: UserContextType) => void;
}

const UserCreationContext = createContext<UserCreationContextProps | undefined>(undefined);

export const UserCreationProvider: React.FC<{
  children: ReactNode;
  defaultContext?: UserContextType;
}> = ({ children, defaultContext = 'customer_creation' }) => {
  const [context, setContext] = useState<UserContextType>(defaultContext);

  return (
    <UserCreationContext.Provider value={{ context, setContext }}>
      {children}
    </UserCreationContext.Provider>
  );
};

export const useUserCreationContext = (): UserCreationContextProps => {
  const context = useContext(UserCreationContext);
  if (context === undefined) {
    throw new Error('useUserCreationContext must be used within a UserCreationProvider');
  }
  return context;
};
