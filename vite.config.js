import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the static build works on GitHub Pages (https://<user>.github.io/look-at-this/)
export default defineConfig({
  base: './',
  plugins: [react()],
});
