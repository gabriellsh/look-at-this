import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const resolve = (path) => fileURLToPath(new URL(path, import.meta.url));

// Single source of truth for the MediaPipe version: the installed package. The WASM runtime
// is loaded from the CDN at this same version, so the JS API and the binary always match.
const mediapipeVersion = JSON.parse(
  readFileSync(resolve('./node_modules/@mediapipe/tasks-vision/package.json'), 'utf8'),
).version;

// Relative base so the static build works on GitHub Pages (https://<user>.github.io/look-at-this/)
export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    __MEDIAPIPE_VERSION__: JSON.stringify(mediapipeVersion),
  },
  build: {
    rollupOptions: {
      // Each demo is its own page so it can be opened (and iframed) directly.
      input: {
        main: resolve('./index.html'),
        'background-blur-lab': resolve('./demos/background-blur-lab/index.html'),
      },
    },
  },
});
