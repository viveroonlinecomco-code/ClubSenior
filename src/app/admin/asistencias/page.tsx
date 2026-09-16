'use client';

import { useState, useEffect } from 'react';

interface ActividadProgramada {
  id: string;
  actividad_id: string;
  condominio_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  notas: string;
  actividades?: { id: string; titulo: string };
  condominios?: { id: string; nombre: string };
}

interface Participante {
  id: string;
  nombre: string;
  edad: number;
  condominio_id: string;
}

interface Asistencia {
  participante_id: string;
  asistio: boolean;
}

export default function AsistenciasPage() {
  const [step, setStep] = useState<'select' | 'mark'>('select');
  const [actividadesProgramadas, setActividadesProgramadas] = useState<ActividadProgramada[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [asistencias, setAsistencias] = useState<Map<string, Asistencia>>(new Map());

  const [selectedActividad, setSelectedActividad] = useState<ActividadProgramada | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ Cargar actividades programadas
  useEffect(() => {
    fetchActividadesProgramadas();
  }, []);

  const fetchActividadesProgramadas = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/actividades-programadas');
      const data = await res.json();
      if (data.success) {
        setActividadesProgramadas(data.actividades || []);
      }
    } catch (err: any) {
      console.error('Error cargando actividades:', err);
      setError('Error cargando actividades programadas');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectActividad = async (actividad: ActividadProgramada) => {
    setSelectedActividad(actividad);
    setStep('mark');
    setError('');
    setSuccess('');
    setAsistencias(new Map());

    // Cargar participantes del condominio
    await fetchParticipantes(actividad.condominio_id);

    // Cargar asistencias ya registradas
    await fetchAsistenciasExistentes(actividad.id);
  };

  const fetchParticipantes = async (condominio_id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/usuarios?condominio=${condominio_id}`);
      const data = await res.json();
      if (data.success) {
        setParticipantes(data.usuarios || []);
      }
    } catch (err: any) {
      console.error('Error cargando participantes:', err);
      setError('Error cargando participantes');
    } finally {
      setLoading(false);
    }
  };

  const fetchAsistenciasExistentes = async (actividades_programadas_id: string) => {
    try {
      const res = await fetch(`/api/admin/asistencias/marcar?actividades_programadas_id=${actividades_programadas_id}`);
      const data = await res.json();
      if (data.success && data.asistencias) {
        const map = new Map<string, Asistencia>();
        data.asistencias.forEach((a: Asistencia) => {
          map.set(a.participante_id, a);
        });
        setAsistencias(map);
      }
    } catch (err: any) {
      console.error('Error cargando asistencias:', err);
    }
  };

  const handleToggleAsistencia = (participante_id: string) => {
    const newAsistencias = new Map(asistencias);
    const actual = newAsistencias.get(participante_id);
    
    if (actual) {
      newAsistencias.set(participante_id, {
        ...actual,
        asistio: !actual.asistio,
      });
    } else {
      newAsistencias.set(participante_id, {
        participante_id,
        asistio: true,
      });
    }

    setAsistencias(newAsistencias);
  };

  const handleGuardar = async () => {
    if (!selectedActividad) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const asistenciasArray = Array.from(asistencias.values());

      const res = await fetch('/api/admin/asistencias/marcar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actividades_programadas_id: selectedActividad.id,
          asistencias: asistenciasArray,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar');
      }

      setSuccess(`✅ ${asistenciasArray.length} asistencias registradas`);
      setTimeout(() => {
        setStep('select');
        setSelectedActividad(null);
        setAsistencias(new Map());
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    setStep('select');
    setSelectedActividad(null);
    setAsistencias(new Map());
    setError('');
    setSuccess('');
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
        ✅ Marcar Asistencias
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Registrar asistencia de participantes
      </p>

      {/* STEP 1: SELECCIONAR ACTIVIDAD */}
      {step === 'select' && (
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            📅 Selecciona Actividad Programada
          </h2>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            >
              ❌ {error}
            </div>
          )}

          {loading ? (
            <p style={{ color: '#999' }}>Cargando...</p>
          ) : actividadesProgramadas.length === 0 ? (
            <p style={{ color: '#999' }}>No hay actividades programadas</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {actividadesProgramadas.map((prog) => (
                <div
                  key={prog.id}
                  onClick={() => handleSelectActividad(prog)}
                  style={{
                    padding: '16px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: '#f9f9f9',
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#f0f0f0';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = '#f9f9f9';
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  <p style={{ fontWeight: '600', marginBottom: '8px', fontSize: '16px' }}>
                    {prog.actividades?.titulo}
                  </p>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                    📍 {prog.condominios?.nombre}
                  </p>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                    📅 {new Date(prog.fecha).toLocaleDateString('es-CO')}
                  </p>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    🕐 {prog.hora_inicio} - {prog.hora_fin}
                  </p>
                  {prog.notas && (
                    <p style={{ color: '#999', fontSize: '12px', marginTop: '8px', fontStyle: 'italic' }}>
                      Notas: {prog.notas}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: MARCAR ASISTENCIAS */}
      {step === 'mark' && selectedActividad && (
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            ✅ Marcar Asistencia - {selectedActividad.actividades?.titulo}
          </h2>

          <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>
            <p>📍 {selectedActividad.condominios?.nombre} | 📅 {new Date(selectedActividad.fecha).toLocaleDateString('es-CO')} | 🕐 {selectedActividad.hora_inicio}</p>
          </div>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            >
              ❌ {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            >
              {success}
            </div>
          )}

          {loading ? (
            <p style={{ color: '#999' }}>Cargando participantes...</p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {participantes.map((part) => {
                  const asistio = asistencias.get(part.id)?.asistio ?? false;
                  return (
                    <div
                      key={part.id}
                      onClick={() => handleToggleAsistencia(part.id)}
                      style={{
                        padding: '12px',
                        border: `2px solid ${asistio ? '#22c55e' : '#ddd'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: asistio ? '#dcfce7' : '#f9f9f9',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={asistio}
                          onChange={() => {}}
                          style={{ cursor: 'pointer' }}
                        />
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '14px' }}>{part.nombre}</p>
                          <p style={{ color: '#666', fontSize: '12px' }}>
                            {part.edad} años
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleGuardar}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: loading ? '#ccc' : '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {loading ? '⏳ Guardando...' : '✅ Guardar Asistencias'}
                </button>

                <button
                  onClick={handleVolver}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#f3f4f6',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  ⬅️ Volver
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
