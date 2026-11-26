import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// В dev-режиме отдаём /api/analyze тем же кодом, что работает на Vercel.
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [
      react(),
      {
        name: 'dev-api',
        configureServer(server) {
          server.middlewares.use('/api/analyze', (req, res) => {
            let body = ''
            req.on('data', (c) => (body += c))
            req.on('end', async () => {
              try {
                const mod = await server.ssrLoadModule('/api/analyze.js')
                const r = await mod.POST(new Request('http://localhost/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body }))
                res.statusCode = r.status
                res.setHeader('content-type', 'application/json')
                res.end(await r.text())
              } catch (e) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: String(e) }))
              }
            })
          })
        },
      },
    ],
    server: { port: 3000, host: true },
  }
})
