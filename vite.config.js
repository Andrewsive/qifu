import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Relative asset URLs work both at a domain root and under /qifu/.
  base: './',
  // The active demo is drawn in SVG, CSS, and Canvas.
  // Keep assets belonging to the earlier hand-shadow demo out of this build.
  publicDir: false,
  build: {
    rollupOptions: {
      input: {
        ritual: fileURLToPath(new URL('./index.html', import.meta.url)),
        videoWish: fileURLToPath(new URL('./video-wish.html', import.meta.url)),
      },
    },
  },
});
