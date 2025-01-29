import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    host:'0.0.0.0',
    proxy: {
        '/api': {
            target:'VITE_API_KEY',
            // target:'http://localhost:3000',
            changeOrigin: true,
          },
      },
      '/socket.io': { // Proxy requests to /socket.io
        // target: 'http://localhost:3000', // Your backend server address
        target: 'VITE_API_KEY', // Your backend server address
        ws: true, // Enable WebSocket proxying
        changeOrigin: true // Important for CORS
      },
  }
})
