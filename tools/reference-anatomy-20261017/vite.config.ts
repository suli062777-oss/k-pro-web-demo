import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// GitHub Pages 为子路径部署（/V2-L-Pro-Anatomy-main/），通过环境变量切换；本地与 Vercel 保持 '/'
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/V2-L-Pro-Anatomy-main/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
      },
    },
  },
});
