'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import {
  sendOTP,
  verifyOTP,
  getCurrentUser,
  signOut as authSignOut,
  onAuthStateChange,
} from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to auth changes
  useEffect(() => {
    let mounted = true;

    // Get initial user
    const getUser = async () => {
      const { user: fetchedUser } = await getCurrentUser();
      if (mounted) {
        setUser(fetchedUser);
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const unsubscribe = onAuthStateChange((event: string, session: unknown) => {
      if (mounted) {
        const typedSession = session as { user?: User } | null;
        setUser(typedSession?.user || null);
        setError(null);
      }
    });

    return () => {
      mounted = false;
      if (unsubscribe && typeof unsubscribe === 'object' && 'subscription' in unsubscribe) {
        const sub = unsubscribe as { subscription?: { unsubscribe?: () => void } };
        sub.subscription?.unsubscribe?.();
      }
    };
  }, []);

  const handleSendOTP = async (email: string) => {
    setLoading(true);
    setError(null);
    const result = await sendOTP(email);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Error unknown');
    }

    return result as { success: boolean; error?: string; message?: string };
  };

  const handleVerifyOTP = async (email: string, token: string) => {
    setLoading(true);
    setError(null);
    const result = await verifyOTP(email, token);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Error unknown');
    }

    return result as { success: boolean; error?: string; user?: User; session?: Record<string, unknown> };
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    const result = await authSignOut();
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Error unknown');
    }

    return result;
  };

  return {
    user,
    loading,
    error,
    sendOTP: handleSendOTP,
    verifyOTP: handleVerifyOTP,
    signOut: handleSignOut,
    isAuthenticated: !!user,
  };
}
