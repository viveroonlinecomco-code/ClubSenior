export const dynamic = 'force-dynamic';

import { SignInForm } from '@/components/auth/signin-form';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ingresa aquí
            </h1>
            <p className="text-gray-600">
              Accede a tu cuenta con email
            </p>
          </div>

          {/* Form */}
          <SignInForm />

          {/* Links */}
          <div className="mt-8 space-y-3 text-center text-sm">
            <Link
              href="/"
              className="block text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Volver a inicio
            </Link>
          </div>
        </div>

        {/* Bottom info */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Tardes de Café, Mente & Saberes
          </p>
        </div>
      </div>
    </div>
  );
}
