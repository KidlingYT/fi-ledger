// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors } from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'

import { configurationValidator } from './configuration'
import type { Application } from './declarations'
import { logError } from './hooks/log-error'
import { mongodb } from './mongodb'
import { services } from './services/index'
import { channels } from './channels'
import multer from '@koa/multer'

const upload = multer({ storage: multer.memoryStorage() })

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))

// Set up Koa middleware
app.use(cors())
app.use(errorHandler())
app.use(parseAuthentication())
// Middleware: intercept multipart uploads on POST /data
// Extracts the CSV file content and merges it into the request body
app.use(async (ctx, next) => {
  if (ctx.method === 'POST' && ctx.path === '/data' && ctx.is('multipart/*')) {
    await upload.single('file')(ctx as any, async () => {})
    const file = (ctx as any).file as multer.File | undefined
    if (file) {
      const csvString = file.buffer.toString('utf-8')
      // Merge file fields with any other form fields
      ctx.request.body = {
        ...(ctx.request.body as object),
        dataType: 'File',
        data: csvString
      }
    }
  }
  await next()
})
app.use(bodyParser())

// Configure services and transports
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: app.get('origins')
    }
  })
)
app.configure(mongodb)
app.configure(services)
app.configure(channels)

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError]
  },
  before: {},
  after: {},
  error: {}
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: []
})

export { app }
