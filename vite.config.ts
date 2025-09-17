import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 3000,
    hmr: {
      host: "localhost",
      port: 3000
    },
    force: true,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  plugins: [
    react(),
    mode === 'production' && sentryVitePlugin({
      org: process.env.VITE_SENTRY_ORG,
      project: process.env.VITE_SENTRY_PROJECT,
      authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**',
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      '@radix-ui/react-tooltip': path.resolve(__dirname, './src/lib/empty-module.js'),
      'react-helmet-async': path.resolve(__dirname, './src/lib/empty-module.js'),
    },
  },
  optimizeDeps: {
    force: true,
    include: ['react', 'react-dom'],
    exclude: ['@radix-ui/react-tooltip', 'react-helmet-async'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  clearScreen: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode)
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
}));
