/* Sitemap v3.1: todas as rotas do mapa do capítulo 1, geradas no build. */
const ROTAS = [
  '/', '/bikes', '/bikes/summa', '/bikes/range', '/bikes/impetus', '/fit4u',
  '/programas', '/programas/compra-certa', '/programas/ciclo-edro', '/programas/carbon-assist', '/programas/garantia',
  '/engenharia', '/a-marca', '/parcerias', '/contato',
  '/horizon', '/horizon/summa-horizon', '/horizon/range-horizon', '/horizon/simulador',
  '/faq', '/guias', '/politicas',
];

export function GET() {
  const corpo = ROTAS.map((r) => `  <url><loc>https://edrobikes.com.br${r}</loc></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${corpo}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
