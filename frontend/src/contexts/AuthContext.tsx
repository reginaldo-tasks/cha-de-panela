import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Couple } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  couple: Couple | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCouple: (data: Partial<Couple>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth_token');
    const savedCouple = localStorage.getItem('couple_data');
    
    if (token && savedCouple) {
      try {
        setCouple(JSON.parse(savedCouple));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('couple_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await api.auth.login(email, password);
      const { token, couple: coupleData } = response;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('couple_data', JSON.stringify(coupleData));
      setCouple(coupleData);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('couple_data');
    setCouple(null);
    setIsAuthenticated(false);
  };

  const updateCouple = (data: Partial<Couple>) => {
    if (couple) {
      const updated = { ...couple, ...data, updatedAt: new Date().toISOString() };
      setCouple(updated);
      localStorage.setItem('couple_data', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, couple, login, logout, updateCouple, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}