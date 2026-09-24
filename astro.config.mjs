// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://edrobikes.com.br',
  image: {
    // AVIF e WebP com srcset, exigidos pelo capitulo 31 do documento master.
    responsiveStyles: true,
  },
  /* 301 da v3.1 (capítulo 8) e das URLs do site atual. Em hospedagem estática o Astro
     gera uma página de redirecionamento; public/_redirects e vercel.json fazem o 301 real. */
  redirects: {
    '/assistencia': { status: 301, destination: '/contato' },
    '/comeca-aqui': { status: 301, destination: '/' },
    '/atletas': { status: 301, destination: '/parcerias' },
    '/lojistas': { status: 301, destination: '/parcerias' },
    '/bicicletas': { status: 301, destination: '/bikes' },
    '/summa': { status: 301, destination: '/bikes/summa' },
    '/range': { status: 301, destination: '/bikes/range' },
    '/impetus': { status: 301, destination: '/bikes/impetus' },
    '/sobre-a-edro': { status: 301, destination: '/a-marca' },
    '/duvidas-frequentes': { status: 301, destination: '/faq' },
    '/compra-certa': { status: 301, destination: '/programas/compra-certa' },
    '/ciclo-edro': { status: 301, destination: '/programas/ciclo-edro' },
    '/edro-carbon-assist': { status: 301, destination: '/programas/carbon-assist' },
    '/garantia': { status: 301, destination: '/programas/garantia' },
    '/minha-conta': { status: 301, destination: '/contato' },
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
