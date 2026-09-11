// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://edrobikes.com.br',
  image: {
    // AVIF e WebP com srcset, exigidos pelo capitulo 31 do documento master.
    responsiveStyles: true,
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
