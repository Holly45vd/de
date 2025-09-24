import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      exportAsDefault: false,  // 반드시 false로
      include: '**/*.svg?react' // ?react 파일만 변환
    }),
  ],
  base: '/de/',
});
