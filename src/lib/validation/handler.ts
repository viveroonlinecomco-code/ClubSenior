import { NextResponse } from 'next/server';
import { ZodError, ZodSchema, z } from 'zod';

/**
 * Safely parse and validate JSON input with Zod
 * Returns validated data or error response
 */
export async function validateJSON<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; response: Response }> {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten();
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Validación fallida',
            fields: errors.fieldErrors,
            formErrors: errors.formErrors,
          },
          { status: 422 }
        ),
      };
    }

    return {
      success: true,
      data: validation.data,
    };
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        response: NextResponse.json(
          { error: 'JSON inválido' },
          { status: 400 }
        ),
      };
    }

    console.error('Validation error:', error);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Error procesando solicitud' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Create a formatted error response for API
 */
export function errorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, any>
): Response {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Create a success response for API
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): Response {
  return NextResponse.json(data, { status });
}
