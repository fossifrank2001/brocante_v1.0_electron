import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: process.env.NODE_ENV === 'test'
        ? undefined
        : {},
    }),
  ],
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api'],
      },
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'jquery': path.resolve(__dirname, 'node_modules/jquery/dist/jquery.min.js'),
    },
  },
  optimizeDeps: {
    include: ['jquery'],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['ws'],
      output: {
        manualChunks: {
          vendor: ['jquery'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
})
