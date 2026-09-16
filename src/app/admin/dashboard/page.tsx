'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    usuariosTotal: 0,
    actividadesTotales: 0,
    asistenciasHoy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // TODO: Implementar endpoints para stats en Fase 2
        // Por ahora, datos dummy para visualización

        setStats({
          usuariosTotal: 42,
          actividadesTotales: 8,
          asistenciasHoy: 15,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
        Bienvenida Elena 👋
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Resumen admin de ClubSenior - {new Date().toLocaleDateString('es-CO')}
      </p>

      {/* STATS GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
            Usuarios Registrados
          </div>
          <div style={{ fontSize: '40px', fontWeight: '700', color: '#667eea' }}>
            {loading ? '...' : stats.usuariosTotal}
          </div>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            ↑ Activos en plataforma
          </p>
        </div>

        {/* Card 2 */}
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
            Actividades
          </div>
          <div style={{ fontSize: '40px', fontWeight: '700', color: '#27ae60' }}>
            {loading ? '...' : stats.actividadesTotales}
          </div>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            ↑ Próximas este mes
          </p>
        </div>

        {/* Card 3 */}
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
            Asistencias Hoy
          </div>
          <div style={{ fontSize: '40px', fontWeight: '700', color: '#f39c12' }}>
            {loading ? '...' : stats.asistenciasHoy}
          </div>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            ↑ Registradas
          </p>
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Acciones Rápidas
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
          }}
        >
          <a
            href="/admin/actividades"
            style={{
              padding: '12px 16px',
              background: '#667eea',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#5568d3';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#667eea';
            }}
          >
            ➕ Nueva Actividad
          </a>

          <a
            href="/admin/asistencias"
            style={{
              padding: '12px 16px',
              background: '#27ae60',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#229954';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#27ae60';
            }}
          >
            ✅ Marcar Asistencia
          </a>

          <a
            href="/admin/usuarios"
            style={{
              padding: '12px 16px',
              background: '#3498db',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2980b9';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#3498db';
            }}
          >
            👥 Ver Usuarios
          </a>
        </div>
      </div>

      {/* INFO MVP */}
      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f0f8ff',
          borderLeft: '4px solid #667eea',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#666',
        }}
      >
        <strong>ℹ️ MVP v1.0</strong> - Dashboard admin simplificado. Funcionalidades completas: Crear actividades, marcar asistencias, listar usuarios. Fase 2: Audit logs, charts, facilitadores.
      </div>
    </div>
  );
}
