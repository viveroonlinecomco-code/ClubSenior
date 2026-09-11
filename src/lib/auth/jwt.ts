import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod-min-32-chars-12345';
const JWT_EXPIRY = '24h';

export interface FacilitadorToken {
  email: string;
  facilitadorId: string;
  role: 'FACILITADOR' | 'DIRECTOR' | 'ADMIN';
  condominioId: string;
  iat: number;
  exp: number;
}

/**
 * Generate JWT token for facilitador
 * Token is cryptographically signed and cannot be forged
 */
export function generateFacilitadorToken(
  email: string,
  facilitadorId: string,
  role: 'FACILITADOR' | 'DIRECTOR' | 'ADMIN',
  condominioId: string
): string {
  return jwt.sign(
    {
      email,
      facilitadorId,
      role,
      condominioId,
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: JWT_EXPIRY,
    }
  );
}

/**
 * Verify JWT token and return decoded payload
 * Returns null if token is invalid, tampered, or expired
 */
export function verifyFacilitadorToken(token: string): FacilitadorToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as FacilitadorToken;
    return decoded;
  } catch (error) {
    // Token invalid, tampered, or expired
    return null;
  }
}

/**
 * Check if token payload is expired
 */
export function isTokenExpired(token: FacilitadorToken): boolean {
  return Date.now() > token.exp * 1000;
}

/**
 * Decode token without verification (use with caution - for debugging only)
 * NEVER trust data from this without verification
 */
export function decodeFacilitadorToken(token: string): FacilitadorToken | null {
  try {
    const decoded = jwt.decode(token) as FacilitadorToken;
    return decoded;
  } catch {
    return null;
  }
}
