import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // You can set the frontend port here (or leave it to Vite's default)
    port: 5173, // or any port you prefer for your React app
    proxy: {
      '/api': {
        // Redirect all API calls to your Express backend running on port 3000
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});