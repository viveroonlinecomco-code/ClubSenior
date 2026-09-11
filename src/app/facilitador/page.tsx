'use client';

import { useState, useEffect } from 'react';
import { CreateActivityForm } from './components/create-activity-form';
import { ActivitiesAndAttendance } from './components/activities-attendance';

export default function FacilitadorPage() {
  const [activeTab, setActiveTab] = useState<'crear' | 'asistencia' | 'reportes'>(
    'asistencia'
  );
  const [condominio_id, setCondominio_id] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Por ahora asumimos un condominio por defecto
    // En producción, validaríamos que el facilitador es del condominio
    const defaultCondominio = 'central-condominio'; // Placeholder
    
    // Aquí deberías validar que el facilitador tenga acceso a este condominio
    setCondominio_id(defaultCondominio);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🎯 Panel Facilitador</h1>
          <p className="text-purple-100">Gestiona actividades, asistencia y reportes semanales</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-300">
          {(['asistencia', 'crear', 'reportes'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold border-b-4 transition ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'asistencia' && '📋 Asistencia'}
              {tab === 'crear' && '📅 Crear Actividad'}
              {tab === 'reportes' && '📝 Generar Reportes'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'asistencia' && condominio_id && (
          <ActivitiesAndAttendance condominio_id={condominio_id} />
        )}

        {activeTab === 'crear' && condominio_id && (
          <CreateActivityForm
            condominio_id={condominio_id}
            onActivityCreated={() => setActiveTab('asistencia')}
          />
        )}

        {activeTab === 'reportes' && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">📝 Generar Reportes</h2>
            <p className="text-gray-600 mb-6">
              Funcionalidad próximamente disponible. Desde aquí podrás generar reportes 
              semanales de progreso para cada participante.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                ℹ️ Los reportes se crean desde la página de reporte individual 
                o mediante el endpoint /api/reportes/crear
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
