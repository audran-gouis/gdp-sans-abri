import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './features',
  
  // Timeout global pour chaque test
  timeout: 60 * 1000,
  
  // Délai d'attente pour les actions
  expect: {
    timeout: 10000
  },
  
  // Nombre de tests en parallèle
  fullyParallel: true,
  
  // Réessayer en cas d'échec
  retries: process.env.CI ? 2 : 1,
  
  // Nombre de workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter pour les résultats
  reporter: [
    ['html', { outputFolder: 'reports/playwright-report' }],
    ['json', { outputFile: 'reports/playwright-report.json' }],
    ['list']
  ],
  
  // Configuration partagée pour tous les tests
  use: {
    // URL de base (non applicable pour une app Electron)
    // baseURL: 'http://localhost:3000',
    
    // Traces en cas d'échec
    trace: 'on-first-retry',
    
    // Screenshots
    screenshot: 'only-on-failure',
    
    // Vidéos
    video: 'retain-on-failure',
    
    // Timeout des actions
    actionTimeout: 15000,
    
    // Navigation timeout
    navigationTimeout: 30000,
  },
  
  // Configuration pour différents navigateurs (pour tests web si nécessaire)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Décommenter pour tester sur d'autres navigateurs
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  
  // Serveur de développement (optionnel, pour tests web)
  // webServer: {
  //   command: 'npm run dev',
  //   port: 3000,
  //   reuseExistingServer: !process.env.CI,
  // },
});


