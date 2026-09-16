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

const CONDOMINIOS = [
  { id: '3833343e-1bc5-43f1-aaee-05661b98b148', nombre: 'Condominio Central' },
  { id: 'e39bbff1-c1ea-4e78-a4b3-996683165de0', nombre: 'Generación Silver' },
];

export default function ActividadesPage() {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora_inicio: '14:00',
    hora_fin: '15:00',
    condominio_id: CONDOMINIOS[0].id,
    modulo: 'fisica',
  });

  const [actividades, setActividades] = useState<Actividad[]>([]);
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
      const res = await fetch('/api/admin/actividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear actividad');
      }

      setSuccess('✅ Actividad creada exitosamente');
      setFormData({
        titulo: '',
        descripcion: '',
        fecha: '',
        hora_inicio: '14:00',
        hora_fin: '15:00',
        condominio_id: CONDOMINIOS[0].id,
        modulo: 'fisica',
      });

      // ✅ Recargar lista
      await fetchActividades();
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
        Crear y gestionar actividades
      </p>

      {/* FORM CREAR */}
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
          ➕ Nueva Actividad
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
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="ej: Yoga"
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Detalles de la actividad..."
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
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

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                Módulo
              </label>
              <select
                name="modulo"
                value={formData.modulo}
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
                <option value="fisica">Física</option>
                <option value="mental">Mental</option>
                <option value="social">Social</option>
                <option value="general">General</option>
              </select>
            </div>
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
            {loading ? '⏳ Creando...' : '✅ Crear Actividad'}
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
          📋 Próximas Actividades ({actividades.length})
        </h2>

        {actividades.length === 0 ? (
          <p style={{ color: '#999', fontSize: '14px' }}>No hay actividades futuras registradas</p>
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
                {actividades.map((act, idx) => (
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
