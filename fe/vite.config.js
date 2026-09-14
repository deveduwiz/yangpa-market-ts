import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // 백엔드 호스트는 .env 의 VITE_PROXY_TARGET 으로 관리한다.
  const target = env.VITE_PROXY_TARGET || 'http://127.0.0.1:3000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/members': { target, changeOrigin: true },
        '/sales': { target, changeOrigin: true },
        '/image': { target, changeOrigin: true },
      },
    },
  };
});
