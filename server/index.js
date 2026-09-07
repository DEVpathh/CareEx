import { createApp } from './app.js'
import { resolve } from 'node:path'

const port = Number(process.env.PORT || 8080)
createApp({ storagePath: resolve(process.env.CAREX_DATA_PATH || '.data/carex.json') }).listen(port, '127.0.0.1', () => {
  console.log(`CareX API listening on http://localhost:${port}`)
})
