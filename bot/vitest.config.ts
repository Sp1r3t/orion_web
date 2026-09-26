import { defineConfig } from 'vitest/config'

// Свой конфиг, чтобы Vitest не подхватывал настройки сайта из корня репозитория.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
