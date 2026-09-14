'use client';

import { useState, useEffect } from 'react';

export interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  modulo: 'fisica' | 'cognitiva' | 'social' | 'tertulia';
  condominio_id: string;
  created_at: string;
}

export function useProximasActividades() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('auth_user_id');
        
        if (!token || !userId) {
          throw new Error('No autenticado');
        }

        const response = await fetch('/api/actividades/proximas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-user-id': userId,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch actividades');
        }

        const data = await response.json();
        setActividades(data.data?.actividades || []);
        setError(null);
      } catch (err: any) {
        console.error('[useProximasActividades] Error:', err.message);
        setError(err.message);
        setActividades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActividades();
  }, []);

  return { actividades, loading, error };
}
