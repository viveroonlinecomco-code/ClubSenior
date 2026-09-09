'use client';

import { useContext } from 'react';
import { AuthContext } from '@/providers/auth-provider';

/**
 * Hook para acceder al contexto de autenticación
 * Uso: const { user, loading, signIn, signOut } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  
  return context;
}
