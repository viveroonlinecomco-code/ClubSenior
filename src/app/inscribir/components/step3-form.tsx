'use client';

import { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';

const Step3Schema = z.object({
  planSeleccionado: z.enum(['individual', 'condominio'], {
    errorMap: () => ({ message: 'Debes seleccionar un plan' }),
  }),
  terminosAceptado: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos',
  }),
  contratoAceptado: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar el contrato de suscripción',
  }),
  politicaPrivacidadAceptado: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar la política de privacidad',
  }),
  firma: z.string().refine(val => val.length > 100, {
    message: 'Debes firmar en el canvas',
  }),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  passwordConfirm: z.string(),
}).refine(data => data.password === data.passwordConfirm, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirm'],
});

interface Step3FormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function Step3Form({ onSubmit, initialData }: Step3FormProps) {
  const [formData, setFormData] = useState({
    planSeleccionado: initialData?.planSeleccionado || 'individual',
    terminosAceptado: false,
    contratoAceptado: false,
    politicaPrivacidadAceptado: false,
    firma: '',
    password: '',
    passwordConfirm: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [firmaGuardada, setFirmaGuardada] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Canvas - Dibujo
  const handleCanvasMouseDown = () => {
    setIsDrawing(true);
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1f2937';

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 1, y + 1);
    ctx.stroke();
  };

  const guardarFirma = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    setFormData(prev => ({ ...prev, firma: dataUrl }));
    setFirmaGuardada(true);
  };

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    setFormData(prev => ({ ...prev, firma: '' }));
    setFirmaGuardada(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const puedeCrearCuenta =
    formData.planSeleccionado &&
    formData.terminosAceptado &&
    formData.contratoAceptado &&
    formData.politicaPrivacidadAceptado &&
    firmaGuardada &&
    formData.password &&
    formData.passwordConfirm &&
    formData.password === formData.passwordConfirm &&
    formData.password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validated = Step3Schema.parse(formData);
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

  const planes = [
    {
      id: 'individual',
      nombre: 'Plan Mensual',
      precio: '$150.000',
      periodo: '/mes',
      popular: true,
      beneficios: [
        '4 sesiones de 2 horas',
        'Válido por 6 semanas',
        'Sin penalizaciones por faltas',
        'Café + Snacks incluidos',
      ],
    },
    {
      id: 'condominio',
      nombre: 'Pago por Sesión',
      precio: '$40.000',
      periodo: '/sesión',
      popular: false,
      beneficios: [
        'Sin compromiso mensuales',
        'Total flexibilidad',
        'Cancela sin penalizaciones',
        'Café + Snacks incluidos',
      ],
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan, Contrato y Firma Digital</h2>

      {/* SECCIÓN 1: SELECCIONAR PLAN */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Elige Tu Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planes.map((plan) => (
            <label
              key={plan.id}
              className={`relative flex cursor-pointer rounded-lg border-2 p-6 transition-all ${
                formData.planSeleccionado === plan.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="planSeleccionado"
                value={plan.id}
                checked={formData.planSeleccionado === plan.id}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 cursor-pointer mt-1"
              />

              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900">{plan.nombre}</p>
                  {plan.popular && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                      ⭐ POPULAR
                    </span>
                  )}
                </div>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {plan.precio}
                  <span className="text-lg text-gray-600">{plan.periodo}</span>
                </p>

                <ul className="mt-3 space-y-1">
                  {plan.beneficios.map((beneficio, idx) => (
                    <li key={idx} className="text-sm text-gray-600">
                      • {beneficio}
                    </li>
                  ))}
                </ul>
              </div>
            </label>
          ))}
        </div>
        {errors.planSeleccionado && (
          <p className="text-red-500 text-sm mt-2">{errors.planSeleccionado}</p>
        )}
      </div>

      <hr className="my-6" />

      {/* SECCIÓN 2: TÉRMINOS Y CONTRATO */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Términos, Contrato y Privacidad</h3>

        <div className="space-y-3">
          <div className={`flex items-start gap-3 p-4 rounded-lg ${errors.terminosAceptado ? 'bg-red-50 border border-red-200' : 'bg-blue-50'}`}>
            <input
              type="checkbox"
              name="terminosAceptado"
              checked={formData.terminosAceptado}
              onChange={handleChange}
              className="w-5 h-5 mt-1 cursor-pointer"
            />
            <label className="text-gray-700 cursor-pointer">
              He leído y <span className="font-semibold">ACEPTO los TÉRMINOS DE SERVICIO</span>
            </label>
          </div>
          {errors.terminosAceptado && (
            <p className="text-red-500 text-sm">{errors.terminosAceptado}</p>
          )}

          <div className={`flex items-start gap-3 p-4 rounded-lg ${errors.contratoAceptado ? 'bg-red-50 border border-red-200' : 'bg-green-50'}`}>
            <input
              type="checkbox"
              name="contratoAceptado"
              checked={formData.contratoAceptado}
              onChange={handleChange}
              className="w-5 h-5 mt-1 cursor-pointer"
            />
            <label className="text-gray-700 cursor-pointer">
              He leído y <span className="font-semibold">ACEPTO el CONTRATO DE SUSCRIPCIÓN</span>
            </label>
          </div>
          {errors.contratoAceptado && (
            <p className="text-red-500 text-sm">{errors.contratoAceptado}</p>
          )}

          <div className={`flex items-start gap-3 p-4 rounded-lg ${errors.politicaPrivacidadAceptado ? 'bg-red-50 border border-red-200' : 'bg-purple-50'}`}>
            <input
              type="checkbox"
              name="politicaPrivacidadAceptado"
              checked={formData.politicaPrivacidadAceptado}
              onChange={handleChange}
              className="w-5 h-5 mt-1 cursor-pointer"
            />
            <label className="text-gray-700 cursor-pointer">
              <span className="font-semibold">Autorizo el TRATAMIENTO DE MIS DATOS PERSONALES</span>
            </label>
          </div>
          {errors.politicaPrivacidadAceptado && (
            <p className="text-red-500 text-sm">{errors.politicaPrivacidadAceptado}</p>
          )}
        </div>
      </div>

      <hr className="my-6" />

      {/* SECCIÓN 3: FIRMA DIGITAL */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Tu Firma Digital</h3>
        <p className="text-sm text-gray-600 mb-4">
          Dibuja tu firma en el cuadro (obligatorio)
        </p>

        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseUp}
            className="w-full bg-white cursor-crosshair"
            style={{ display: 'block' }}
          />
        </div>

        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={limpiarFirma}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={guardarFirma}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Guardar firma
          </button>
        </div>

        {firmaGuardada && (
          <div className="mt-3 flex items-center text-green-600 text-sm">
            <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center mr-2">
              ✓
            </div>
            Firma guardada correctamente
          </div>
        )}

        {errors.firma && (
          <p className="text-red-500 text-sm mt-2">{errors.firma}</p>
        )}
      </div>

      <hr className="my-6" />

      {/* SECCIÓN 4: CONTRASEÑA */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Crea tu Contraseña</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            <p className="text-xs text-gray-600 mt-1">Mínimo 8 caracteres. Usa mayúsculas, minúsculas y números</p>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Confirmar Contraseña <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.passwordConfirm && (
              <p className="text-red-500 text-sm mt-1">{errors.passwordConfirm}</p>
            )}
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          disabled={loading}
          className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          ← Atrás
        </button>
        <button
          type="submit"
          disabled={!puedeCrearCuenta || loading}
          className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creando cuenta...
            </>
          ) : (
            '✓ Crear Cuenta'
          )}
        </button>
      </div>
    </form>
  );
}
