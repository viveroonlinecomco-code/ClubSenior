'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f5f5' }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: sidebarOpen ? '280px' : '0px',
          background: '#1a1a1a',
          color: 'white',
          padding: sidebarOpen ? '20px' : '0px',
          overflow: 'hidden',
          transition: 'all 0.3s',
          borderRight: '1px solid #333',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700' }}>🎯 Admin</h1>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>MVP Sprint</p>
        </div>

        <nav style={{ flex: 1 }}>
          <a
            href="/admin/dashboard"
            style={{
              display: 'block',
              padding: '12px 16px',
              marginBottom: '8px',
              borderRadius: '6px',
              color: '#ccc',
              textDecoration: 'none',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2a2a2a';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#ccc';
            }}
          >
            📊 Dashboard
          </a>

          <a
            href="/admin/actividades"
            style={{
              display: 'block',
              padding: '12px 16px',
              marginBottom: '8px',
              borderRadius: '6px',
              color: '#ccc',
              textDecoration: 'none',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2a2a2a';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#ccc';
            }}
          >
            📅 Actividades
          </a>

          <a
            href="/admin/asistencias"
            style={{
              display: 'block',
              padding: '12px 16px',
              marginBottom: '8px',
              borderRadius: '6px',
              color: '#ccc',
              textDecoration: 'none',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2a2a2a';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#ccc';
            }}
          >
            ✅ Asistencias
          </a>

          <a
            href="/admin/usuarios"
            style={{
              display: 'block',
              padding: '12px 16px',
              marginBottom: '8px',
              borderRadius: '6px',
              color: '#ccc',
              textDecoration: 'none',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2a2a2a';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#ccc';
            }}
          >
            👥 Usuarios
          </a>
        </nav>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          🚪 Logout
        </button>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* NAVBAR */}
        <nav
          style={{
            background: 'white',
            borderBottom: '1px solid #e0e0e0',
            padding: '16px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            ☰
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Admin Dashboard</h2>
          <div style={{ color: '#666', fontSize: '14px' }}>Elena</div>
        </nav>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
