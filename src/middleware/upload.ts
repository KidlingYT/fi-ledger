import multer from '@koa/multer'
import type { Application } from '../declarations'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
})

export const fileUpload = (app: Application) => {
  app.use(async (ctx, next) => {
    if (ctx.method === 'POST' && ctx.path === '/data' && ctx.is('multipart/*')) {
      await upload.single('file')(ctx as any, async () => {})
      const file = (ctx as any).file as multer.File | undefined
      if (file) {
        const csvString = file.buffer.toString('utf-8')
        ctx.request.body = {
          ...(ctx.request.body as object),
          dataType: 'File',
          data: csvString
        }
      }
    }
    await next()
  })
}
