'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Logo/Badge */}
          <div className="mb-8">
            <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              ☕ Tardes de Café, Mente & Saberes
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Tranquilidad para el familiar
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Actividad para el adulto mayor
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Conecta adultos mayores autónomos con experiencias de acompañamiento,
            cultura y encuentro. Mientras tus padres disfrutan de tardes enriquecedoras,
            tú tienes la tranquilidad de saber que están en buenas manos.
          </p>

          {/* Value proposition - 3 columns */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur p-6 rounded-lg">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold text-gray-900 mb-2">Acompañamiento</h3>
              <p className="text-sm text-gray-600">
                Encuentros en condominio con facilitadores expertos
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur p-6 rounded-lg">
              <div className="text-3xl mb-2">🧠</div>
              <h3 className="font-semibold text-gray-900 mb-2">Actividades</h3>
              <p className="text-sm text-gray-600">
                Mentoría, café de especialidad, huertos urbanos
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur p-6 rounded-lg">
              <div className="text-3xl mb-2">❤️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Tranquilidad</h3>
              <p className="text-sm text-gray-600">
                Reportes semanales y comunicación con familia
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              >
                Comenzar →
              </Button>
            </Link>

            <Link href="#features">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg border-2 text-gray-900 hover:bg-gray-50"
              >
                Saber más
              </Button>
            </Link>
          </div>

          {/* Social proof / Stats */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-gray-600 text-sm mb-4">
              Servicio dirigido a condominios de Sabana de Bogotá
            </p>
            <div className="flex justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <p className="text-sm text-gray-600">Participantes activos</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">3</div>
                <p className="text-sm text-gray-600">Condominios</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <p className="text-sm text-gray-600">Satisfacción</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
