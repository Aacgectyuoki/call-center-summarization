import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   esbuild: {
//     loader: "jsx",
//     include: /src\/.*\.js$/, // Apply JSX parsing to .js files in src/
//  },
// })
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Change this to match your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});