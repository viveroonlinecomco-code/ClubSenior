'use client';

import { useState, useEffect } from 'react';

interface Actividad {
  id: string;
  titulo: string;
}

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

const CONDOMINIOS = [
  { id: '3833343e-1bc5-43f1-aaee-05661b98b148', nombre: 'Condominio Central' },
  { id: 'e39bbff1-c1ea-4e78-a4b3-996683165de0', nombre: 'Generación Silver' },
];

export default function ActividadesPage() {
  const [formData, setFormData] = useState({
    actividad_id: '',
    condominio_id: CONDOMINIOS[0].id,
    fecha: '',
    hora_inicio: '14:00',
    hora_fin: '15:00',
    notas: '',
  });

  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadesProgramadas, setActividadesProgramadas] = useState<ActividadProgramada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ Cargar actividades y programaciones al montar
  useEffect(() => {
    fetchActividades();
    fetchActividadesProgramadas();
  }, []);

  const fetchActividades = async () => {
    try {
      const res = await fetch('/api/admin/actividades?type=all');
      const data = await res.json();
      if (data.success) {
        setActividades(data.actividades || []);
      }
    } catch (err: any) {
      console.error('Error cargando actividades:', err);
    }
  };

  const fetchActividadesProgramadas = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/actividades-programadas');
      const data = await res.json();
      if (data.success) {
        setActividadesProgramadas(data.actividades || []);
      }
    } catch (err: any) {
      console.error('Error cargando actividades programadas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/actividades-programadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear programación');
      }

      setSuccess('✅ Actividad programada exitosamente');
      setFormData({
        actividad_id: '',
        condominio_id: CONDOMINIOS[0].id,
        fecha: '',
        hora_inicio: '14:00',
        hora_fin: '15:00',
        notas: '',
      });

      // ✅ Recargar lista
      await fetchActividadesProgramadas();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
        📅 Actividades Programadas
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Crear y gestionar programación de actividades
      </p>

      {/* FORM CREAR PROGRAMACIÓN */}
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginBottom: '32px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          ➕ Nueva Programación
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

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Actividad Dropdown */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                Actividad *
              </label>
              <select
                name="actividad_id"
                value={formData.actividad_id}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              >
                <option value="">-- Selecciona actividad --</option>
                {actividades.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.titulo}
                  </option>
                ))}
              </select>
            </div>

            {/* Condominio Dropdown */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                Condominio *
              </label>
              <select
                name="condominio_id"
                value={formData.condominio_id}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              >
                {CONDOMINIOS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha, Horas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                Fecha *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                Hora Inicio *
              </label>
              <input
                type="time"
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                Hora Fin *
              </label>
              <input
                type="time"
                name="hora_fin"
                value={formData.hora_fin}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Notas */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Notas
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              placeholder="Agregar notas sobre esta programación..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            {loading ? '⏳ Creando...' : '✅ Crear Programación'}
          </button>
        </form>
      </div>

      {/* LISTA ACTIVIDADES PROGRAMADAS */}
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          📋 Programaciones ({actividadesProgramadas.length})
        </h2>

        {actividadesProgramadas.length === 0 ? (
          <p style={{ color: '#999', fontSize: '14px' }}>No hay actividades programadas</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Actividad</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Condominio</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Fecha</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Hora</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Notas</th>
                </tr>
              </thead>
              <tbody>
                {actividadesProgramadas.map((prog) => (
                  <tr key={prog.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>{prog.actividades?.titulo || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{prog.condominios?.nombre || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      {new Date(prog.fecha).toLocaleDateString('es-CO')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {prog.hora_inicio} - {prog.hora_fin}
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>
                      {prog.notas || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
