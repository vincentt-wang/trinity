import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base must match the GitHub Pages repo path (repo: trinity)
export default defineConfig({
  base: '/trinity/',
  plugins: [react(), tailwindcss()],
})
