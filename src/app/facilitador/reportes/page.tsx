'use client';

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reportes Semanales</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Crea y gestiona reportes de progreso de participantes</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            📝 Esta página permitirá crear reportes semanales detallados
          </p>
          <div className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm">
            🚀 Próximamente
          </div>
        </div>
      </div>
    </div>
  );
}
