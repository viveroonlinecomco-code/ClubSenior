'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFacilitadorAuth } from '@/components/facilitador-auth-guard-new';

interface Actividad {
  id: string;
  nombre: string;
  fecha: string;
  hora_inicio: string;
  duracion_minutos: number;
  capacidad_max: number;
  estado: 'PROGRAMADA' | 'EN_PROGRESO' | 'COMPLETADA';
}

export default function ActividadesPage() {
  const { facilitadorId } = useFacilitadorAuth();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'programadas' | 'completadas'>('todas');

  useEffect(() => {
    fetchActividades();
  }, [facilitadorId]);

  const fetchActividades = async () => {
    if (!facilitadorId) return;

    try {
      const token = localStorage.getItem('facilitador_token');
      const response = await fetch('/api/facilitador/actividades/lista', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ facilitador_id: facilitadorId }),
      });

      if (response.ok) {
        const data = await response.json();
        setActividades(data.actividades || []);
      }
    } catch (error) {
      console.error('Error fetching actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActividades = actividades.filter((a) => {
    if (filter === 'programadas') return a.estado === 'PROGRAMADA';
    if (filter === 'completadas') return a.estado === 'COMPLETADA';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Actividades</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gestiona tus sesiones y actividades</p>
        </div>
        <Link
          href="/facilitador/actividades/crear"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
        >
          ➕ Nueva Actividad
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['todas', 'programadas', 'completadas'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition capitalize ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Activities List */}
      {!loading && (
        <div className="space-y-4">
          {filteredActividades.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No hay actividades en este filtro.
              </p>
              <Link
                href="/facilitador/actividades/crear"
                className="text-purple-600 hover:text-purple-700 mt-2 inline-block"
              >
                Crear la primera actividad →
              </Link>
            </div>
          ) : (
            filteredActividades.map((actividad) => (
              <div
                key={actividad.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {actividad.nombre}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>📅 {new Date(actividad.fecha).toLocaleDateString()}</span>
                      <span>🕐 {actividad.hora_inicio}</span>
                      <span>⏱ {actividad.duracion_minutos} min</span>
                      <span>👥 {actividad.capacidad_max} participantes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={actividad.estado} />
                    <Link
                      href={`/facilitador/actividades/${actividad.id}/editar`}
                      className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 transition"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    'PROGRAMADA': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
    'EN_PROGRESO': 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    'COMPLETADA': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        colors[status as keyof typeof colors] || colors['PROGRAMADA']
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
