'use client';

import { useState } from 'react';
import SubscriptionCard from './components/subscription-card';
import ReportsSection from './components/reports-section';
import AttendanceTable from './components/attendance-table';
import PaymentHistory from './components/payment-history';

export default function FamiliaPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'payments'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Panel Familiar</h1>
          <p className="text-blue-100">Bienvenido a ClubSenior - Tardes de Café, Mente & Saberes</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 border-b border-gray-300">
          {(['overview', 'reports', 'payments'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold border-b-4 transition ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
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
                <SubscriptionCard />
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-gray-600 text-sm font-semibold mb-2">PRÓXIMA ACTIVIDAD</div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">Yoga Terapéutico</p>
                  <p className="text-gray-600 text-sm">Mañana a las 10:00 AM</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-gray-600 text-sm font-semibold mb-2">ASISTENCIA MES</div>
                  <p className="text-2xl font-bold text-green-600 mb-1">8 / 12</p>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Asistencia Reciente</h2>
              </div>
              <div className="overflow-x-auto">
                <AttendanceTable limit={5} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <ReportsSection />
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <PaymentHistory />
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
              <h3 className="font-bold text-gray-900 mb-3">Cuenta</h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li className="hover:text-blue-600 cursor-pointer">Editar Perfil</li>
                <li className="hover:text-blue-600 cursor-pointer">Cambiar Contraseña</li>
                <li className="hover:text-blue-600 cursor-pointer">Cancelar Suscripción</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2026 ClubSenior - Todos los derechos reservados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
