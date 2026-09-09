'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { OnboardingStep1Schema, OnboardingStep1Input } from '@/schemas';

interface Step1Props {
  onNext: (data: OnboardingStep1Input) => void;
  loading?: boolean;
  error?: string;
  condominios?: Array<{ id: string; nombre: string }>;
}

export function OnboardingStep1({ onNext, loading, error, condominios = [] }: Step1Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingStep1Input>({
    resolver: zodResolver(OnboardingStep1Schema),
    defaultValues: {
      participante_edad: 65,
      tiene_autonomia_motriz: true,
      participante_genero: 'otro',
      parentesco: 'hijo',
    },
  });

  const onSubmit = (data: OnboardingStep1Input) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section: Sponsor Info */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información del familiar pagador
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo
            </label>
            <input
              {...register('sponsor_full_name')}
              placeholder="Tu nombre"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={loading}
            />
            {errors.sponsor_full_name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.sponsor_full_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              {...register('sponsor_email')}
              type="email"
              placeholder="tu@ejemplo.com"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={loading}
            />
            {errors.sponsor_email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.sponsor_email.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              {...register('sponsor_phone')}
              type="tel"
              placeholder="+57 300 1234567"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={loading}
            />
            {errors.sponsor_phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.sponsor_phone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section: Participante Info */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información del adulto mayor
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              {...register('participante_nombre')}
              placeholder="Nombre"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={loading}
            />
            {errors.participante_nombre && (
              <p className="text-red-500 text-xs mt-1">
                {errors.participante_nombre.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edad
            </label>
            <input
              {...register('participante_edad', { valueAsNumber: true })}
              type="number"
              min="50"
              max="120"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={loading}
            />
            {errors.participante_edad && (
              <p className="text-red-500 text-xs mt-1">
                {errors.participante_edad.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Género
            </label>
            <select
              {...register('participante_genero')}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={loading}
            >
              <option value="otro">Preferiero no indicar</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relación contigo
            </label>
            <select
              {...register('parentesco')}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              disabled={loading}
            >
              <option value="hijo">Hijo/Hija</option>
              <option value="nieto">Nieto/Nieta</option>
              <option value="otro">Otro familiar</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-3">
              <input
                {...register('tiene_autonomia_motriz')}
                type="checkbox"
                className="w-5 h-5 border-2 border-gray-300 rounded focus:outline-none"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">
                Tiene autonomía motriz (puede moverse libremente)
              </span>
            </label>
            {errors.tiene_autonomia_motriz && (
              <p className="text-red-500 text-xs mt-1">
                {errors.tiene_autonomia_motriz.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales
            </label>
            <textarea
              {...register('notas')}
              placeholder="Alergias, preferencias, observaciones..."
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Section: Condominio */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Condominio
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona tu condominio
          </label>
          <select
            {...register('condominio_id')}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            disabled={loading}
          >
            <option value="">-- Elige un condominio --</option>
            {condominios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          {errors.condominio_id && (
            <p className="text-red-500 text-xs mt-1">
              {errors.condominio_id.message}
            </p>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
      >
        {loading ? 'Cargando...' : 'Continuar'}
      </Button>
    </form>
  );
}
