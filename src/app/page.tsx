'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, Brain, Users, BookOpen } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'vision' | 'impact'>('vision');

  const pillars = [
    {
      icon: Heart,
      title: 'Actividades Físicas',
      description: 'Mantener movilidad, coordinación, equilibrio y resistencia',
      activities: ['Movimiento Vital', 'Equilibrio & Energía', 'Actívate', 'Baile & Movimiento'],
      color: 'from-red-50 to-orange-50',
      accentColor: '#EF4444',
    },
    {
      icon: Brain,
      title: 'Actividades Cognitivas',
      description: 'Estimular memoria, atención y mantener la mente activa',
      activities: ['Mente Activa'],
      color: 'from-blue-50 to-indigo-50',
      accentColor: '#3B82F6',
    },
    {
      icon: Users,
      title: 'Sociales & Creativas',
      description: 'Fortalecer vínculos y estimular la creatividad',
      activities: ['Pintando Recuerdos', 'Club de Amigos', 'Creando Experiencias'],
      color: 'from-purple-50 to-pink-50',
      accentColor: '#A855F7',
    },
    {
      icon: BookOpen,
      title: 'Tertulias & Storytelling',
      description: 'Preservar sabiduría ancestral e impacto intergeneracional',
      activities: ['Tertulia de Recuerdos', 'Ateneo de Sabiduría', 'Proyectos de Legado'],
      color: 'from-amber-50 to-yellow-50',
      accentColor: '#FBBF24',
    },
  ];

  const impactStats = [
    { number: '83%', label: 'Mejor Movilidad', description: 'Mejora en coordinación y equilibrio' },
    { number: '92%', label: 'Mayor Memoria', description: 'Estimulación cognitiva regular' },
    { number: '89%', label: 'Nuevas Amistades', description: 'Conexiones comunitarias fuertes' },
    { number: '78%', label: 'Impacto Legado', description: 'Historias compartidas y preservadas' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-700 rounded-lg"></div>
              <span className="text-lg font-bold text-gray-900">ClubSenior</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#proposito" className="text-sm text-gray-600 hover:text-gray-900">
                Propósito
              </a>
              <a href="#pilares" className="text-sm text-gray-600 hover:text-gray-900">
                Pilares
              </a>
              <a href="#impacto" className="text-sm text-gray-600 hover:text-gray-900">
                Impacto
              </a>
              <a href="#planes" className="text-sm text-gray-600 hover:text-gray-900">
                Planes
              </a>
            </div>
            <Link
              href="/signin"
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 transition text-white rounded-lg font-medium text-sm"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Purpose */}
      <section id="proposito" className="relative bg-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900">
              Tardes de Café,<br />
              Mente y Saberes
            </h1>

            {/* Purpose Box - Central Element */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 sm:p-12 mb-8 max-w-3xl mx-auto">
              <p className="text-lg sm:text-xl font-semibold mb-4 text-blue-900">🎯 Nuestro Propósito</p>
              <p className="text-2xl sm:text-3xl font-bold leading-relaxed text-gray-900">
                Conectar generaciones a través de actividades significativas.
              </p>
              <p className="text-lg mt-6 text-gray-700 leading-relaxed">
                Creemos que nunca es tarde para aprender, compartir y crear impacto en la comunidad.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-700 mb-1">✓ Actividades diseñadas</p>
                <p className="font-semibold text-gray-900">Para tu bienestar</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-700 mb-1">✓ Comunidad conectada</p>
                <p className="font-semibold text-gray-900">De personas como tú</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-700 mb-1">✓ Espacio de sabiduría</p>
                <p className="font-semibold text-gray-900">Para compartir experiencias</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-700 mb-1">✓ Legado duradero</p>
                <p className="font-semibold text-gray-900">Impacto intergeneracional</p>
              </div>
  
          </div>
        </div>
      </section>

      {/* The Four Pillars */}
      <section id="pilares" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Cuatro Pilares</h2>
            <p className="text-lg text-gray-600">
              Cada actividad está diseñada en torno a estos pilares fundamentales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${pillar.color} rounded-2xl p-8 border border-gray-200`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${pillar.accentColor}20` }}
                    >
                      <Icon size={28} style={{ color: pillar.accentColor }} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{pillar.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{pillar.description}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Actividades incluidas
                    </p>
                    <ul className="space-y-2">
                      {pillar.activities.map((activity, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: pillar.accentColor }}
                          ></div>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impacto" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que Nuestros Participantes Experimentan
            </h2>
            <p className="text-lg text-gray-600">
              Resultados tangibles en bienestar físico, mental y comunitario
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 text-center">
                <p className="text-5xl font-bold text-blue-500 mb-2">{stat.number}</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{stat.label}</h3>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-12 border border-green-200">
            <p className="text-lg text-gray-700 italic mb-6">
              "Desde que comencé con ClubSenior, tengo más energía y me siento conectada con mi
              comunidad. Las tardes de café se convirtieron en mi momento favorito de la semana.
              Nunca pensé que pudiera hacer amigos nuevos a mi edad."
            </p>
            <p className="font-semibold text-gray-900">María García, 72 años</p>
            <p className="text-sm text-gray-600">Bogotá, Colombia</p>
          </div>
        </div>
      </section>

      {/* PLANES SECTION - NEW */}
      <section id="planes" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Planes</h2>
            <p className="text-lg text-gray-600">
              Elige el plan que mejor se ajusta a tu ritmo y disponibilidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Plan Mensual - POPULAR */}
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-blue-500 transform md:scale-105">
              <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white py-3 px-6 text-center font-bold text-sm">
                ⭐ MÁS POPULAR
              </div>

              <div className="pt-16 px-8 pb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plan Mensual</h3>
                <p className="text-gray-600 mb-6">4 sesiones de 2 horas cada una</p>

                <div className="bg-blue-50 rounded-lg p-6 mb-8">
                  <p className="text-gray-600 text-sm mb-1">Precio mensual</p>
                  <p className="text-4xl font-bold text-gray-900">
                    $150.000
                    <span className="text-lg text-gray-600 font-normal">/mes</span>
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span className="text-gray-700">4 sesiones de 2 horas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span className="text-gray-700">Válido por 6 semanas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span className="text-gray-700">Sin penalizaciones por faltas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span className="text-gray-700">Acceso a facilitador especializado</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span className="text-gray-700">Café incluido en cada sesión</span>
                  </li>
                </ul>

                <Link
                  href="/planes"
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition text-center block"
                >
                  Seleccionar Plan
                </Link>
              </div>
            </div>

            {/* Plan Por Sesión */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-gray-300">
              <div className="px-8 pt-8 pb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pago por Sesión</h3>
                <p className="text-gray-600 mb-6">Sin compromisos, paga lo que uses</p>

                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <p className="text-gray-600 text-sm mb-1">Precio por sesión</p>
                  <p className="text-4xl font-bold text-gray-900">
                    $40.000
                    <span className="text-lg text-gray-600 font-normal">/sesión</span>
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span className="text-gray-700">$40.000 por sesión de 2 horas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span className="text-gray-700">Sin contratos ni compromisos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span className="text-gray-700">Flexibilidad total</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span className="text-gray-700">Acceso a facilitador especializado</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span className="text-gray-700">Café incluido en cada sesión</span>
                  </li>
                </ul>

                <Link
                  href="/planes"
                  className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition text-center block"
                >
                  Seleccionar Plan
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">¿Preguntas sobre nuestros planes?</p>
            <p className="text-gray-700">
              📧 <a href="mailto:soporte@clubsenior.co" className="text-blue-500 hover:underline">soporte@clubsenior.co</a> | 
              📞 <a href="tel:+5718000000" className="text-blue-500 hover:underline">+57 1 8000 0000</a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Listo para empezar?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Únete a cientos de personas que ya están experimentando el impacto de nuestras
            actividades
          </p>
          <Link
            href="/inscribir"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 transition text-white rounded-lg font-semibold text-lg"
          >
            Crear Cuenta
            <ArrowRight size={20} />
       </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-3">Sobre ClubSenior</h3>
              <p className="text-sm leading-relaxed">
                Conectando generaciones, creando comunidad a través de actividades significativas.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Soporte</h3>
              <ul className="text-sm space-y-2">
                <li>📧 soporte@clubsenior.co</li>
                <li>📞 +57 1 8000 0000</li>
                <li>💬 Chat en vivo (Lun-Vie 9-18)</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Legal</h3>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Términos de Servicio
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contacta con nosotros
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 ClubSenior. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
