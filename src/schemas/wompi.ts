/**
 * Wompi Webhook Event Schemas
 * Validación de payloads desde Wompi
 * 
 * Uso:
 * import { WompiEventSchema } from '@/schemas/wompi'
 * const event = WompiEventSchema.parse(JSON.parse(rawBody))
 */

import { z } from 'zod'

export const WompiTransactionDataSchema = z.object({
  id: z.string().min(1, 'Transaction ID required'),
  reference: z.string().uuid('Reference must be valid UUID'),
  amount_in_cents: z.number().int().positive('Amount must be positive'),
  status: z.string(),
  currency: z.string().optional(),
  timestamp: z.string().optional(),
  payment_method: z.object({
    type: z.string().optional(),
  }).optional(),
  customer: z.object({
    email: z.string().email().optional(),
    phone_number: z.string().optional(),
  }).optional(),
})

export const WompiEventSchema = z.object({
  event: z.enum(['transaction.approved', 'transaction.failed', 'transaction.pending'])
    .describe('Tipo de evento de transacción'),
  data: WompiTransactionDataSchema,
  timestamp: z.string().datetime().optional(),
  signature: z.string().optional(),
})

// Type exports for TypeScript
export type WompiEvent = z.infer<typeof WompiEventSchema>
export type WompiTransactionData = z.infer<typeof WompiTransactionDataSchema>

/**
 * Validar evento de Wompi
 * @param payload JSON payload del webhook
 * @returns Evento validado o error de validación
 */
export function validateWompiEvent(payload: unknown) {
  try {
    return WompiEventSchema.parse(payload)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues,
        message: 'Webhook payload validation failed',
      }
    }
    throw error
  }
}
