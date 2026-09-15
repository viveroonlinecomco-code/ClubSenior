'use client';

import { useState, useRef } from 'react';
import { z } from 'zod';

const ContratosSchema = z.object({
  sponsorContractAceptado: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar el Contrato de Sponsor',
  }),
  participantContractAceptado: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar el Contrato de Participante',
  }),
  sponsorFirma: z.string().refine(val => val.length > 0, {
    message: 'Debes dibujar tu firma en el contrato de Sponsor',
  }),
  participantFirma: z.string().refine(val => val.length > 0, {
    message: 'Debes dibujar la firma del participante',
  }),
});

interface Step2BContratosProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function Step2BContratosForm({ onSubmit, initialData }: Step2BContratosProps) {
  const [formData, setFormData] = useState({
    sponsorContractAceptado: initialData?.sponsorContractAceptado || false,
    participantContractAceptado: initialData?.participantContractAceptado || false,
    sponsorFirma: initialData?.sponsorFirma || '',
    participantFirma: initialData?.participantFirma || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'sponsor' | 'participant' | null>(null);
  const sponsorCanvasRef = useRef<HTMLCanvasElement>(null);
  const participantCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<'sponsor' | 'participant' | null>(null);

  // ============ CANVAS DRAWING LOGIC ============
  // Helper para obtener coordenadas de mouse o touch
  const getCoordinates = (canvas: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    const isTouch = 'touches' in e;
    const x = isTouch ? (e as React.TouchEvent).touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = isTouch ? (e as React.TouchEvent).touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    return { x, y };
  };

  const startDrawing = (type: 'sponsor' | 'participant', e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(type);
    const canvas = type === 'sponsor' ? sponsorCanvasRef.current : participantCanvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(canvas, e as any);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (type: 'sponsor' | 'participant', e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isDrawing !== type) return;

    const canvas = type === 'sponsor' ? sponsorCanvasRef.current : participantCanvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(canvas, e as any);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000';
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (type: 'sponsor' | 'participant') => {
    if (isDrawing !== type) return;

    const canvas = type === 'sponsor' ? sponsorCanvasRef.current : participantCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.closePath();

    const imageData = canvas.toDataURL('image/png');
    setFormData(prev => ({
      ...prev,
      [type === 'sponsor' ? 'sponsorFirma' : 'participantFirma']: imageData,
    }));

    setIsDrawing(null);
  };

  const clearCanvas = (type: 'sponsor' | 'participant') => {
    const canvas = type === 'sponsor' ? sponsorCanvasRef.current : participantCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    setFormData(prev => ({
      ...prev,
      [type === 'sponsor' ? 'sponsorFirma' : 'participantFirma']: '',
    }));
  };

  // ============ FORM LOGIC ============
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validated = ContratosSchema.parse(formData);
      onSubmit(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err: any) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Contratos Legales</h2>
      <p className="text-gray-600 text-sm">
        Por favor, lee y acepta ambos contratos. Necesitarás dibujar tu firma en cada uno.
      </p>

      {/* ========== SPONSOR CONTRACT ========== */}
      <div className="space-y-4 border-l-4 border-blue-500 pl-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'sponsor' ? null : 'sponsor')}
            className="w-full bg-gray-50 hover:bg-gray-100 px-6 py-4 flex justify-between items-center font-semibold text-gray-900"
          >
            <span>📋 Contrato de Sponsor (ClubSenior)</span>
            <span className={`transform transition ${expandedSection === 'sponsor' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {expandedSection === 'sponsor' && (
            <div className="bg-white px-6 py-4 border-t border-gray-300 max-h-96 overflow-y-auto text-gray-600 text-sm space-y-3">
              <p><strong>CONTRATO DE SPONSOR - CLUBSENIOR</strong></p>
              
              <p><strong>1. OBJETO DEL CONTRATO</strong><br />
                ClubSenior ofrece servicios de actividades recreativas, educativas, sociales y de bienestar para adultos mayores, incluyendo sesiones semanales facilitadas por profesionales capacitados, acceso a plataforma digital y reportes de progreso.
              </p>

              <p><strong>2. RESPONSABILIDADES DE CLUBSENIOR</strong><br />
                • Facilitar actividades de calidad con profesionales entrenados<br />
                • Mantener estándares de seguridad con protocolos de emergencia<br />
                • Proteger información personal según política de privacidad<br />
                • Responder consultas dentro de 5 días hábiles<br />
                • Facilitar cambios de plan o cancelación<br />
                • Mantener disponibilidad plataforma 24/7 (95% uptime garantizado)
              </p>

              <p><strong>3. LIMITACIÓN DE RESPONSABILIDAD</strong><br />
                ClubSenior NO es responsable por lesiones durante actividades (excepto negligencia directa), daños por inasistencia, circunstancias de fuerza mayor, o pérdida de datos por seguridad débil de contraseña. ClubSenior es recreativo, NO proporciona servicios médicos.
              </p>

              <p><strong>4. PRIVACIDAD Y DATOS</strong><br />
                Los datos personales se almacenan en servidores seguros, se usan solo para gestión de suscripción y comunicación, NO se comparten con terceros sin consentimiento, y cumplen GDPR y normativa colombiana.
              </p>

              <p><strong>5. TÉRMINOS DE SUSCRIPCIÓN Y CANCELACIÓN</strong><br />
                • Planes: Mensual (4 sesiones, $150,000, 6 semanas) o Por Sesión ($40,000)<br />
                • Cancelación en cualquier momento con aviso de 7 días recomendado<br />
                • Reembolso 100% si se cancela dentro de 7 días; después: prorrateado<br />
                • Suspensión automática por no pago después de 30 días
              </p>

              <p><strong>6. RESOLUCIÓN DE CONFLICTOS</strong><br />
                Contactar promesaobca@gmail.com. ClubSenior ofrecerá solución en 10 días hábiles. Si no se resuelve, se somete a jurisdicción de juzgados de Bogotá, Colombia.
              </p>

              <p><strong>7. ACEPTACIÓN</strong><br />
                Al firmar confirma que ha leído, entiende y acepta todos los términos. Esta firma digital tiene validez legal como consentimiento informado.
              </p>
            </div>
          )}
        </div>

        {/* Checkbox */}
        <div className={`flex items-start gap-3 p-4 rounded-lg ${errors.sponsorContractAceptado ? 'bg-red-50 border border-red-200' : 'bg-blue-50'}`}>
          <input
            type="checkbox"
            name="sponsorContractAceptado"
            checked={formData.sponsorContractAceptado}
            onChange={handleChange}
            className="w-5 h-5 mt-1 cursor-pointer"
          />
          <label className="text-gray-700 cursor-pointer">
            Acepto el Contrato de Sponsor de ClubSenior
          </label>
        </div>
        {errors.sponsorContractAceptado && (
          <p className="text-red-500 text-sm">{errors.sponsorContractAceptado}</p>
        )}

        {/* Firma Canvas */}
        {formData.sponsorContractAceptado && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Dibuja tu firma:</p>
            <canvas
              ref={sponsorCanvasRef}
              width={400}
              height={150}
              onMouseDown={(e) => startDrawing('sponsor', e)}
              onMouseMove={(e) => draw('sponsor', e)}
              onMouseUp={() => stopDrawing('sponsor')}
              onMouseLeave={() => stopDrawing('sponsor')}
              onTouchStart={(e) => startDrawing('sponsor', e as any)}
              onTouchMove={(e) => draw('sponsor', e as any)}
              onTouchEnd={() => stopDrawing('sponsor')}
              className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-white w-full touch-none"
            />
            {errors.sponsorFirma && (
              <p className="text-red-500 text-sm">{errors.sponsorFirma}</p>
            )}
            <button
              type="button"
              onClick={() => clearCanvas('sponsor')}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              ✏️ Limpiar firma
            </button>
          </div>
        )}
      </div>

      {/* ========== PARTICIPANT CONTRACT ========== */}
      <div className="space-y-4 border-l-4 border-green-500 pl-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'participant' ? null : 'participant')}
            className="w-full bg-gray-50 hover:bg-gray-100 px-6 py-4 flex justify-between items-center font-semibold text-gray-900"
          >
            <span>📋 Contrato de Participante (Familia)</span>
            <span className={`transform transition ${expandedSection === 'participant' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {expandedSection === 'participant' && (
            <div className="bg-white px-6 py-4 border-t border-gray-300 max-h-96 overflow-y-auto text-gray-600 text-sm space-y-3">
              <p><strong>CONTRATO DE PARTICIPANTE - CLUBSENIOR</strong></p>

              <p><strong>1. PARTES</strong><br />
                Familia/Responsable del adulto mayor (participante) en actividades semanales de ClubSenior, plataforma recreativa y educativa.
              </p>

              <p><strong>2. RESPONSABILIDADES DE LA FAMILIA</strong><br />
                • Proporcionar información personal, médica y de emergencia verídica y completa<br />
                • Mantener información actualizada (cambios de salud, contactos)<br />
                • Asegurar que participante está en condiciones adecuadas para participar<br />
                • Transportar participante a actividades<br />
                • Realizar pagos a tiempo según plan<br />
                • Aceptar políticas de comportamiento y respeto
              </p>

              <p><strong>3. AUTORIZACIÓN MÉDICA</strong><br />
                La familia autoriza la participación sabiendo que participante está en condiciones de salud adecuadas. ClubSenior NO proporciona servicios médicos, solo recreativos. Se autoriza contacto a médico en emergencias.
              </p>

              <p><strong>4. PROTECCIÓN DE DATOS</strong><br />
                ClubSenior almacena datos personales, médicos y de participación en servidores seguros. Datos se usan para gestión, comunicación y emergencias. NO se comparten sin consentimiento. Familia puede solicitar acceso, corrección o eliminación en cualquier momento.
              </p>

              <p><strong>5. COMUNICACIÓN Y REPORTES</strong><br />
                ClubSenior envía confirmación de pago inmediatamente, reportes semanales cada viernes con asistencia y recomendaciones, y comunicaciones urgentes si algo significativo ocurre.
              </p>

              <p><strong>6. CANCELACIÓN Y REEMBOLSOS</strong><br />
                • Cancelación en cualquier momento desde plataforma o email<br />
                • Dentro de 7 días: reembolso 100%<br />
                • Después: reembolso prorrateado solo sesiones no realizadas<br />
                • Procesado en máximo 10 días hábiles
              </p>

              <p><strong>7. LIMITACIÓN DE RESPONSABILIDAD</strong><br />
                ClubSenior NO es responsable por lesiones (salvo negligencia grave), inasistencia, daños por conducta inapropiada (familia responsable), o fuerza mayor.
              </p>

              <p><strong>8. CONSENTIMIENTO</strong><br />
                Al firmar confirma que actúa en representación del participante, ha leído todos los términos, autoriza participación, proporciona información verídica, y entiende limitaciones de responsabilidad. Esta firma digital tiene validez legal.
              </p>
            </div>
          )}
        </div>

        {/* Checkbox */}
        <div className={`flex items-start gap-3 p-4 rounded-lg ${errors.participantContractAceptado ? 'bg-red-50 border border-red-200' : 'bg-green-50'}`}>
          <input
            type="checkbox"
            name="participantContractAceptado"
            checked={formData.participantContractAceptado}
            onChange={handleChange}
            className="w-5 h-5 mt-1 cursor-pointer"
          />
          <label className="text-gray-700 cursor-pointer">
            Acepto el Contrato de Participante de ClubSenior
          </label>
        </div>
        {errors.participantContractAceptado && (
          <p className="text-red-500 text-sm">{errors.participantContractAceptado}</p>
        )}

        {/* Firma Canvas */}
        {formData.participantContractAceptado && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Firma del participante (o responsable):</p>
            <canvas
              ref={participantCanvasRef}
              width={400}
              height={150}
              onMouseDown={(e) => startDrawing('participant', e)}
              onMouseMove={(e) => draw('participant', e)}
              onMouseUp={() => stopDrawing('participant')}
              onMouseLeave={() => stopDrawing('participant')}
              onTouchStart={(e) => startDrawing('participant', e as any)}
              onTouchMove={(e) => draw('participant', e as any)}
              onTouchEnd={() => stopDrawing('participant')}
              className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-white w-full touch-none"
            />
            {errors.participantFirma && (
              <p className="text-red-500 text-sm">{errors.participantFirma}</p>
            )}
            <button
              type="button"
              onClick={() => clearCanvas('participant')}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              ✏️ Limpiar firma
            </button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={
          loading ||
          !formData.sponsorContractAceptado ||
          !formData.participantContractAceptado ||
          !formData.sponsorFirma ||
          !formData.participantFirma
        }
        className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 mt-8"
      >
        {loading ? 'Procesando Contratos...' : '✅ Continuar al Paso 4'}
      </button>
    </form>
  );
}
