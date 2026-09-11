'use client';

import { useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import SubscriptionCard from './components/subscription-card';
import ReportsSection from './components/reports-section';
import AttendanceTable from './components/attendance-table';
import PaymentHistory from './components/payment-history';

export default function FamiliaPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'payments'>('overview');
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ Error cargando datos: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const noSuscripcion = !data?.suscripcion;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Mi Familia</h1>
          <p className="text-green-100">Bienvenido a ClubSenior - Tardes de Café, Mente & Saberes</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {noSuscripcion && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Suscripción pendiente</h3>
            <p className="text-yellow-700 text-sm">
              Por favor completa el registro para ver tus datos y actividades.
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-8 border-b border-gray-300">
          {(['overview', 'reports', 'payments'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold border-b-4 transition ${
                activeTab === tab
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' && 'Resumen'}
              {tab === 'reports' && 'Reportes'}
              {tab === 'payments' && 'Pagos'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <SubscriptionCard suscripcion={data?.suscripcion} />
              </div>

              <div className="space-y-4">
                {data?.asistencias && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-600 text-sm font-semibold mb-2">ASISTENCIA</div>
                    <p className="text-2xl font-bold text-green-600 mb-1">
                      {data.asistencias.asistencias} / {data.asistencias.total}
                    </p>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${data.asistencias.tasa}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-600 text-xs mt-2">{data.asistencias.tasa}% de asistencia</p>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-gray-600 text-sm font-semibold mb-2">USUARIO</div>
                  <p className="text-sm font-mono text-gray-600 break-all">{data?.user.email}</p>
                </div>
              </div>
            </div>

            {!noSuscripcion && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Asistencia Reciente</h2>
                </div>
                <div className="overflow-x-auto">
                  <AttendanceTable limit={5} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            {data?.reportes && data.reportes.length > 0 ? (
              <ReportsSection reportes={data.reportes} />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No hay reportes disponibles aún</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            {data?.pagos && data.pagos.length > 0 ? (
              <PaymentHistory pagos={data.pagos} />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No hay pagos registrados</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-100 border-t border-gray-300 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Sobre ClubSenior</h3>
              <p className="text-gray-600 text-sm">
                Conectando generaciones, creando comunidad a través de actividades significativas.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Soporte</h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>📧 soporte@clubsenior.co</li>
                <li>📞 +57 1 8000 000</li>
                <li>💬 Chat en vivo (Lun-Vie 9-18)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Legal</h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>
                  <a href="#" className="hover:text-green-600">
                    Términos de Servicio
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-600">
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-green-600">
                    Contacta con nosotros
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2026 ClubSenior. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
