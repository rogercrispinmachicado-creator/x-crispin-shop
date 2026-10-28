import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storage, DEMO_USERS } from '../services/storage';

interface AuthContextType {
  currentUser: User;
  currentRole: UserRole;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  demoUsers: User[];
  isRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User>(() => storage.getCurrentUser());

  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setCurrentUserState(storage.getCurrentUser());
    });
    return unsub;
  }, []);

  const setCurrentUser = (user: User) => {
    storage.setCurrentUser(user);
    setCurrentUserState(user);
  };

  const switchRole = (role: UserRole) => {
    const target = DEMO_USERS.find((u) => u.role === role) || {
      ...currentUser,
      role,
    };
    setCurrentUser(target);
  };

  const isRole = (role: UserRole) => currentUser.role === role;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        setCurrentUser,
        switchRole,
        demoUsers: DEMO_USERS,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
