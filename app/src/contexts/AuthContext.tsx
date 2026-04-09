import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authAPI, supabase } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's an existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          // Use session metadata immediately for instant state
          const basicUser: User = {
            id: session.user.id,
            username: session.user.user_metadata?.username || 'user',
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || '',
            role: session.user.user_metadata?.role || 'student',
          } as User;
          setUser(basicUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes with instant metadata (no DB fetch)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Use session metadata instantly
        const basicUser: User = {
          id: session.user.id,
          username: session.user.user_metadata?.username || 'user',
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || '',
          role: session.user.user_metadata?.role || 'student',
        } as User;
        setUser(basicUser);
      } else {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUser = async () => {
    try {
      // Get current session (should be instant - no network call)
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const sessionUser = data.session.user;
        const basicUser: User = {
          id: sessionUser.id,
          username: sessionUser.user_metadata?.username || 'user',
          email: sessionUser.email || '',
          full_name: sessionUser.user_metadata?.full_name || '',
          role: sessionUser.user_metadata?.role || 'student',
        } as User;
        setUser(basicUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      await authAPI.login({ email, password });
      console.log('Login successful, fetching user...');
      await fetchUser();
      console.log('User fetch completed');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      console.log('Attempting registration for:', data.email);
      // authAPI.register handles creating both auth user and profile
      await authAPI.register(data);
      console.log('Registration successful, fetching user...');
      await fetchUser();
      console.log('User fetch completed');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
