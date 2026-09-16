// /components/AdminPanel.tsx
// VERSIÓN ALTERNATIVA: Sin dependencias de shadcn/ui
// Usa Tailwind CSS + HTML puro para máxima compatibilidad

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface DashboardData {
  totalCondominios: number;
  totalParticipantes: number;
  ingreseMes: number;
  tasaRetencion: number;
  actividadesTotal: number;
  actividadesEste: number;
  tasaAsistencia: number;
  participantesActivos: number;
  suscripcionesActivas: number;
  pagosPendientes: number;
  tasaMorosidad: number;
}

export default function AdminPanel() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [data, setData] = useState<DashboardData>({
    totalCondominios: 0,
    totalParticipantes: 0,
    ingreseMes: 0,
    tasaRetencion: 0,
    actividadesTotal: 0,
    actividadesEste: 0,
    tasaAsistencia: 0,
    participantesActivos: 0,
    suscripcionesActivas: 0,
    pagosPendientes: 0,
    tasaMorosidad: 0,
  });

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const email = Cookies.get('user_email');
        const adminStatus = Cookies.get('is_admin') === 'true';

        if (!email || !adminStatus) {
          setError('No autorizado. Solo admins pueden acceder.');
          setTimeout(() => router.push('/'), 2000);
          return;
        }

        setUserEmail(email);
        setIsAdmin(true);

        // Aquí cargar datos cuando tengas Supabase conectado
        // Por ahora, usar datos estáticos para testing
        setData({
          totalCondominios: 2,
          totalParticipantes: 15,
          ingreseMes: 2100000,
          tasaRetencion: 87,
          actividadesTotal: 12,
          actividadesEste: 7,
          tasaAsistencia: 85,
          participantesActivos: 15,
          suscripcionesActivas: 23,
          pagosPendientes: 4,
          tasaMorosidad: 12.5,
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error validando sesión:', err);
        setError('Error validando sesión');
        setIsLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('user_email');
    Cookies.remove('is_admin');
    Cookies.remove('admin_roles');
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 border border-red-300 bg-red-50 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-sm text-gray-500 mt-1">
              Bienvenido/a, <span className="font-medium">{userEmail}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjeta de estado admin */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-blue-900">✅ Acceso Admin Completo</h2>
              <p className="text-sm text-blue-700 mt-1">
                Tienes acceso total a todas las funcionalidades del sistema
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded">
              Admin
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 General
            </button>
            <button
              onClick={() => setActiveTab('actividades')}
              className={`flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors ${
                activeTab === 'actividades'
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Actividades
            </button>
            <button
              onClick={() => setActiveTab('finanzas')}
              className={`flex-1 px-4 py-3 text-center font-medium border-b-2 transition-colors ${
                activeTab === 'finanzas'
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              💰 Finanzas
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* TAB 1: GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Gestión General</h2>

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Card 1: Condominios */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Condominios</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalCondominios}</p>
                    <p className="text-xs text-gray-500 mt-1">activos en el sistema</p>
                  </div>

                  {/* Card 2: Participantes */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Participantes</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data.totalParticipantes}</p>
                    <p className="text-xs text-gray-500 mt-1">adultos mayores inscritos</p>
                  </div>

                  {/* Card 3: Ingresos */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Ingresos (Mes)</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      ${(data.ingreseMes / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-gray-500 mt-1">recaudado este mes</p>
                  </div>

                  {/* Card 4: Retención */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Retención</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data.tasaRetencion}%</p>
                    <p className="text-xs text-gray-500 mt-1">tasa de retención</p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-3">Acciones Rápidas</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Ver todos los condominios
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-colors">
                      Gestionar usuarios
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-colors">
                      Reportes avanzados
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-colors">
                      Configuración
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACTIVIDADES */}
            {activeTab === 'actividades' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Actividades y Asistencias</h2>

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Total Actividades</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data.actividadesTotal}</p>
                    <p className="text-xs text-gray-500 mt-1">desde el inicio</p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Este Mes</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data.actividadesEste}</p>
                    <p className="text-xs text-gray-500 mt-1">actividades programadas</p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Asistencia</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data.tasaAsistencia}%</p>
                    <p className="text-xs text-gray-500 mt-1">tasa promedio</p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Participantes Activos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data.participantesActivos}</p>
                    <p className="text-xs text-gray-500 mt-1">participando regularmente</p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-3">Acciones Rápidas</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Nueva actividad
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-colors">
                      Ver cronograma
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-colors">
                      Registrar asistencia
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-colors">
                      Reportes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: FINANZAS */}
            {activeTab === 'finanzas' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Gestión Financiera</h2>

                {/* Alerta */}
                {data.pagosPendientes > 0 && (
                  <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-800">
                      ⚠️ Hay {data.pagosPendientes} pagos pendientes o vencidos
                    </p>
                  </div>
                )}

                {/* KPIs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Ingresos (Mes)</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      ${(data.ingreseMes / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-gray-500 mt-1">recaudado este mes</p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Suscripciones</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data.suscripcionesActivas}</p>
                    <p className="text-xs text-gray-500 mt-1">activas</p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className={`text-3xl font-bold mt-2 ${data.pagosPendientes > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {data.pagosPendientes}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">requieren seguimiento</p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Morosidad</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data.tasaMorosidad}%</p>
                    <p className="text-xs text-gray-500 mt-1">de suscripciones</p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-3">Acciones Rápidas</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Nueva suscripción
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-colors">
                      Ver suscripciones
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-colors">
                      Procesar pagos
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg transition-colors">
                      Reportes financieros
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
