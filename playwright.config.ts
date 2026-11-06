import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './e2e', workers: 1, timeout: 30_000, expect: { timeout: 7_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure', serviceWorkers: 'block' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 4174 --strictPort', url: 'http://127.0.0.1:4174', reuseExistingServer: false,
    env: { VITE_SUPABASE_URL: 'https://fixture.supabase.co', VITE_SUPABASE_ANON_KEY: 'fixture-anon-key' } },
  projects: [
    { name: 'desktop', use: { channel: 'chrome', viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium', channel: 'chrome' } },
    { name: 'webkit', use: { ...devices['iPhone 13'], defaultBrowserType: 'webkit' } },
  ],
})
