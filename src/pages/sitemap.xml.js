/* Sitemap v3.3: rotas do mapa e as páginas de modelo, geradas do catálogo no build. */
import { plataformas, horizonLinhas, urlModelo } from '../lib/edro.js';

const ROTAS = [
  '/', '/bikes', '/bikes/summa', '/bikes/range', '/bikes/impetus', '/fit4u', '/fit4u/pintura/',
  '/programas',
  '/engenharia', '/a-marca', '/parcerias', '/contato',
  '/horizon', '/horizon/summa-horizon', '/horizon/range-horizon', '/horizon/simulador',
  '/faq', '/guias', '/politicas',
  ...[...plataformas, ...horizonLinhas].flatMap((l) => l.versoes.map((v) => urlModelo(l, v))),
];

/* O personalizador FIT4U entra com prioridade 0.8 (v3.2, seção 4.8). */
const PRIORIDADE = { '/fit4u/pintura/': '0.8' };

export function GET() {
  const corpo = ROTAS.map((r) => `  <url><loc>https://edrobikes.com.br${r}</loc>${PRIORIDADE[r] ? `<priority>${PRIORIDADE[r]}</priority>` : ''}</url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${corpo}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
