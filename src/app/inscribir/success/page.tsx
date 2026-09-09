'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  return (
    <div className="max-w-md text-center">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Success icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <span className="text-4xl">✓</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Bienvenido!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Tu inscripción ha sido completada exitosamente
        </p>

        {/* Details */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-700">
            <strong>Referencia de pago:</strong> <br />
            <code className="text-xs bg-white px-2 py-1 rounded mt-1 block font-mono">
              {reference || 'N/A'}
            </code>
          </p>
          <p className="text-sm text-gray-700 mt-4">
            <strong>Próximos pasos:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Recibirás un email de confirmación</li>
              <li>Tu primera sesión es dentro de 3 días</li>
              <li>Te enviaremos la ubicación y hora</li>
            </ul>
          </p>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            📧 Revisa tu email para más información sobre tu primer encuentro.
            Si no ves el mensaje, verifica tu carpeta de spam.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
              Ir a inicio
            </Button>
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            ¿Tienes preguntas? Contáctanos a{' '}
            <a
              href="mailto:info@tardesdecafe.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              info@tardesdecafe.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Suspense fallback={<div>Cargando...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
