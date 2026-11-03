import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset URLs work both at a domain root and under /qifu/.
  base: './',
  // The active demo is drawn in SVG, CSS, and Canvas.
  // Keep assets belonging to the earlier hand-shadow demo out of this build.
  publicDir: false,
});
