// src/lib/api-error.ts
// ============================================================================
// CENTRALIZED ERROR HANDLING
// Usar en todos los endpoints para manejo consistente de errores
// ============================================================================

export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public errorCode?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INVALID_INPUT: 'INVALID_INPUT',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  SIGNING_REQUIRED: 'SIGNING_REQUIRED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
}

// ============================================================================
// MANEJO DE ERRORES
// ============================================================================
export function handleError(error: any, context?: string) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context: context || 'Unknown',
    error: error.message || String(error),
    code: error.code,
    status: error.statusCode,
  }

  console.error(`[API Error - ${context}]`, errorLog)

  // ✅ APIError personalizado
  if (error instanceof APIError) {
    return {
      statusCode: error.statusCode,
      body: {
        success: false,
        error: error.message,
        errorCode: error.errorCode,
        timestamp: new Date().toISOString(),
      },
    }
  }

  // Supabase - Registro no encontrado
  if (error.code === 'PGRST116') {
    return {
      statusCode: 404,
      body: {
        success: false,
        error: 'Resource not found',
        errorCode: ErrorCodes.NOT_FOUND,
        timestamp: new Date().toISOString(),
      },
    }
  }

  // Supabase - Tabla no existe
  if (error.code === '42P01') {
    return {
      statusCode: 500,
      body: {
        success: false,
        error: 'Database table error',
        errorCode: ErrorCodes.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      },
    }
  }

  // Supabase - Columna no existe
  if (error.code === '42703') {
    return {
      statusCode: 500,
      body: {
        success: false,
        error: 'Database column error',
        errorCode: ErrorCodes.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      },
    }
  }

  // Supabase - Constraint violation (FK, unique, etc)
  if (error.code === '23505' || error.code === '23503') {
    return {
      statusCode: 409,
      body: {
        success: false,
        error: 'Data conflict - record already exists or reference invalid',
        errorCode: ErrorCodes.CONFLICT,
        timestamp: new Date().toISOString(),
      },
    }
  }

  // JSON parsing error
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return {
      statusCode: 400,
      body: {
        success: false,
        error: 'Invalid JSON in request body',
        errorCode: ErrorCodes.INVALID_INPUT,
        timestamp: new Date().toISOString(),
      },
    }
  }

  // Default error
  return {
    statusCode: 500,
    body: {
      success: false,
      error: error.message || 'Internal server error',
      errorCode: ErrorCodes.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
  }
}

// ============================================================================
// HELPER: Crear APIError con validación
// ============================================================================
export function createValidationError(field: string): APIError {
  return new APIError(
    `Missing required field: ${field}`,
    400,
    ErrorCodes.INVALID_INPUT
  )
}

export function createAuthError(): APIError {
  return new APIError(
    'User ID required in x-user-id header',
    401,
    ErrorCodes.UNAUTHORIZED
  )
}

export function createSubscriptionError(): APIError {
  return new APIError(
    'No active subscription - upgrade plan to continue',
    403,
    ErrorCodes.SUBSCRIPTION_REQUIRED
  )
}

export function createSigningError(): APIError {
  return new APIError(
    'Both parties must sign contract - awaiting signatures',
    403,
    ErrorCodes.SIGNING_REQUIRED
  )
}
