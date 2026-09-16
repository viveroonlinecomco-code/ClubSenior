'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useProximasActividades } from '@/hooks/useProximasActividades';
import { PersonalReportCard } from '@/components/personal-report-card';
import SubscriptionCard from './components/subscription-card';
import ReportsSection from './components/reports-section';
import AttendanceTable from './components/attendance-table';
import PaymentHistory from './components/payment-history';
import ProfileEditForm from './components/profile-edit-form';

export default function FamiliaPage() {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'reports' | 'payments'>('overview');
  const { data, loading, error } = useDashboardData();
  const { actividades, loading: actividadesLoading, error: actividadesError } = useProximasActividades();

  useEffect(() => {
    // Detectar si hay historial anterior
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleInscribirse = async (actividadId: number) => {
    try {
      console.log('Inscribirse en actividad:', actividadId);
      // TODO: Implementar POST /api/actividades/inscribirse
    } catch (err) {
      console.error('Error inscribirse:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
            className="bg-blue-500 hover:bg-blue-600 transition text-white px-4 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ✅ CRITICAL VALIDATION: Check if user completed inscription
  if (data && !data?.user?.inscripcion_completada) {
    // User hasn't completed all 4 steps or payment
    if (!data?.user?.nombre_abuelo || !data?.suscripcion) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-red-600 mb-4 text-lg font-semibold">
              ⚠️ Inscripción Incompleta
            </p>
            <p className="text-gray-600 mb-6">
              Por favor completa todos los pasos de registro para acceder al dashboard.
            </p>
            <button
              onClick={() => router.push('/inscribir')}
              className="bg-blue-500 hover:bg-blue-600 transition text-white px-6 py-2 rounded-lg font-semibold"
            >
              Completar Inscripción
            </button>
          </div>
        </div>
      );
    }
  }

  const noSuscripcion = !data?.suscripcion;

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => {
              if (canGoBack) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium mb-4"
          >
            ← Atrás
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header con Logout */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900">Generación Silver</h1>
              <p className="text-gray-700">Bienvenido a Grupo Plateado - Tardes de Café, Mente & Saberes</p>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={() => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_email');
                localStorage.removeItem('auth_user_id');
                window.location.href = '/';
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap"
            >
              🚪 Cerrar Sesión
            </button>
          </div>

          {/* Purpose Section - Always Visible */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8">
            <p className="text-lg sm:text-xl font-semibold mb-4 text-blue-900">🎯 Nuestro Propósito:</p>
            <p className="text-xl sm:text-2xl font-bold leading-relaxed mb-4 text-gray-900">
              Conectando generaciones a través de actividades significativas.
            </p>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Creemos que nunca es tarde para aprender, compartir y crear impacto.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <div>
                <p className="text-sm text-blue-700 mb-1">✓ Actividades diseñadas</p>
                <p className="font-semibold text-sm text-gray-800">Para tu bienestar</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 mb-1">✓ Comunidad conectada</p>
                <p className="font-semibold text-sm text-gray-800">De personas como tú</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 mb-1">✓ Espacio de sabiduría</p>
                <p className="font-semibold text-sm text-gray-800">Para compartir experiencias</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 mb-1">✓ Legado duradero</p>
                <p className="font-semibold text-sm text-gray-800">Impacto intergeneracional</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {noSuscripcion && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Explora nuestras actividades</h3>
            <p className="text-blue-700 text-sm">
              Descubre todas nuestras actividades. Completa el registro para inscribirte e acceder a tu reporte personalizado.
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-8 border-b border-gray-300 overflow-x-auto">
          {(['overview', 'profile', 'reports', 'payments'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold border-b-4 transition whitespace-nowrap ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' && 'Resumen'}
              {tab === 'profile' && 'Perfil'}
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
                  <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="text-gray-600 text-sm font-semibold mb-2">ASISTENCIA</div>
                    <p className="text-2xl font-bold text-blue-500 mb-1">
                      {data.asistencias.asistencias} / {data.asistencias.total}
                    </p>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-blue-500 hover:bg-blue-600 transition:bg-blue-600 h-2 rounded-full"
                        style={{ width: `${data.asistencias.tasa}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-600 text-xs mt-2">{data.asistencias.tasa}% de asistencia</p>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="text-gray-600 text-sm font-semibold mb-2">USUARIO</div>
                  <p className="text-sm text-gray-900 font-semibold">{data?.user.nombre || 'Usuario'} {data?.user.apellido || ''}</p>
                  <p className="text-xs text-gray-500 mt-1">{data?.user.email}</p>
                </div>
              </div>
            </div>

            {/* Próximas Actividades Section */}
            {(
              <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">📅 Próximas Actividades</h2>
                </div>
                <div className="p-6">
                  {actividadesLoading ? (
                    <p className="text-gray-600">Cargando actividades...</p>
                  ) : actividadesError ? (
                    <p className="text-red-600">Error: {actividadesError}</p>
                  ) : actividades.length === 0 ? (
                    <p className="text-gray-600">Sin actividades disponibles</p>
                  ) : (
                    <div className="space-y-4">
                      {actividades.map((act) => {
                        const colorMap: Record<string, { from: string; to: string; border: string; icon: string }> = {
                          fisica: { 
                            from: 'from-red-50', 
                            to: 'to-orange-50', 
                            border: 'border-red-200',
                            icon: '💪'
                          },
                          cognitiva: { 
                            from: 'from-blue-50', 
                            to: 'to-indigo-50', 
                            border: 'border-blue-200',
                            icon: '🧠'
                          },
                          social: { 
                            from: 'from-purple-50', 
                            to: 'to-pink-50', 
                            border: 'border-purple-200',
                            icon: '👥'
                          },
                          tertulia: { 
                            from: 'from-amber-50', 
                            to: 'to-yellow-50', 
                            border: 'border-amber-200',
                            icon: '📖'
                          },
                        };
                        
                        const colors = colorMap[act.modulo] || colorMap.social;
                        const fecha = new Date(act.fecha).toLocaleDateString('es-CO', { weekday: 'long', month: 'short', day: 'numeric' });
                        
                        return (
                          <div 
                            key={act.id}
                            className={`bg-gradient-to-br ${colors.from} ${colors.to} rounded-xl p-6 border ${colors.border}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-lg font-bold text-gray-900">
                                {colors.icon} {act.titulo}
                              </h3>
                              <span className="text-sm font-semibold text-gray-600 bg-white/60 px-3 py-1 rounded-full">
                                {act.hora_inicio}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              📅 {fecha}
                            </p>
                            <p className="text-sm text-gray-700">
                              {act.descripcion}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mi Reporte Personalizado */}
            {!noSuscripcion && (
              <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">📊 Mi Reporte de Participación</h2>
                </div>
                <div className="p-6">
                  <PersonalReportCard userData={data?.user} />
                </div>
              </div>
            )}

            {!noSuscripcion && (
              <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
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

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <ProfileEditForm
              initialData={{
                nombre_abuelo: data?.user.nombre || '',
                apellido_abuelo: data?.user.apellido || '',
                fecha_nacimiento: data?.user.fecha_nacimiento || '',
                ciudad: data?.user.ciudad || '',
                condominio: data?.suscripcion?.condominio || '',
                phone: data?.user.phone || '',
                email: data?.user.email || '',
              }}
            />
            
            {data?.suscripcion && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📋 Estado de Suscripción</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {data.suscripcion.plan === 'mensual' ? 'Plan Mensual ($150.000)' : 'Plan Por Sesión ($40.000)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <p className={`text-lg font-semibold ${
                      data.suscripcion.estado === 'activa' || data.suscripcion.estado === 'ACTIVA' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      ✅ {data.suscripcion.estado === 'activa' || data.suscripcion.estado === 'ACTIVA' ? 'ACTIVA' : data.suscripcion.estado}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Condominio</p>
                    <p className="text-lg font-semibold text-gray-900">{data.suscripcion.condominio || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Último Pago</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {data.suscripcion.fecha_pago 
                        ? new Date(data.suscripcion.fecha_pago).toLocaleDateString('es-CO')
                        : '-'
                      }
                    </p>
                  </div>
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
              <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
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
              <div className="bg-white rounded-lg shadow p-8 text-center border border-gray-200">
                <p className="text-gray-600">No hay pagos registrados</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-50 border-t border-gray-300 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Sobre Grupo Plateado</h3>
              <p className="text-gray-600 text-sm">
                Conectando generaciones, creando comunidad a través de actividades significativas.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Soporte</h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>📧 servicioalcliente@tardesdelcafe.com</li>
                <li>📞 <a href="https://wa.me/573002937403" className="hover:text-blue-500 transition">WhatsApp: 3002937403</a></li>
                <li>💬 Chat en vivo (Lun-Vie 9-18)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Legal</h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>
                  <a href="/terminos" className="hover:text-blue-500 transition">
                    Términos de Servicio
                  </a>
                </li>
                <li>
                  <a href="/privacidad" className="hover:text-blue-500 transition">
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition">
                    Contacta con nosotros
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-8 text-center text-gray-600 text-sm">
            <p>&copy; 2026 Grupo Plateado. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
