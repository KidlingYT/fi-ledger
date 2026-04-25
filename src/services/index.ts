// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'
import { data } from './data'

export const services = (app: Application) => {
  app.configure(data)
  // All services will be registered here
}
