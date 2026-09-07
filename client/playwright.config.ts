import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  expect: { timeout: 8000 },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  outputDir: 'artifacts/test-results',
  use: { baseURL: 'http://127.0.0.1:5174', channel: 'chrome', viewport: { width: 1440, height: 1100 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: [
    { command: 'npx cross-env PORT=8081 CAREX_DATA_PATH=artifacts/test-carex.json npm run start --prefix ../server', url: 'http://127.0.0.1:8081/api/v1/health', reuseExistingServer: !process.env.CI },
    { command: 'npx cross-env VITE_API_BASE_URL=http://127.0.0.1:8081 npm run dev -- --host 127.0.0.1 --port 5174 --strictPort', url: 'http://127.0.0.1:5174', reuseExistingServer: !process.env.CI },
  ],
})
