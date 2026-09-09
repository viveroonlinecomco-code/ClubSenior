'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  error?: string;
}

export function OnboardingStep2({ onNext, onBack, loading, error }: Step2Props) {
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agreed) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Términos y condiciones
        </h3>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-4 max-h-64 overflow-y-auto">
          <p>
            <strong>1. Aceptación de términos</strong>
            <br />
            Al aceptar estos términos, confirmas que has leído y entendido todas las
            cláusulas de nuestro acuerdo de servicios.
          </p>

          <p>
            <strong>2. Responsabilidades del participante</strong>
            <br />
            El adulto mayor participante se compromete a asistir a las sesiones
            programadas y seguir las normas de convivencia del grupo.
          </p>

          <p>
            <strong>3. Responsabilidades del sponsor</strong>
            <br />
            El familiar pagador se compromete a mantener la suscripción activa y
            válida, y será el responsable de pagar las mensualidades a tiempo.
          </p>

          <p>
            <strong>4. Cancelación</strong>
            <br />
            Puedes cancelar tu suscripción en cualquier momento con notificación
            previa de 7 días.
          </p>

          <p>
            <strong>5. Privacidad</strong>
            <br />
            Tus datos personales serán tratados según nuestra política de privacidad
            y no serán compartidos con terceros sin tu consentimiento.
          </p>

          <p>
            <strong>6. Limitación de responsabilidad</strong>
            <br />
            Aunque nos comprometemos a proporcionar un ambiente seguro, no podemos
            asumir responsabilidad total por accidentes o lesiones no previsibles.
          </p>
        </div>
      </div>

      {/* Checkbox */}
      <label className="flex items-start gap-4 p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-6 h-6 mt-1 border-2 border-gray-300 rounded focus:outline-none cursor-pointer"
          disabled={loading}
        />
        <span className="text-gray-700 text-sm leading-relaxed">
          Acepto los términos y condiciones, y confirmo que he leído la
          información anterior.
        </span>
      </label>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-3"
        >
          Atrás
        </Button>
        <Button
          type="submit"
          disabled={!agreed || loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
        >
          {loading ? 'Procesando...' : 'Continuar'}
        </Button>
      </div>
    </form>
  );
}
