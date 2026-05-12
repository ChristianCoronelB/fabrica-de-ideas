import { NextRequest } from 'next/server'

export interface AuthContext {
  userId: string
  userEmail: string
  userRole: string
}

/**
 * Extract auth context from request headers (set by middleware)
 */
export function getAuthContext(request: NextRequest): AuthContext | null {
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')
  const userRole = request.headers.get('x-user-role')

  if (!userId || !userEmail || !userRole) {
    return null
  }

  return { userId, userEmail, userRole }
}

/**
 * Require auth context, returns context or null (caller should return 401)
 */
export function requireAuth(request: NextRequest): AuthContext | null {
  return getAuthContext(request)
}

/**
 * Check if user has admin role
 */
export function isAdmin(auth: AuthContext): boolean {
  return auth.userRole === 'ADMIN'
}

/**
 * Check if user has evaluator role
 */
export function isEvaluator(auth: AuthContext): boolean {
  return auth.userRole === 'EVALUATOR'
}

/**
 * Check if user has participant role
 */
export function isParticipant(auth: AuthContext): boolean {
  return auth.userRole === 'PARTICIPANT'
}
