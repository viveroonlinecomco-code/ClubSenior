'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">ClubSenior</h1>
          <p className="text-2xl text-gray-700 mb-8">Tardes de Café, Mente & Saberes</p>
          <p className="text-lg text-gray-600 mb-12">Conectando generaciones, creando comunidad</p>
          <a href="/auth/signin" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold">
            Comenzar Ahora
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">¿Para quién es?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border-2 border-gray-200 rounded-lg hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold mb-4 text-blue-600">Para Abuelos</h3>
              <p className="text-gray-600 text-lg">Actividades significativas, reportes de bienestar, conexión con familia y comunidad</p>
            </div>
            <div className="p-8 border-2 border-gray-200 rounded-lg hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold mb-4 text-blue-600">Para Familias</h3>
              <p className="text-gray-600 text-lg">Seguimiento del bienestar, reportes semanales, tranquilidad garantizada</p>
            </div>
            <div className="p-8 border-2 border-gray-200 rounded-lg hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold mb-4 text-blue-600">Para Condominios</h3>
              <p className="text-gray-600 text-lg">Gestión integral, actividades organizadas, comunidad fortalecida</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Planes de Suscripción</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
              <p className="text-5xl font-bold text-blue-600 mb-2">$160.000</p>
              <p className="text-xl font-semibold text-gray-900 mb-6">Por mes - Individual</p>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li>✓ 1 Adulto Mayor</li>
                <li>✓ Actividades semanales</li>
                <li>✓ Reportes de asistencia</li>
              </ul>
            </div>
            <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-8">
              <p className="text-5xl font-bold text-blue-600 mb-2">$450.000</p>
              <p className="text-xl font-semibold text-gray-900 mb-6">Por mes - Condominio</p>
              <ul className="space-y-3 text-gray-600 mb-8">
                <li>✓ Hasta 50 Adultos Mayores</li>
                <li>✓ Actividades diarias</li>
                <li>✓ Reportes detallados</li>
                <li>✓ Soporte dedicado</li>
              </ul>
            </div>
          </div>
          <div className="text-center">
            <Link href="/auth/signin" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-lg font-semibold text-lg transition">
              Comenzar Ahora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
