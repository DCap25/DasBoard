import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Set base path - root deployment for unified marketing + dashboard site
  const base = env.VITE_BASE_PATH || '/';

  return {
    plugins: [react()],
    base,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      open: true,
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'terser',
      target: 'es2015',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            router: ['react-router-dom'],
            'ui-components': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs',
            ],
            supabase: ['@supabase/supabase-js'],
            query: ['@tanstack/react-query'],
            utils: ['clsx', 'tailwind-merge', 'date-fns'],
            icons: ['lucide-react'],
          },
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
        },
      },
      // Optimize bundle size
      chunkSizeWarningLimit: 1000,
    },
    preview: {
      port: 4173,
      host: true,
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.USE_MOCK_SUPABASE': JSON.stringify(env.USE_MOCK_SUPABASE),
      'import.meta.env.VITE_DEALERSHIP1_SUPABASE_URL': JSON.stringify(
        env.VITE_DEALERSHIP1_SUPABASE_URL
      ),
      'import.meta.env.VITE_DEALERSHIP1_SUPABASE_ANON_KEY': JSON.stringify(
        env.VITE_DEALERSHIP1_SUPABASE_ANON_KEY
      ),
      'import.meta.env.VITE_APP_URL': JSON.stringify(env.VITE_APP_URL),
      'import.meta.env.VITE_MARKETING_URL': JSON.stringify(env.VITE_MARKETING_URL),
      'import.meta.env.VITE_DEPLOYMENT_VERSION': JSON.stringify(
        env.VITE_DEPLOYMENT_VERSION || '1.0.0'
      ),
    },
  };
});
