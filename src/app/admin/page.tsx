'use client';

import AdminPanel from '@/components/AdminPanel';

/**
 * /admin/page.tsx - Admin Dashboard
 * 
 * Autenticación manejada por middleware.ts:
 * - Si NO hay token válido → middleware redirige a /admin/login
 * - Si hay token válido → se renderiza este componente
 */
export default function AdminPage() {
  return <AdminPanel />;
}
