'use client';

import { useState, useEffect } from 'react';

interface Actividad {
  id: string;
  titulo: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  condominio_id: string;
  modulo: string;
  condominios?: { id: string; nombre: string };
}

export default function ActividadesPage() {
  const [formData, setFormData] = useState({
    actividad_id: '',
    descripcion: '',
  });

  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ Cargar actividades al montar
  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/actividades');
      const data = await res.json();
      if (data.success) {
        setActividades(data.actividades || []);
      }
    } catch (err: any) {
      console.error('Error cargando actividades:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectActividad = (e: any) => {
    const actividadId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      actividad_id: actividadId,
    }));

    // ✅ Auto-llenar detalles de la actividad seleccionada
    if (actividadId) {
      const selected = actividades.find((a) => a.id === actividadId);
      setActividadSeleccionada(selected || null);
    } else {
      setActividadSeleccionada(null);
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

    if (!formData.actividad_id) {
      setError('Selecciona una actividad');
      return;
    }

    setLoading(true);

    try {
      // ✅ Aquí irías a asistencias con la actividad seleccionada
      setSuccess(`✅ Actividad "${actividadSeleccionada?.titulo}" seleccionada`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
        📅 Actividades
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Seleccionar actividad y gestionar asistencias
      </p>

      {/* FORM SELECCIONAR */}
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
          🎯 Seleccionar Actividad
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
          {/* ✅ DROPDOWN ACTIVIDADES */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Selecciona Actividad *
            </label>
            <select
              name="actividad_id"
              value={formData.actividad_id}
              onChange={handleSelectActividad}
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
              <option value="">-- Selecciona una actividad --</option>
              {actividades.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.titulo} - {new Date(act.fecha).toLocaleDateString('es-CO')} ({act.hora_inicio})
                </option>
              ))}
            </select>
          </div>

          {/* ✅ MOSTRAR DETALLES DE ACTIVIDAD SELECCIONADA */}
          {actividadSeleccionada && (
            <div
              style={{
                background: '#f3f4f6',
                padding: '16px',
                borderRadius: '4px',
                marginBottom: '16px',
                border: '1px solid #e5e7eb',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                📌 Detalles de la Actividad
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div>
                  <p style={{ color: '#666', marginBottom: '4px' }}>Título</p>
                  <p style={{ fontWeight: '600' }}>{actividadSeleccionada.titulo}</p>
                </div>
                <div>
                  <p style={{ color: '#666', marginBottom: '4px' }}>Condominio</p>
                  <p style={{ fontWeight: '600' }}>{actividadSeleccionada.condominios?.nombre || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: '#666', marginBottom: '4px' }}>Fecha</p>
                  <p style={{ fontWeight: '600' }}>
                    {new Date(actividadSeleccionada.fecha).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#666', marginBottom: '4px' }}>Hora</p>
                  <p style={{ fontWeight: '600' }}>
                    {actividadSeleccionada.hora_inicio} - {actividadSeleccionada.hora_fin}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#666', marginBottom: '4px' }}>Módulo</p>
                  <p style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                    {actividadSeleccionada.modulo}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* NOTAS (OPCIONAL) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Notas (Opcional)
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Agregar notas sobre esta actividad..."
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
            disabled={loading || !formData.actividad_id}
            style={{
              width: '100%',
              padding: '12px',
              background: loading || !formData.actividad_id ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '600',
              cursor: loading || !formData.actividad_id ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            {loading ? '⏳ Procesando...' : '✅ Continuar a Asistencias'}
          </button>
        </form>
      </div>

      {/* LISTA ACTIVIDADES */}
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          📋 Todas las Actividades ({actividades.length})
        </h2>

        {actividades.length === 0 ? (
          <p style={{ color: '#999', fontSize: '14px' }}>No hay actividades registradas</p>
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
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Título</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Condominio</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Fecha</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Hora</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Módulo</th>
                </tr>
              </thead>
              <tbody>
                {actividades.map((act) => (
                  <tr key={act.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>{act.titulo}</td>
                    <td style={{ padding: '12px' }}>{act.condominios?.nombre || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      {new Date(act.fecha).toLocaleDateString('es-CO')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {act.hora_inicio} - {act.hora_fin}
                    </td>
                    <td style={{ padding: '12px', textTransform: 'capitalize' }}>{act.modulo}</td>
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
