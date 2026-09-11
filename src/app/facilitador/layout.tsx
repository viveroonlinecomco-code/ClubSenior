'use client';

import Link from 'next/link';
import { FacilitadorAuthGuard } from '@/components/facilitador-auth-guard-new';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FacilitadorAuthGuard>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg">
          <nav className="h-full flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-purple-600">ClubSenior</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Panel Facilitador</p>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <NavLink href="/facilitador/dashboard" icon="📊">
                Dashboard
              </NavLink>
              <NavLink href="/facilitador/actividades" icon="📅">
                Actividades
              </NavLink>
              <NavLink href="/facilitador/asistencia" icon="✓">
                Asistencia
              </NavLink>
              <NavLink href="/facilitador/reportes" icon="📝">
                Reportes
              </NavLink>
              <NavLink href="/facilitador/participantes" icon="👥">
                Participantes
              </NavLink>
              <NavLink href="/facilitador/settings" icon="⚙️">
                Configuración
              </NavLink>
            </div>

            {/* Footer */}
            <div className="p-4 border-t dark:border-gray-700">
              <button
                onClick={() => {
                  localStorage.removeItem('facilitador_token');
                  localStorage.removeItem('facilitador_role');
                  window.location.href = '/facilitador-login';
                }}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
              >
                🚪 Cerrar sesión
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </FacilitadorAuthGuard>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition"
    >
      <span className="text-xl">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
