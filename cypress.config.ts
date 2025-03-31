import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      // Configurações de eventos do Node
    },
  },
  env: {
    testUser: {
      email: 'test@example.com',
      password: 'Test@123',
    },
  },
}); 