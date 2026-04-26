import { NotAuthenticated } from '@feathersjs/errors'
import jwt from 'jsonwebtoken'
import type { HookContext } from '../declarations'

export async function authenticateSupabase(context: HookContext) {
  const authHeader = context.params.headers?.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new NotAuthenticated('No token provided')
  }

  const secret = process.env.SUPABASE_JWT_SECRET
  if (!secret) throw new Error('SUPABASE_JWT_SECRET is not configured')

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload
    context.params.user = payload
  } catch {
    throw new NotAuthenticated('Invalid or expired token')
  }
}
