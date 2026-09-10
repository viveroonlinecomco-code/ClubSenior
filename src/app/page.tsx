'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import ThemeToggle dynamically without server-side rendering
const ThemeToggle = dynamic(() => import('@/components/theme-toggle').then(mod => ({ default: mod.ThemeToggle })), {
  ssr: false,
  loading: () => <div className="w-10 h-10" /> // Placeholder while loading
});

export default function Home() {
  return (
    <div>
      {/* Header */}
      <header className="fixed top-0 right-0 z-50 p-4">
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950 flex items-center justify-center px-4 pt-16 sm:pt-0">
        <div className="text-center max-w-3xl animate-fade-in">
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            ClubSenior
          </h1>
          <p className="text-xl sm:text-2xl text-slate-700 dark:text-slate-300 mb-8 font-semibold">
            Tardes de Café, Mente & Saberes
          </p>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
            Conectando generaciones, creando comunidad
          </p>
          <Link 
            href="/signin" 
            className="inline-block btn-primary px-8 py-3 text-lg animate-fade-in-up hover-lift"
          >
            Comenzar Ahora
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 text-slate-900 dark:text-white">
            ¿Para quién es?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 hover-lift">
              <h3 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
                Para Abuelos
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Actividades significativas, conexiones auténticas y un espacio para compartir saberes.
              </p>
            </div>
            <div className="card p-8 hover-lift">
              <h3 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
                Para Familias
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Seguimiento del bienestar y reportes semanales de actividades y asistencia.
              </p>
            </div>
            <div className="card p-8 hover-lift">
              <h3 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
                Para Condominios
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Gestión integral de programas comunitarios y facilitadores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 text-slate-900 dark:text-white">
            Planes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Individual Plan */}
            <div className="card-elevated p-8 hover-lift">
              <div className="mb-6">
                <p className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400">
                  $160.000
                </p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white mt-2">
                  Mensual Individual
                </p>
              </div>
              <ul className="space-y-3 mb-8 text-slate-600 dark:text-slate-400">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span> Acceso a todas las actividades
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span> Reportes semanales
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span> Soporte por email
                </li>
              </ul>
            </div>

            {/* Condominium Plan */}
            <div className="card-elevated p-8 border-2 border-blue-500 dark:border-blue-400 hover-lift">
              <div className="inline-block badge-primary mb-4">Más Popular</div>
              <div className="mb-6">
                <p className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400">
                  $450.000
                </p>
                <p className="text-xl font-semibold text-slate-900 dark:text-white mt-2">
                  Trimestral Condominio
                </p>
              </div>
              <ul className="space-y-3 mb-8 text-slate-600 dark:text-slate-400">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span> Múltiples residentes
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span> Gestor de actividades
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span> Soporte prioritario
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span> Reportes avanzados
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link 
              href="/signin" 
              className="inline-block btn-primary px-10 py-4 text-lg hover-lift"
            >
              Comenzar
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 dark:bg-slate-950 text-slate-400">
        <div className="max-w-7xl mx-auto text-center">
          <p>© 2026 ClubSenior. Conectando generaciones, creando comunidad.</p>
        </div>
      </footer>
    </div>
  );
}
