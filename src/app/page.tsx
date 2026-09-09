'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center max-w-3xl">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">ClubSenior</h1>
          <p className="text-2xl text-gray-700 mb-8">Tardes de Café, Mente & Saberes</p>
          <p className="text-lg text-gray-600 mb-12">Conectando generaciones, creando comunidad</p>
          <Link href="/signin" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold">
            Comenzar Ahora
          </Link>
        </div>
      </div>

      <div className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">¿Para quién es?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border-2 border-gray-200 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4 text-blue-600">Para Abuelos</h3>
              <p className="text-gray-600">Actividades significativas</p>
            </div>
            <div className="p-8 border-2 border-gray-200 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4 text-blue-600">Para Familias</h3>
              <p className="text-gray-600">Seguimiento del bienestar</p>
            </div>
            <div className="p-8 border-2 border-gray-200 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4 text-blue-600">Para Condominios</h3>
              <p className="text-gray-600">Gestión integral</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Planes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
              <p className="text-5xl font-bold text-blue-600 mb-2">$160.000</p>
              <p className="text-xl font-semibold">Individual</p>
            </div>
            <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-8">
              <p className="text-5xl font-bold text-blue-600 mb-2">$450.000</p>
              <p className="text-xl font-semibold">Condominio</p>
            </div>
          </div>
          <div className="text-center">
            <Link href="/signin" className="inline-block bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold">
              Comenzar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
