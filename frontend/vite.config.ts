import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import netlify from '@netlify/vite-plugin';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), netlify()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // 使用 `netlify dev` 启动本地开发，自动代理 /api/* 到 Netlify Functions
    },
  };
});
