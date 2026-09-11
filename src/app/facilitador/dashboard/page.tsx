'use client';

import { useEffect, useState } from 'react';
import { useFacilitadorAuth } from '@/components/facilitador-auth-guard-new';

interface DashboardStats {
  totalActividades: number;
  proximaActividad: string | null;
  totalParticipantes: number;
  asistenciaPromedio: number;
  reportesEstaSeana: number;
}

export default function FacilitadorDashboard() {
  const { facilitadorId, email } = useFacilitadorAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!facilitadorId) {
        setError('No facilitador ID found');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('facilitador_token');
        const response = await fetch('/api/facilitador/dashboard/stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ facilitador_id: facilitadorId }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [facilitadorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Facilitador</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Bienvenido, {email}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">Error: {error}</p>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Actividades"
            value={stats.totalActividades}
            icon="📅"
            trend="este mes"
          />
          <StatCard
            title="Participantes"
            value={stats.totalParticipantes}
            icon="👥"
            trend="activos"
          />
          <StatCard
            title="Asistencia Promedio"
            value={`${stats.asistenciaPromedio}%`}
            icon="✓"
            trend="esta semana"
          />
          <StatCard
            title="Reportes Esta Semana"
            value={stats.reportesEstaSeana}
            icon="📝"
            trend="creados"
          />
          <StatCard
            title="Próxima Actividad"
            value={stats.proximaActividad || 'N/A'}
            icon="🕐"
            trend="hoy/mañana"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          title="Crear Nueva Actividad"
          description="Agenda una nueva sesión con participantes"
          href="/facilitador/actividades/crear"
          icon="➕"
        />
        <QuickActionCard
          title="Registrar Asistencia"
          description="Marca presencia de participantes en sesiones"
          href="/facilitador/asistencia"
          icon="✅"
        />
        <QuickActionCard
          title="Crear Reporte Semanal"
          description="Documenta progreso y observaciones"
          href="/facilitador/reportes/crear"
          icon="📝"
        />
        <QuickActionCard
          title="Ver Participantes"
          description="Gestiona información de participantes"
          href="/facilitador/participantes"
          icon="👤"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Actividades Recientes</h2>
        <div className="space-y-4">
          <ActivityItem
            title='Sesión: "Meditación y Bienestar"'
            date="Hoy, 2:00 PM"
            status="En Progreso"
            participants={8}
          />
          <ActivityItem
            title='Sesión: "Yoga Suave"'
            date="Mañana, 10:00 AM"
            status="Programada"
            participants={6}
          />
          <ActivityItem
            title='Sesión: "Taller de Artes"'
            date="Viernes, 3:00 PM"
            status="Programada"
            participants={12}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: string;
  trend: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{trend}</span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-105 transition cursor-pointer"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{description}</p>
    </a>
  );
}

function ActivityItem({
  title,
  date,
  status,
  participants,
}: {
  title: string;
  date: string;
  status: 'En Progreso' | 'Programada' | 'Completada';
  participants: number;
}) {
  const statusColor = {
    'En Progreso': 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    'Programada': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
    'Completada': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  };

  return (
    <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
      <div className="flex-1">
        <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{date}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">👥 {participants}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}
