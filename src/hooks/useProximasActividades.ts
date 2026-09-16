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
        // Get user email from localStorage (set during OTP verification)
        const userEmail = localStorage.getItem('auth_email');
        
        if (!userEmail) {
          throw new Error('Usuario no autenticado. Completa /inscribir primero.');
        }

        const response = await fetch('/api/actividades/mis-proximas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': userEmail,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMsg = errorData.error || 'Error al cargar actividades';
          throw new Error(errorMsg);
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
