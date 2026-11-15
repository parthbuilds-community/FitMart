import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  resolve: {
    alias: {
      // Shared domain types and Zod schemas, used once the client is ported
      // to TypeScript in a later phase.
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
})
