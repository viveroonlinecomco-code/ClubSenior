'use client';

import { useState, useEffect } from 'react';

export interface DashboardData {
  user: { 
    id: string; 
    email: string; 
    nombre?: string; 
    apellido?: string;
    ciudad?: string;
    fecha_nacimiento?: string;
    terminos_aceptados?: boolean;
    politica_privacidad_aceptada?: boolean;
    contratos_sponsor_firmado?: boolean;
    contratos_participant_firmado?: boolean;
    inscripcion_completada?: boolean;
    nombre_abuelo?: string;
  };
  suscripcion: any;
  reportes: any[];
  asistencias: { total: number; asistencias: number; tasa: number } | null;
  pagos: any[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setError('No authentication token found');
          setData(null);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/dashboard/data', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch dashboard data');
        }

        const dashboardData = await response.json();
        setData(dashboardData);
        setError(null);
      } catch (err: any) {
        console.error('[useDashboardData] Error:', err.message);
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { data, loading, error };
}
