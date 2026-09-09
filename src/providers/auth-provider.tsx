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
      // Use custom OTP endpoint instead of Supabase
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          error: {
            message: errorData.error || 'Error sending OTP',
          },
        };
      }

      const data = await response.json();
      return { data };
    } catch (err: any) {
      setError(err.message);
      return { error: { message: err.message } };
    }
  };

  const handleVerifyOtp = async (email: string, token: string) => {
    setError(null);
    try {
      // Use custom OTP verification endpoint
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          error: {
            message: errorData.error || 'Error verifying OTP',
          },
        };
      }

      // For now, just return success - in production, you'd create a session
      const data = await response.json();
      return { data };
    } catch (err: any) {
      setError(err.message);
      return { error: { message: err.message } };
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
