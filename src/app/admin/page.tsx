'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación via cookies
    const userEmail = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_email='))
      ?.split('=')[1];
    const isAdmin = document.cookie
      .split('; ')
      .find((row) => row.startsWith('is_admin='))
      ?.split('=')[1];

    if (userEmail && isAdmin === 'true') {
      setIsAuthenticated(true);
    } else {
      // Redirigir a login si no está autenticado
      router.push('/admin/login');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // El useEffect ya redirige a /admin/login
  }

  return <AdminPanel />;
}
