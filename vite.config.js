import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
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
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            supabase: ['@supabase/supabase-js'],
            sales: ['./src/lib/apiService.ts'],
          },
        },
      },
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
    },
  };
});
