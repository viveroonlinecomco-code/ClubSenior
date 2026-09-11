'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface FacilitadorAuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'FACILITADOR' | 'DIRECTOR' | 'ADMIN';
}

export function FacilitadorAuthGuard({ 
  children, 
  requiredRole = 'FACILITADOR' 
}: FacilitadorAuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [facilitadorId, setFacilitadorId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('facilitador_token');
      const role = localStorage.getItem('facilitador_role');

      if (!token) {
        console.warn('[FACILITADOR-AUTH] No token found');
        router.push('/facilitador-login');
        return;
      }

      // Verify JWT token
      try {
        const decoded = jwtDecode<any>(token);
        
        // Check required fields
        if (!decoded.email || !decoded.facilitadorId || !decoded.role) {
          throw new Error('Invalid token structure');
        }
        
        // Check expiration
        if (decoded.exp && Date.now() > decoded.exp * 1000) {
          throw new Error('Token expired');
        }

        // Check role hierarchy
        const roleHierarchy: Record<string, number> = {
          'FACILITADOR': 1,
          'DIRECTOR': 2,
          'ADMIN': 3,
        };

        const userLevel = roleHierarchy[decoded.role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;

        if (userLevel < requiredLevel) {
          console.warn(`[FACILITADOR-AUTH] Insufficient role: ${decoded.role} < ${requiredRole}`);
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // All checks passed
        setFacilitadorId(decoded.facilitadorId);
        setEmail(decoded.email);
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('[FACILITADOR-AUTH] Token verification failed:', error);
        localStorage.removeItem('facilitador_token');
        localStorage.removeItem('facilitador_role');
        router.push('/facilitador-login');
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Acceso Denegado</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No tienes permisos suficientes para acceder a esta sección.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('facilitador_token');
              localStorage.removeItem('facilitador_role');
              window.location.href = '/facilitador-login';
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Helper hook to use facilitador data in components
export function useFacilitadorAuth() {
  const [facilitadorId, setFacilitadorId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('facilitador_token');
    const roleStored = localStorage.getItem('facilitador_role');

    if (token) {
      try {
        const decoded = jwtDecode<any>(token);
        setFacilitadorId(decoded.facilitadorId);
        setEmail(decoded.email);
        setRole(decoded.role);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  return { facilitadorId, email, role };
}
