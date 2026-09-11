import { z } from 'zod';

/**
 * Auth Schemas
 */
export const SendOTPSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email muy largo')
    .transform(e => e.toLowerCase()),
});

export const VerifyOTPSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .transform(e => e.toLowerCase()),
  code: z
    .string()
    .length(6, 'Código debe ser 6 dígitos')
    .regex(/^\d{6}$/, 'Código debe contener solo números'),
});

/**
 * Activity Schemas
 */
export const CreateActivitySchema = z.object({
  nombre: z
    .string()
    .min(3, 'Nombre mínimo 3 caracteres')
    .max(100, 'Nombre máximo 100 caracteres')
    .trim(),
  descripcion: z
    .string()
    .max(500, 'Descripción máximo 500 caracteres')
    .optional(),
  fecha: z
    .string()
    .date('Formato de fecha debe ser YYYY-MM-DD')
    .refine(d => new Date(d) > new Date(), 'Fecha debe ser en el futuro'),
  hora_inicio: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato hora debe ser HH:MM'),
  duracion_minutos: z
    .number()
    .int('Duración debe ser un número entero')
    .min(30, 'Mínimo 30 minutos')
    .max(480, 'Máximo 480 minutos')
    .optional()
    .default(120),
  condominio_id: z
    .string()
    .uuid('ID de condominio debe ser UUID válido'),
  ubicacion: z
    .string()
    .max(200, 'Ubicación muy larga')
    .optional(),
  capacidad_max: z
    .number()
    .int()
    .min(1, 'Capacidad mínima 1')
    .optional(),
});

/**
 * Attendance Schemas
 */
export const RegisterAttendanceSchema = z.object({
  actividad_id: z
    .string()
    .uuid('ID actividad debe ser UUID válido'),
  participante_id: z
    .string()
    .uuid('ID participante debe ser UUID válido'),
  presente: z
    .boolean()
    .describe('Presencia del participante'),
  observaciones: z
    .string()
    .max(500, 'Observaciones máximo 500 caracteres')
    .optional(),
});

/**
 * Participant Schemas
 */
export const CreateParticipantSchema = z.object({
  nombre: z
    .string()
    .min(2, 'Nombre mínimo 2 caracteres')
    .max(100, 'Nombre máximo 100 caracteres')
    .trim(),
  edad: z
    .number()
    .int()
    .min(50, 'Edad mínima 50 años')
    .max(120, 'Edad máxima 120 años'),
  genero: z
    .enum(['masculino', 'femenino', 'otro'])
    .optional(),
  tiene_autonomia_motriz: z
    .boolean()
    .default(true),
  notas: z
    .string()
    .max(500, 'Notas máximo 500 caracteres')
    .optional(),
  condominio_id: z
    .string()
    .uuid('ID de condominio debe ser UUID válido'),
});

/**
 * Report Schemas
 */
export const CreateReportSchema = z.object({
  participante_id: z
    .string()
    .uuid('ID participante debe ser UUID válido'),
  semana_inicio: z
    .string()
    .date('Formato de fecha debe ser YYYY-MM-DD'),
  semana_fin: z
    .string()
    .date('Formato de fecha debe ser YYYY-MM-DD'),
  contenido_sesion: z
    .string()
    .max(1000, 'Contenido máximo 1000 caracteres'),
  comportamiento: z
    .string()
    .max(500, 'Comportamiento máximo 500 caracteres')
    .optional(),
  progreso: z
    .string()
    .max(500, 'Progreso máximo 500 caracteres')
    .optional(),
  recomendaciones: z
    .string()
    .max(500, 'Recomendaciones máximo 500 caracteres')
    .optional(),
  calificacion: z
    .number()
    .int()
    .min(1, 'Calificación mínima 1')
    .max(5, 'Calificación máxima 5')
    .optional(),
});

/**
 * Subscription Schemas
 */
export const CreateSubscriptionSchema = z.object({
  plan_id: z
    .string()
    .uuid('ID de plan debe ser UUID válido'),
  condominio_id: z
    .string()
    .uuid('ID de condominio debe ser UUID válido'),
  cantidad_participantes: z
    .number()
    .int()
    .min(1, 'Mínimo 1 participante')
    .max(100, 'Máximo 100 participantes'),
});

/**
 * Payment Schemas
 */
export const CreatePaymentSchema = z.object({
  suscripcion_id: z
    .string()
    .uuid('ID de suscripción debe ser UUID válido'),
  monto_cop: z
    .number()
    .positive('Monto debe ser positivo'),
  metodo_pago: z
    .enum(['wompi', 'transferencia', 'otro'])
    .default('wompi'),
  referencia_externo: z
    .string()
    .max(100, 'Referencia muy larga')
    .optional(),
});

// Export types
export type SendOTPInput = z.infer<typeof SendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof VerifyOTPSchema>;
export type CreateActivityInput = z.infer<typeof CreateActivitySchema>;
export type RegisterAttendanceInput = z.infer<typeof RegisterAttendanceSchema>;
export type CreateParticipantInput = z.infer<typeof CreateParticipantSchema>;
export type CreateReportInput = z.infer<typeof CreateReportSchema>;
export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
