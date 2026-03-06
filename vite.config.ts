import { resolve } from 'path'
import { createReadStream, existsSync } from 'fs'
import { exec } from 'child_process'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/' : '/',
  plugins: [
    vue(),
    {
      // Serve data/manufacturers/ files in dev mode and reload on changes
      name: 'serve-data',
      configureServer(server) {
        server.middlewares.use('/data', (req, res, next) => {
          const filePath = resolve(__dirname, 'data', req.url!.replace(/^\//, ''))
          if (existsSync(filePath) && filePath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json')
            createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })

        // Watch data directory, run compile, then reload on JSON changes
        const dataDir = resolve(__dirname, 'data')
        let compiling = false
        server.watcher.add(dataDir)
        server.watcher.on('change', (path) => {
          if (path.startsWith(dataDir) && path.endsWith('.json') && !compiling) {
            compiling = true
            console.log('\nData changed, recompiling...')
            exec('npm run compile', { cwd: __dirname }, (err, _stdout, stderr) => {
              compiling = false
              if (err) {
                console.error('Compile failed:', stderr || err.message)
              } else {
                console.log('Compile done, reloading.')
                server.ws.send({ type: 'full-reload' })
              }
            })
          }
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...(mode !== 'production' && { admin: resolve(__dirname, 'admin.html') }),
      },
    },
  },
}))
