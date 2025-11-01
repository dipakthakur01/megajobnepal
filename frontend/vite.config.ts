import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
// Warn if dev server port equals proxy target port to avoid loops
const proxyLoopGuard = () => ({
  name: 'proxy-loop-guard',
  configureServer(server) {
    try {
      const devPort = server.config.server.port ?? 3000;
      const proxyConf = server.config.server.proxy?.['/api'] as any;
      const target = typeof proxyConf === 'string' ? proxyConf : proxyConf?.target ?? 'http://127.0.0.1:5000';
      const targetUrl = new URL(target);
      if (Number(targetUrl.port) === Number(devPort)) {
        console.warn(`⚠️ Proxy target port (${targetUrl.port}) equals dev server port (${devPort}). Change Vite port to avoid proxy loops.`);
      }
    } catch {
      // ignore
    }
  }
});

export default defineConfig({
  plugins: [react(), proxyLoopGuard()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
    },
  },
})