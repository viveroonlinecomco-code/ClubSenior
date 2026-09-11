'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'FACILITADOR' | 'DIRECTOR' | 'ADMIN';
}

export function FacilitadorAuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('facilitador_token');
      const role = localStorage.getItem('facilitador_role');

      if (!token) {
        router.push('/facilitador-login');
        return;
      }

      // Verificar token format
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const parts = decoded.split('|');
        if (parts.length !== 4 || parts[1] !== 'FACILITADOR') {
          throw new Error('Invalid token');
        }
      } catch {
        localStorage.removeItem('facilitador_token');
        router.push('/facilitador-login');
        return;
      }

      // Verificar rol si es requerido
      if (requiredRole) {
        const roleHierarchy: Record<string, number> = {
          'FACILITADOR': 1,
          'DIRECTOR': 2,
          'ADMIN': 3,
        };

        const userLevel = roleHierarchy[role || ''] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;

        if (userLevel < requiredLevel) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos suficientes para acceder a esta sección.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('facilitador_token');
              window.location.href = '/facilitador-login';
            }}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
