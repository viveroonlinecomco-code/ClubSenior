'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PrivacidadPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Política de Privacidad</h1>
          <p className="text-gray-600">ClubSenior - Tardes de Café, Mente & Saberes</p>
          <p className="text-gray-500 text-sm mt-2">Última actualización: Septiembre 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introducción</h2>
            <p>
              En ClubSenior, tu privacidad es importante para nosotros. Esta Política de Privacidad explica 
              cómo recopilamos, usamos y protegemos tu información personal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Información que Recopilamos</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">Información de Registro</h3>
                <p className="text-gray-600">
                  Nombre, apellido, email, teléfono, fecha de nacimiento, ciudad y condominio.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Información de Participantes</h3>
                <p className="text-gray-600">
                  Datos de adultos mayores (abuelos): nombre, edad, género y notas adicionales.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Información de Pago</h3>
                <p className="text-gray-600">
                  Transacciones de pago procesadas a través de Wompi. No almacenamos números de tarjeta.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Información de Uso</h3>
                <p className="text-gray-600">
                  Asistencias, reportes semanales y datos de participación en sesiones.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Cómo Usamos Tu Información</h2>
            <p>Usamos tu información para:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Proporcionar y mejorar nuestros servicios</li>
              <li>Procesar pagos y enviar recibos</li>
              <li>Enviar notificaciones sobre sesiones próximas</li>
              <li>Generar reportes de participación y progreso</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Contactarte para soporte o actualizaciones</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Protección de Datos</h2>
            <p>
              ClubSenior utiliza encriptación SSL/TLS para proteger tu información. Tu contraseña y datos de pago 
              se almacenan de forma segura en Supabase, una plataforma confiable de base de datos.
            </p>
            <p className="mt-3">
              <strong>Nota:</strong> Nunca compartimos tu información financiera con terceros. Los pagos se procesan 
              exclusivamente a través de Wompi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Compartir Información</h2>
            <p>
              Tu información se comparte únicamente cuando es necesario:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Con Facilitadores:</strong> Nombre, email y datos de participantes para gestionar sesiones</li>
              <li><strong>Con Wompi:</strong> Email y monto de pago para procesar transacciones</li>
              <li><strong>Con Resend:</strong> Email para enviar notificaciones y reportes</li>
              <li><strong>Con la Familia:</strong> Reportes de participación de abuelos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Tus Derechos</h2>
            <p>
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Acceder a tu información personal</li>
              <li>Solicitar corrección de datos inexactos</li>
              <li>Solicitar eliminación de tu cuenta y datos</li>
              <li>Revocar consentimiento para usar tus datos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
            <p>
              ClubSenior utiliza cookies para mejorar tu experiencia. Las cookies se usan para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Mantener tu sesión activa</li>
              <li>Guardar preferencias (dark mode, idioma)</li>
              <li>Analizar uso del sitio (Google Analytics opcional)</li>
            </ul>
            <p className="mt-3">
              Puedes desactivar cookies en tu navegador, pero algunas características podrían no funcionar correctamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Retención de Datos</h2>
            <p>
              Mantenemos tu información mientras tu cuenta esté activa. Después de cancelación, los datos se retienen 
              por 90 días antes de ser eliminados permanentemente (excepto información de pago que se guarda por 7 años 
              por razones legales).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cambios a Esta Política</h2>
            <p>
              ClubSenior puede actualizar esta Política de Privacidad en cualquier momento. Los cambios serán notificados 
              por email. Continuar usando el servicio implica aceptación de los cambios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contacto</h2>
            <p>
              Si tienes preguntas sobre esta Política de Privacidad:
              <br />
              <strong>WhatsApp:</strong> <a href="https://wa.me/573002937403" className="text-blue-500 hover:underline">3002937403</a>
              <br />
              <strong>Email:</strong> <a href="mailto:info@clubsenior.com.co" className="text-blue-500 hover:underline">info@clubsenior.com.co</a>
            </p>
          </section>

          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <p className="text-sm text-gray-700">
              <strong>Cumplimiento Normativo:</strong> ClubSenior cumple con las leyes colombianas de protección de datos, 
              incluyendo la Ley 1581 de 2012 (Ley de Habeas Data).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
