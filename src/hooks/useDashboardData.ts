'use client';

import { useState, useEffect } from 'react';

export interface DashboardData {
  user: { id: string; email: string };
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
        const response = await fetch('/api/dashboard/data');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const dashboardData = await response.json();
        setData(dashboardData);
        setError(null);
      } catch (err: any) {
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
