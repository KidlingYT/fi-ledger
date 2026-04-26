import { RateLimiterMemory } from 'rate-limiter-flexible'
import type { Application } from '../declarations'

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60
})

export const rateLimit = (app: Application) => {
  app.use(async (ctx, next) => {
    try {
      await rateLimiter.consume(ctx.ip ?? 'unknown')
    } catch {
      ctx.status = 429
      ctx.body = { message: 'Too many requests' }
      return
    }
    await next()
  })
}
