'use client';

export function FeaturesSection() {
  return (
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
  );
}
