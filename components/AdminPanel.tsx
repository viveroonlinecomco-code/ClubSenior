// /components/AdminPanel.tsx
// SIMPLIFICADO: Admin único - Todo en 1 vista sin tabs

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPanel() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = async () => {
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
        setIsLoading(false);
      } catch (err) {
        console.error('Error validando sesión:', err);
        setError('Error validando sesión');
        setIsLoading(false);
      }
    };

    checkAuth();
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Alert className="max-w-md border-red-300 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Administración
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Bienvenido/a, <span className="font-medium">{userEmail}</span>
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
          >
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjeta de estado admin */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-blue-900">✅ Acceso Admin Completo</CardTitle>
                <CardDescription className="text-blue-700">
                  Tienes acceso total a todas las funcionalidades del sistema
                </CardDescription>
              </div>
              <Badge className="bg-blue-600">Admin</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs con secciones */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full rounded-t-lg border-b border-gray-200 bg-gray-50 p-0">
              <TabsTrigger 
                value="general"
                className="rounded-none flex-1 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              >
                📊 General
              </TabsTrigger>
              <TabsTrigger
                value="actividades"
                className="rounded-none flex-1 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              >
                👥 Actividades
              </TabsTrigger>
              <TabsTrigger
                value="finanzas"
                className="rounded-none flex-1 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
              >
                💰 Finanzas
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: GENERAL */}
            <TabsContent value="general" className="p-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Gestión General</h2>
                
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Condominios
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">2</div>
                      <p className="text-xs text-gray-500 mt-1">activos en el sistema</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Participantes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">15</div>
                      <p className="text-xs text-gray-500 mt-1">adultos mayores inscritos</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Ingresos (Mes)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">$2.1M</div>
                      <p className="text-xs text-gray-500 mt-1">recaudado este mes</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Retención
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">87%</div>
                      <p className="text-xs text-gray-500 mt-1">tasa de retención</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Botones de acción */}
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Ver todos los condominios
                    </Button>
                    <Button variant="outline">
                      Gestionar usuarios
                    </Button>
                    <Button variant="outline">
                      Reportes avanzados
                    </Button>
                    <Button variant="outline">
                      Configuración del sistema
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: ACTIVIDADES */}
            <TabsContent value="actividades" className="p-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Actividades y Asistencias</h2>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Total Actividades
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">12</div>
                      <p className="text-xs text-gray-500 mt-1">desde el inicio</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Este Mes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">7</div>
                      <p className="text-xs text-gray-500 mt-1">actividades programadas</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Asistencia
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">85%</div>
                      <p className="text-xs text-gray-500 mt-1">tasa promedio</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Participantes Activos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">35</div>
                      <p className="text-xs text-gray-500 mt-1">participando regularmente</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Acciones */}
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Nueva actividad
                    </Button>
                    <Button variant="outline">
                      Ver cronograma
                    </Button>
                    <Button variant="outline">
                      Registrar asistencia
                    </Button>
                    <Button variant="outline">
                      Reportes de actividades
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 3: FINANZAS */}
            <TabsContent value="finanzas" className="p-6">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Gestión Financiera</h2>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Ingresos (Mes)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">$3.2M</div>
                      <p className="text-xs text-gray-500 mt-1">recaudado este mes</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Suscripciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">23</div>
                      <p className="text-xs text-gray-500 mt-1">activas</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Pendientes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600">4</div>
                      <p className="text-xs text-gray-500 mt-1">requieren seguimiento</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Morosidad
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900">12.5%</div>
                      <p className="text-xs text-gray-500 mt-1">de suscripciones</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Acciones */}
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Nueva suscripción
                    </Button>
                    <Button variant="outline">
                      Ver suscripciones
                    </Button>
                    <Button variant="outline">
                      Procesar pagos
                    </Button>
                    <Button variant="outline">
                      Reportes financieros
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
