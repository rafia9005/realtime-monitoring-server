import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { openAPIRouteHandler } from 'hono-openapi'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})


app.get(
  '/openapi',
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: 'Hono API',
        version: '1.0.0',
        description: 'Greeting API',
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Local Server' },
      ],
    },
  })
)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
