'use client';

import { useState, useEffect } from 'react';

interface Actividad {
  id: string;
  titulo: string;
  fecha: string;
  hora_inicio: string;
  condominios?: { nombre: string };
}

interface Participante {
  id: string;
  nombre: string;
  edad: number;
  genero: string;
  asistio: boolean;
}

export default function AsistenciasPage() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState('');
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ Cargar actividades al montar
  useEffect(() => {
    fetchActividades();
  }, []);

  // ✅ Cargar participantes cuando cambia actividad
  useEffect(() => {
    if (actividadSeleccionada) {
      fetchParticipantes(actividadSeleccionada);
    } else {
      setParticipantes([]);
    }
  }, [actividadSeleccionada]);

  const fetchActividades = async () => {
    try {
      const res = await fetch('/api/admin/actividades');
      const data = await res.json();
      if (data.success) {
        setActividades(data.actividades || []);
      }
    } catch (err) {
      console.error('Error cargando actividades:', err);
    }
  };

  const fetchParticipantes = async (actividadId: string) => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/admin/asistencias/marcar?actividad_id=${actividadId}`);
      const data = await res.json();
      if (data.success) {
        setParticipantes(data.participantes || []);
      } else {
        setError(data.error || 'Error cargando participantes');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAsistencia = (participanteId: string) => {
    setParticipantes((prev) =>
      prev.map((p) =>
        p.id === participanteId ? { ...p, asistio: !p.asistio } : p
      )
    );
  };

  const handleGuardar = async () => {
    if (!actividadSeleccionada) {
      setError('Selecciona una actividad');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const asistencias = participantes.map((p) => ({
        participante_id: p.id,
        asistio: p.asistio,
      }));

      const res = await fetch('/api/admin/asistencias/marcar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actividad_id: actividadSeleccionada,
          asistencias,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar');
      }

      setSuccess(`✅ ${data.total} asistencias registradas`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actividadActual = actividades.find((a) => a.id === actividadSeleccionada);
  const asistentes = participantes.filter((p) => p.asistio).length;

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
        ✅ Marcar Asistencias
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Registrar asistencia de participantes a actividades
      </p>

      {/* SELECTOR ACTIVIDAD */}
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginBottom: '24px',
        }}
      >
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '16px' }}>
          📅 Selecciona una actividad
        </label>

        <select
          value={actividadSeleccionada}
          onChange={(e) => setActividadSeleccionada(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <option value="">-- Elige una actividad --</option>
          {actividades.map((act) => (
            <option key={act.id} value={act.id}>
              {act.titulo} - {new Date(act.fecha).toLocaleDateString('es-CO')} ({act.hora_inicio})
            </option>
          ))}
        </select>
      </div>

      {actividadSeleccionada && (
        <>
          {/* INFO ACTIVIDAD */}
          {actividadActual && (
            <div
              style={{
                background: '#f0f8ff',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #bfe7ff',
                marginBottom: '24px',
                fontSize: '14px',
              }}
            >
              <strong>🎯 {actividadActual.titulo}</strong>
              <br />
              📍 {actividadActual.condominios?.nombre}
              <br />
              📅 {new Date(actividadActual.fecha).toLocaleDateString('es-CO')} a {actividadActual.hora_inicio}
            </div>
          )}

          {/* MENSAJES */}
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

          {/* PARTICIPANTES */}
          <div
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>
                👥 Participantes ({participantes.length})
              </h2>
              <span
                style={{
                  background: '#667eea',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                Asistentes: {asistentes}/{participantes.length}
              </span>
            </div>

            {loading ? (
              <p style={{ color: '#999', fontSize: '14px' }}>⏳ Cargando participantes...</p>
            ) : participantes.length === 0 ? (
              <p style={{ color: '#999', fontSize: '14px' }}>No hay participantes en este condominio</p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '12px',
                }}
              >
                {participantes.map((part) => (
                  <div
                    key={part.id}
                    style={{
                      background: part.asistio ? '#f0f9ff' : '#f9f9f9',
                      padding: '12px',
                      borderRadius: '6px',
                      border: part.asistio ? '2px solid #667eea' : '1px solid #e0e0e0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                    onClick={() => toggleAsistencia(part.id)}
                  >
                    <input
                      type="checkbox"
                      checked={part.asistio}
                      onChange={() => toggleAsistencia(part.id)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{part.nombre}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {part.edad} años • {part.genero}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOTONES */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleGuardar}
              disabled={loading || participantes.length === 0}
              style={{
                flex: 1,
                padding: '12px',
                background: loading || participantes.length === 0 ? '#ccc' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                cursor: loading || participantes.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              {loading ? '⏳ Guardando...' : '✅ Guardar Asistencias'}
            </button>

            <button
              onClick={() => setActividadSeleccionada('')}
              style={{
                padding: '12px 24px',
                background: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Limpiar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
