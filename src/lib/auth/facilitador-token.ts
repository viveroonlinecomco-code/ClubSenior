/**
 * Utilidades de autenticación para facilitador
 */

export interface FacilitadorToken {
  email: string;
  role: string;
  facilitadorRole: string; // FACILITADOR, DIRECTOR, ADMIN
  condominioId: string;
}

/**
 * Decodificar y validar token de facilitador
 * Token format: base64(email|FACILITADOR|role|condominio_id)
 */
export function decodeFacilitadorToken(token: string): FacilitadorToken | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split('|');

    if (parts.length !== 4) {
      console.error('[TOKEN] Invalid token format');
      return null;
    }

    const [email, userType, role, condominioId] = parts;

    if (userType !== 'FACILITADOR') {
      console.error('[TOKEN] Invalid user type');
      return null;
    }

    if (!['FACILITADOR', 'DIRECTOR', 'ADMIN'].includes(role)) {
      console.error('[TOKEN] Invalid role');
      return null;
    }

    return {
      email,
      role: userType,
      facilitadorRole: role,
      condominioId,
    };
  } catch (error) {
    console.error('[TOKEN] Decode error:', error);
    return null;
  }
}

/**
 * Validar que token pertenece a un condominio específico
 */
export function validateCondominioAccess(
  token: FacilitadorToken,
  requiredCondominioId: string
): boolean {
  if (!token) return false;

  // ADMIN puede acceder a cualquier condominio
  if (token.facilitadorRole === 'ADMIN') {
    return true;
  }

  // Otro facilitador solo a su condominio
  return token.condominioId === requiredCondominioId;
}

/**
 * Validar permiso de acción según rol
 */
export function validateRolePermission(
  token: FacilitadorToken,
  requiredRole: 'FACILITADOR' | 'DIRECTOR' | 'ADMIN'
): boolean {
  if (!token) return false;

  const roleHierarchy: Record<string, number> = {
    'FACILITADOR': 1,
    'DIRECTOR': 2,
    'ADMIN': 3,
  };

  const userLevel = roleHierarchy[token.facilitadorRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Crear payload JWT para token de facilitador
 * (Para integración futura con Supabase JWT)
 */
export function createFacilitadorJWTPayload(token: FacilitadorToken) {
  return {
    aud: 'authenticated',
    sub: token.email,
    email: token.email,
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    app_metadata: {
      provider: 'otp',
      providers: ['otp'],
    },
    user_metadata: {
      role: token.facilitadorRole,
      condominio_id: token.condominioId,
      user_type: 'FACILITADOR',
    },
    iss: 'https://supabase.io',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  };
}
