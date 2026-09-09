'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  signInWithEmail,
  verifyOtp,
  signOut,
  getCurrentUser,
  onAuthStateChange,
} from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string) => Promise<{ error: any }>;
  verifyOtp: (email: string, token: string) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuario actual al montar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error loading user:', err);
        setError('Error cargando usuario');
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Suscribirse a cambios de autenticación
    const { data } = onAuthStateChange((event, newSession: any) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
    });

    return () => {
      if (data?.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignInWithEmail = async (email: string) => {
    setError(null);
    try {
      const result = await signInWithEmail(email);
      if (result.error) {
        setError(result.error.message);
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
  };

  const handleVerifyOtp = async (email: string, token: string) => {
    setError(null);
    try {
      const result = await verifyOtp(email, token);
      if (result.data?.user) {
        setUser(result.data.user);
      }
      if (result.error) {
        setError(result.error.message);
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      await signOut();
      setUser(null);
      setSession(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signInWithEmail: handleSignInWithEmail,
        verifyOtp: handleVerifyOtp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
