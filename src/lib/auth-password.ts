import crypto from 'crypto'

/**
 * Hash a password using SHA-256 with a salt
 */
export function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || 'fabrica-de-ideas-salt-2024'
  return crypto
    .createHash('sha256')
    .update(salt + password)
    .digest('hex')
}

/**
 * Compare a plain password with a hashed password
 */
export function comparePassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword
}
