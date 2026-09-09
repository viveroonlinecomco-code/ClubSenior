import { z } from 'zod';

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const SignInSchema = z.object({
  email: z.string().email('Email inválido'),
  redirectUrl: z.string().url().optional(),
});

export type SignInInput = z.infer<typeof SignInSchema>;

export const VerifyOTPSchema = z.object({
  email: z.string().email('Email inválido'),
  token: z.string().min(6, 'OTP debe tener 6 caracteres').max(6),
});

export type VerifyOTPInput = z.infer<typeof VerifyOTPSchema>;

// ============================================================================
// ONBOARDING STEP 1: DATA
// ============================================================================

export const OnboardingStep1Schema = z.object({
  condominio_id: z.string().uuid('ID de condominio inválido'),
  // Sponsor (quien paga)
  sponsor_email: z.string().email('Email del sponsor inválido'),
  sponsor_full_name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  sponsor_phone: z.string().regex(/^\+?[0-9]{10,}/, 'Teléfono inválido'),
  // Participante (adulto mayor)
  participante_nombre: z.string().min(2, 'Nombre del participante inválido'),
  participante_edad: z.number().int().min(50).max(120),
  participante_genero: z.enum(['masculino', 'femenino', 'otro']).optional(),
  tiene_autonomia_motriz: z.boolean({ message: 'Autonomía motriz es requerida' }),
  notas: z.string().optional(),
  // Relationship
  parentesco: z.enum(['hijo', 'hija', 'nieto', 'nieta', 'otro']),
});

export type OnboardingStep1Input = z.infer<typeof OnboardingStep1Schema>;

// ============================================================================
// ONBOARDING STEP 2: LEGAL ACCEPTANCE
// ============================================================================

export const OnboardingStep2Schema = z.object({
  suscripcion_id: z.string().uuid('ID de suscripción inválido'),
  contrato_ids: z.array(z.string().uuid()),
  aceptado: z
    .boolean()
    .refine((val) => val === true, 'Debe aceptar los términos y condiciones'),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
});

export type OnboardingStep2Input = z.infer<typeof OnboardingStep2Schema>;

// ============================================================================
// ONBOARDING STEP 3: PAYMENT
// ============================================================================

export const OnboardingStep3Schema = z.object({
  suscripcion_id: z.string().uuid('ID de suscripción inválido'),
  plan_id: z.string().uuid('Plan inválido'),
  monto_cop: z.number().int().min(100, 'Monto mínimo es 100 COP'),
  // Wompi metadata
  wompi_reference: z.string().optional(),
});

export type OnboardingStep3Input = z.infer<typeof OnboardingStep3Schema>;

// ============================================================================
// WOMPI WEBHOOK
// ============================================================================

export const WompiWebhookSchema = z.object({
  id: z.string().uuid('Event ID inválido'),
  event: z.enum(['PAYMENT.APPROVED', 'PAYMENT.FAILED', 'PAYMENT.REFUNDED']),
  timestamp: z.string().datetime(),
  data: z.object({
    id: z.string(),
    created_at: z.string().datetime(),
    finalized_at: z.string().datetime().nullable(),
    amount_in_cents: z.number().int().positive(),
    reference: z.string(), // FK pago.referencia_wompi
    currency: z.string().length(3),
    payment_method: z.object({
      type: z.string(),
    }),
    status: z.enum(['APPROVED', 'PENDING', 'FAILED']),
    status_message: z.string(),
    merchant: z.object({
      id: z.string(),
    }),
  }),
});

export type WompiWebhookInput = z.infer<typeof WompiWebhookSchema>;

// ============================================================================
// PAYMENT
// ============================================================================

export const CreatePaymentSchema = z.object({
  suscripcion_id: z.string().uuid('ID de suscripción inválido'),
  monto_cop: z
    .number()
    .int()
    .min(160000, 'Monto mínimo es $160.000 COP'),
  currency: z.string().length(3).default('COP'),
  description: z.string().optional(),
  // Wompi specific
  customer_email: z.string().email(),
  customer_phone: z.string().regex(/^\+?[0-9]{10,}/),
  redirect_url: z.string().url('URL de redirección inválida'),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;

// ============================================================================
// SUSCRIPCIÓN
// ============================================================================

export const CreateSubscriptionSchema = z.object({
  participante_id: z.string().uuid('ID de participante inválido'),
  plan_id: z.string().uuid('Plan inválido'),
  sponsor_id: z.string().uuid('ID de sponsor inválido'),
});

export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;

export const UpdateSubscriptionStateSchema = z.object({
  suscripcion_id: z.string().uuid('ID de suscripción inválido'),
  nuevo_estado: z.enum([
    'STARTED',
    'DATA_COMPLETED',
    'LEGAL_ACCEPTED',
    'PAYMENT_PENDING',
    'PAYMENT_APPROVED',
    'ACTIVE',
    'PAYMENT_FAILED',
    'CANCELLED',
  ]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateSubscriptionStateInput = z.infer<
  typeof UpdateSubscriptionStateSchema
>;

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

export const CreateCondominioSchema = z.object({
  nombre: z.string().min(3, 'Nombre del condominio muy corto'),
  ubicacion: z.string().min(5, 'Ubicación inválida'),
  ciudad: z.string().min(3, 'Ciudad inválida'),
  contacto_admin_nombre: z.string().min(2),
  contacto_admin_email: z.string().email(),
  contacto_admin_phone: z.string().regex(/^\+?[0-9]{10,}/),
});

export type CreateCondominioInput = z.infer<typeof CreateCondominioSchema>;

export const CreatePlanSchema = z.object({
  nombre: z.string().min(3),
  descripcion: z.string().min(10),
  precio_cop: z.number().int().positive(),
  frecuencia: z.enum(['mensual', 'trimestral', 'anual']),
  duracion_dias: z.number().int().positive(),
});

export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export const BulkCreateParticipantesSchema = z.object({
  condominio_id: z.string().uuid(),
  participantes: z.array(
    z.object({
      nombre: z.string().min(2),
      edad: z.number().int().min(50).max(120),
      genero: z.enum(['masculino', 'femenino', 'otro']).optional(),
      tiene_autonomia_motriz: z.boolean(),
      notas: z.string().optional(),
    })
  ),
});

export type BulkCreateParticipantesInput = z.infer<
  typeof BulkCreateParticipantesSchema
>;

// ============================================================================
// QUERY HELPERS
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

export const DateRangeSchema = z.object({
  fecha_inicio: z.string().datetime().optional(),
  fecha_fin: z.string().datetime().optional(),
});

export type DateRangeInput = z.infer<typeof DateRangeSchema>;
