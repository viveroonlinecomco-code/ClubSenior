'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function PricingSection() {
  const plans = [
    {
      name: 'Mensual',
      price: 160000,
      frequency: 'por mes',
      duration: '4 sesiones',
      features: [
        'Acceso a 2 tardes por semana',
        'Café de especialidad + snacks',
        'Facilitador experto',
        'Reportes semanales',
        'Seguro incluido',
      ],
      cta: 'Comenzar ahora',
      highlighted: true,
    },
    {
      name: 'Trimestral',
      price: 450000,
      frequency: 'cada 3 meses',
      duration: '12 sesiones',
      features: [
        'Todo lo del plan mensual',
        'Descuento 6% vs mensual',
        'Acceso a 5 módulos especiales',
        'Prioridad en actividades',
        'Certificado de participación',
      ],
      cta: 'Suscribirse',
      highlighted: false,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Planes simples y transparentes
          </h2>
          <p className="text-xl text-gray-600">
            Elige el plan que mejor se adapte a tu familia
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl transition-all ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl scale-105'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                    ¡MÁS POPULAR!
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan name */}
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    plan.highlighted ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-5xl font-bold mb-2">
                    ${plan.price.toLocaleString('es-CO')}
                  </div>
                  <p
                    className={`text-sm ${
                      plan.highlighted ? 'text-blue-100' : 'text-gray-600'
                    }`}
                  >
                    {plan.frequency}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      plan.highlighted ? 'text-blue-200' : 'text-gray-500'
                    }`}
                  >
                    {plan.duration}
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className={`text-xl mt-1 ${
                          plan.highlighted ? 'text-yellow-400' : 'text-blue-500'
                        }`}
                      >
                        ✓
                      </span>
                      <span
                        className={`text-sm ${
                          plan.highlighted
                            ? 'text-blue-50'
                            : 'text-gray-700'
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href="/inscribir">
                  <Button
                    size="lg"
                    className={`w-full py-6 text-base font-semibold ${
                      plan.highlighted
                        ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Todos los planes incluyen{' '}
            <span className="font-semibold">30 días de garantía</span>
          </p>
        </div>
      </div>
    </section>
  );
}
