import type { Application } from '../declarations'

export const health = (app: Application) => {
  app.use(async (ctx, next) => {
    if (ctx.path === '/health') {
      ctx.status = 200
      ctx.body = { status: 'ok' }
      return
    }
    await next()
  })
}
