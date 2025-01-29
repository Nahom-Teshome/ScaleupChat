// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import dotenv from 'dotenv'
// // https://vite.dev/config/
// dotenv.config()
// export default defineConfig({
//   plugins: [react()],
//   server:{
//     host:'0.0.0.0',
//     proxy: {
//         '/api': {
//             target:process.env.VITE_API_URL,
//             // target:'http://localhost:3000',
//             changeOrigin: true,
//           },
//       },
//       '/socket.io': { // Proxy requests to /socket.io
//         // target: 'http://localhost:3000', // Your backend server address
//         target:process.env.VITE_API_URL, // Your backend server address
//         ws: true, // Enable WebSocket proxying
//         changeOrigin: true // Important for CORS
//       },
//   }
// })
