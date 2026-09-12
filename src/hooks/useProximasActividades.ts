'use client';

import { useState, useEffect } from 'react';

export interface Actividad {
  id: number;
  emoji: string;
  nombre: string;
  tipo: 'fisica' | 'cognitiva' | 'social' | 'tertulia';
  descripcion: string;
  objetivo: string;
  dia: string;
  hora_inicio: string;
  duracion_minutos: number;
  semana: number;
}

export function useProximasActividades() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const response = await fetch('/api/actividades/proximas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch actividades');
        }

        const data = await response.json();
        setActividades(data.actividades || []);
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
