'use client';

import { useState, useEffect } from 'react';

interface Actividad {
  id: string;
  nombre: string;
  descripcion?: string;
  fecha: string;
  hora_inicio: string;
  duracion_minutos: number;
  ubicacion?: string;
  estado: string;
}

interface Participante {
  id: string;
  nombre: string;
  edad: number;
  genero?: string;
  asistencia?: {
    presente: boolean;
    observaciones?: string;
  };
}

export function ActivitiesAndAttendance({ condominio_id }: { condominio_id: string }) {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActividad, setSelectedActividad] = useState<string | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [participantesLoading, setParticipantesLoading] = useState(false);
  const [attendanceChanging, setAttendanceChanging] = useState<string | null>(null);

  // Cargar actividades
  useEffect(() => {
    loadActividades();
  }, [condominio_id]);

  // Cargar participantes cuando se selecciona actividad
  useEffect(() => {
    if (selectedActividad) {
      loadParticipantes(selectedActividad);
    }
  }, [selectedActividad]);

  const loadActividades = async () => {
    try {
      const response = await fetch(
        `/api/facilitador/actividades/proximas?condominio_id=${condominio_id}`
      );

      if (response.ok) {
        const data = await response.json();
        setActividades(data.actividades || []);
      }
    } catch (err) {
      console.error('Error loading activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipantes = async (actividad_id: string) => {
    setParticipantesLoading(true);
    try {
      const response = await fetch(
        `/api/facilitador/actividades/${actividad_id}/participantes`
      );

      if (response.ok) {
        const data = await response.json();
        setParticipantes(data.participantes || []);
      }
    } catch (err) {
      console.error('Error loading participants:', err);
    } finally {
      setParticipantesLoading(false);
    }
  };

  const handleAttendanceToggle = async (participante_id: string, presente: boolean) => {
    if (!selectedActividad) return;

    setAttendanceChanging(participante_id);

    try {
      const response = await fetch('/api/facilitador/asistencias/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actividad_id: selectedActividad,
          participante_id,
          presente,
        }),
      });

      if (response.ok) {
        // Actualizar estado local
        setParticipantes(prev =>
          prev.map(p =>
            p.id === participante_id
              ? {
                  ...p,
                  asistencia: {
                    presente,
                    observaciones: p.asistencia?.observaciones,
                  },
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Error updating attendance:', err);
    } finally {
      setAttendanceChanging(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Cargando actividades...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Actividades */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">📋 Actividades Próximas</h2>

        {actividades.length === 0 ? (
          <p className="text-gray-600">No hay actividades programadas</p>
        ) : (
          <div className="space-y-3">
            {actividades.map(act => (
              <button
                key={act.id}
                onClick={() => setSelectedActividad(act.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  selectedActividad === act.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{act.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      📅 {formatDate(act.fecha)} - 🕐 {act.hora_inicio}
                    </p>
                    {act.ubicacion && (
                      <p className="text-sm text-gray-600">📍 {act.ubicacion}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      act.estado === 'PROGRAMADA'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {act.estado}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Asistencia */}
      {selectedActividad && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">👥 Marcar Asistencia</h2>

          {participantesLoading ? (
            <p className="text-gray-600">Cargando participantes...</p>
          ) : participantes.length === 0 ? (
            <p className="text-gray-600">No hay participantes en esta actividad</p>
          ) : (
            <div className="space-y-2">
              {participantes.map(participante => {
                const presente = participante.asistencia?.presente || false;
                return (
                  <div
                    key={participante.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{participante.nombre}</p>
                      <p className="text-sm text-gray-600">
                        {participante.edad} años - {participante.genero || 'Sin especificar'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleAttendanceToggle(participante.id, true)
                        }
                        disabled={attendanceChanging === participante.id}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          presente
                            ? 'bg-blue-500 hover:bg-blue-600 transition:bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                        } ${attendanceChanging === participante.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        ✅ Presente
                      </button>

                      <button
                        onClick={() =>
                          handleAttendanceToggle(participante.id, false)
                        }
                        disabled={attendanceChanging === participante.id}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          !presente
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                        } ${attendanceChanging === participante.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        ❌ Ausente
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
