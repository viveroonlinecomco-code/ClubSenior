'use client';

export function HeroSection() {
  return (
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
  );
}
