// For more information about this file see https://dove.feathersjs.com/guides/cli/middleware.html
import type { Application } from '../declarations'
import { health } from './health'
import { rateLimit } from './rate-limit'
import { fileUpload } from './upload'

export const middleware = (app: Application) => {
  app.configure(health)
  app.configure(rateLimit)
  app.configure(fileUpload)
}
