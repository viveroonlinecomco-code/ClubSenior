'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function TerminosPage() {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Detectar si hay historial anterior
    setCanGoBack(window.history.length > 1);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:py-16">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium mb-8"
        >
          ← Atrás
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Términos de Servicio</h1>
          <p className="text-gray-600">ClubSenior - Tardes de Café, Mente & Saberes</p>
          <p className="text-gray-500 text-sm mt-2">Última actualización: Septiembre 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceptación de Términos</h2>
            <p>
              Al acceder y utilizar ClubSenior, aceptas estar vinculado por estos Términos de Servicio. 
              Si no estás de acuerdo con alguna parte de estos términos, no puedes utilizar nuestro servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descripción del Servicio</h2>
            <p>
              ClubSenior es una plataforma diseñada para conectar la Generación Silver (adultos mayores) 
              con actividades significativas, fomentando el bienestar mental, físico y social a través de 
              sesiones semanales de "Tardes de Café, Mente & Saberes".
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Planes y Suscripción</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">Plan Mensual - 4 Sesiones</h3>
                <p className="text-gray-600">
                  $150,000 COP por mes. Incluye 4 sesiones de 2 horas cada una, válido por 6 semanas. 
                  Si faltas, puedes usar tus sesiones en fechas posteriores.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pago por Sesión</h3>
                <p className="text-gray-600">
                  $40,000 COP por sesión de 2 horas. Sin compromisos ni contratos. Paga solo lo que usas.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Pagos</h2>
            <p>
              Los pagos se realizan a través de Wompi, nuestra plataforma de procesamiento de pagos segura. 
              Todos los pagos son en pesos colombianos (COP). Los recibos se enviarán automáticamente por email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cancelación de Suscripción</h2>
            <p>
              Puedes cancelar tu suscripción en cualquier momento desde tu dashboard. La cancelación es efectiva 
              inmediatamente. No hay penalidades por cancelación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Participantes y Responsabilidades</h2>
            <p>
              Las familias son responsables de proporcionar información precisa sobre los participantes (adultos mayores). 
              ClubSenior no se responsabiliza por información inexacta proporcionada durante el registro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
            <p>
              ClubSenior no es responsable por lesiones, enfermedades o daños que ocurran durante las sesiones. 
              Cada participante asume su propio riesgo. Se recomienda consultar con un médico antes de participar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Modificación de Términos</h2>
            <p>
              ClubSenior se reserva el derecho de modificar estos términos en cualquier momento. 
              Los cambios entrarán en vigencia inmediatamente. Seguir usando el servicio implica aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contacto</h2>
            <p>
              Para preguntas sobre estos Términos de Servicio, contacta a:
              <br />
              <strong>WhatsApp:</strong> <a href="https://wa.me/573002937403" className="text-blue-500 hover:underline">3002937403</a>
              <br />
              <strong>Email:</strong> <a href="mailto:info@clubsenior.com.co" className="text-blue-500 hover:underline">info@clubsenior.com.co</a>
            </p>
          </section>

          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <p className="text-sm text-gray-700">
              <strong>Nota Legal:</strong> Estos Términos de Servicio son un acuerdo vinculante entre tú y ClubSenior. 
              Si tienes dudas legales, te recomendamos consultar con un abogado.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
