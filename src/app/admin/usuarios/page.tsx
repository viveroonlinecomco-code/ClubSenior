'use client';

import { useState, useEffect } from 'react';

interface Usuario {
  id: string;
  email: string;
  nombre_abuelo: string;
  apellido_abuelo: string;
  condominio: string;
  eps: string;
  created_at: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [search, setSearch] = useState('');
  const [condominio, setCondominio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const CONDOMINIOS = [
    { id: '3833343e-1bc5-43f1-aaee-05661b98b148', nombre: 'Condominio Central' },
    { id: 'e39bbff1-c1ea-4e78-a4b3-996683165de0', nombre: 'Generación Silver' },
  ];

  // ✅ Cargar usuarios al montar y cuando cambian filtros
  useEffect(() => {
    fetchUsuarios();
  }, [search, condominio]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError('');

      let url = '/api/admin/usuarios';
      const params = new URLSearchParams();

      if (search) params.append('q', search);
      if (condominio) params.append('condominio', condominio);

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setUsuarios(data.usuarios || []);
      } else {
        setError(data.error || 'Error cargando usuarios');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
        👥 Usuarios
      </h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Gestionar y visualizar usuarios registrados
      </p>

      {/* FILTROS */}
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
            🔍 Buscar
          </label>
          <input
            type="text"
            placeholder="Nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            🏘️ Condominio
          </label>
          <select
            value={condominio}
            onChange={(e) => setCondominio(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          >
            <option value="">Todos</option>
            {CONDOMINIOS.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
            📊 Resultados
          </label>
          <div
            style={{
              padding: '10px',
              background: '#f5f5f5',
              borderRadius: '4px',
              fontWeight: '600',
              fontSize: '14px',
              color: '#667eea',
            }}
          >
            {loading ? 'Cargando...' : `${usuarios.length} usuarios`}
          </div>
        </div>
      </div>

      {/* TABLA USUARIOS */}
      <div
        style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
        }}
      >
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

        {usuarios.length === 0 ? (
          <p style={{ color: '#999', fontSize: '14px', textAlign: 'center', padding: '32px' }}>
            {loading ? 'Cargando usuarios...' : 'No se encontraron usuarios'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Condominio</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>EPS</th>
                  <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Registrado</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>
                      <strong>{usuario.nombre_abuelo} {usuario.apellido_abuelo}</strong>
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>{usuario.email}</td>
                    <td style={{ padding: '12px' }}>{usuario.condominio}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#999' }}>{usuario.eps}</td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#999' }}>
                      {new Date(usuario.created_at).toLocaleDateString('es-CO')}
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
