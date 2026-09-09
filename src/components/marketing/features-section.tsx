'use client';

export function FeaturesSection() {
  const features = [
    {
      icon: '👵',
      title: 'Para el adulto mayor',
      description:
        'Tardes enriquecedoras con amigos, actividades mentales, café de especialidad, y oportunidad de ser mentor de generaciones más jóvenes.',
      points: ['Encuentros 2x por semana', 'Facilitadores expertos', 'Café + snacks incluidos'],
    },
    {
      icon: '😌',
      title: 'Para el familiar/pagador',
      description:
        'Tranquilidad de saber que tus padres están ocupados, seguros, y en un ambiente de respeto. Reportes semanales directos.',
      points: ['Reportes de asistencia', 'Comunicación directa', 'Flexibilidad en horarios'],
    },
    {
      icon: '🏘️',
      title: 'Para el condominio',
      description:
        'Activación del salón comunal, propuesta de valor para residentes, generador de ingresos sin inversión. Modelo ganador para todos.',
      points: ['Sin costo inicial', 'Sala comunal activada', 'Ingresos recurrentes'],
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Diseñado para todos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nuestro modelo beneficia a abuelos, familias y condominios
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-6">{feature.description}</p>

              <ul className="space-y-3">
                {feature.points.map((point, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <span className="text-blue-500 font-bold">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
