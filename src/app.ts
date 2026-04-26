// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors } from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'

import { configurationValidator } from './configuration'
import type { Application } from './declarations'
import { logError } from './hooks/log-error'
import { services } from './services/index'
import { channels } from './channels'
import { middleware } from './middleware'

const app: Application = koa(feathers())

app.configure(configuration(configurationValidator))

app.use(errorHandler()) // https://feathersjs.com/api/koa.html#errorhandler
app.configure(middleware)
app.use(cors())
app.use(parseAuthentication())
app.use(bodyParser())

app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: app.get('origins')
    }
  })
)
app.configure(services)
app.configure(channels)

app.hooks({
  around: {
    all: [logError]
  },
  before: {},
  after: {},
  error: {}
})
app.hooks({
  setup: [],
  teardown: []
})

export { app }
