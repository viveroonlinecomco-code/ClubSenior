'use client';

import { useState } from 'react';

export default function AdminReportesPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleGenerateTestReportes = async () => {
    setError('');
    setSuccess('');
    setResult(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('No authentication token found. Please login first.');
        return;
      }

      const response = await fetch('/api/reportes/seed-test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(`Error: ${data.error}`);
        return;
      }

      const data = await response.json();
      setSuccess(`✅ ${data.created} reportes de prueba creados exitosamente`);
      setResult(data.reportes);
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Admin Panel - Testing</h1>
          <p className="text-purple-100">Herramientas para generar datos de prueba</p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Generar Reportes de Prueba</h2>

          <p className="text-gray-600 mb-6">
            Este botón creará 3 reportes semanales para cada participante registrado,
            con contenido realista y calificaciones aleatorias.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <button
            onClick={handleGenerateTestReportes}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading ? 'Generando...' : '📋 Generar Reportes de Prueba'}
          </button>

          {result && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Reportes Generados:</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.map((r: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-sm">
                      <strong>{r.participante}</strong> - Semana {r.semana}
                    </p>
                    <p className="text-xs text-gray-600">
                      Calificación: {'⭐'.repeat(r.calificacion)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Nota</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Este endpoint es SOLO para testing/desarrollo</li>
              <li>Crea reportes con contenido y datos realistas</li>
              <li>Los reportes aparecerán en el dashboard bajo la sección "Reportes"</li>
              <li>Puedes generar nuevos reportes tantas veces como quieras</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
