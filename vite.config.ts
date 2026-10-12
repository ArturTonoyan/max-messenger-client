import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'

/**
 * /ga-proxy/{host}/path -> https://{host}/path
 * Нужен и для CORS, и чтобы запросы шли через Vite, а не напрямую из браузера.
 */
function greenApiProxy(): Plugin {
  return {
    name: 'green-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/ga-proxy/')) {
          next()
          return
        }

        try {
          const withoutPrefix = req.url.slice('/ga-proxy/'.length)
          const slash = withoutPrefix.indexOf('/')
          if (slash <= 0) {
            res.statusCode = 400
            res.end('Bad proxy path')
            return
          }

          const host = withoutPrefix.slice(0, slash)
          const pathAndQuery = withoutPrefix.slice(slash)
          if (!/^[a-z0-9.-]+$/i.test(host) || !host.includes('green-api.com')) {
            res.statusCode = 400
            res.end('Host not allowed')
            return
          }

          const target = `https://${host}${pathAndQuery}`
          const chunks: Buffer[] = []
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          }
          const body = chunks.length ? Buffer.concat(chunks) : undefined

          const upstream = await fetch(target, {
            method: req.method,
            headers: {
              Accept: 'application/json',
              ...(body
                ? { 'Content-Type': req.headers['content-type'] || 'application/json' }
                : {}),
            },
            body: body && req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined,
          })

          res.statusCode = upstream.status
          const contentType = upstream.headers.get('content-type')
          if (contentType) res.setHeader('Content-Type', contentType)

          const text = await upstream.text()
          res.end(text)
        } catch (error) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              message:
                error instanceof Error
                  ? `Нет связи с GREEN-API: ${error.message}`
                  : 'Нет связи с GREEN-API',
            }),
          )
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), greenApiProxy()],
  server: {
    port: 5173,
  },
})
