import assert from 'assert'
import { app } from '../src/app'

const port = app.get('port')
const appUrl = `http://${app.get('host')}:${port}`

describe('Feathers application tests', () => {
  before(async () => {
    await app.listen(port)
  })

  after(async () => {
    await app.teardown()
  })

  it('returns 200 ok from health check', async () => {
    const res = await fetch(`${appUrl}/health`)
    assert.strictEqual(res.status, 200)
    const body = await res.json() as { status: string }
    assert.strictEqual(body.status, 'ok')
  })

  it('shows a 404 JSON error', async () => {
    const res = await fetch(`${appUrl}/path/to/nowhere`)
    assert.strictEqual(res.status, 404)
    const body = await res.json() as { code: number; name: string }
    assert.strictEqual(body.code, 404)
    assert.strictEqual(body.name, 'NotFound')
  })
})
