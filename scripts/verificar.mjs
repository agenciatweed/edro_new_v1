/* =============================================================
   Verificação pós-build (itens 34.8 e 34.10 do documento master).

   1. Teste de marca: nenhuma página publicada pode conter as
      palavras e caracteres proibidos do checklist 37.3.
   2. Links internos: todo href e src começando com "/" precisa
      resolver para um arquivo em dist/.

   Link para rota do sitemap que ainda não foi construída é
   aviso. Link para rota fora do sitemap é erro, porque ninguém
   vai construí-la.

   Sai com código 1 se houver violação de marca ou link quebrado.
   ============================================================= */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

/* Capítulo 10. */
const SITEMAP = new Set([
  '/', '/bikes', '/bikes/summa', '/bikes/range', '/bikes/impetus', '/fit4u',
  '/programas', '/programas/compra-certa', '/programas/ciclo-edro',
  '/programas/carbon-assist', '/programas/garantia', '/engenharia', '/a-marca',
  '/atletas', '/lojistas', '/assistencia', '/simulador', '/guias', '/blog',
  '/comeca-aqui', '/contato', '/faq', '/politicas',
]);

/* Checklist 37.3 e teste de marca 34.10. */
const REGRAS = [
  ['travessão (U+2014)', /—/g],
  ['meia-risca (U+2013)', /–/g],
  ['"recompra"', /recompra/gi],
  ['"promoção"', /promo[cç][aã]o/gi],
  ['"desconto" fora de "5% de desconto no Pix"', /desconto(?![^<]{0,12}Pix)/gi],
  ['"Fit4U"', /Fit4U/g],
  ['"Edro" fora de caixa alta', /\bEdro\b/g],
  ['"MAVIC"', /MAVIC/gi],
  ['"Vision Metron"', /Vision Metron/gi],
  ['"Wi-Fi"', /Wi-?Fi/gi],
  ['"custo-benefício"', /custo-benef[ií]cio/gi],
  ['"ultra leve"', /ultra[\s-]?leve/gi],
  /* Capitulo 11: virgula decimal. Ponto com 3 digitos e milhar, entao passa. */
  ['ponto decimal em célula de tabela', /<td[^>]*>\s*\d+\.\d{1,2}\s*<\/td>/g],
];

function listarHtml(dir) {
  return readdirSync(dir).flatMap((nome) => {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) return listarHtml(caminho);
    return nome.endsWith('.html') ? [caminho] : [];
  });
}

const rotaDe = (arquivo) => {
  const r = '/' + relative(DIST, arquivo).split(sep).join('/');
  return r.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
};

/* Texto que chega ao visitante e aos buscadores: remove CSS e JS,
   mantém JSON-LD, metadados e atributos. */
const textoPublicado = (html) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi, '');

function resolve(href) {
  const caminho = href.split(/[?#]/)[0];
  if (caminho === '' || caminho === '/') return existsSync(join(DIST, 'index.html'));
  const ultimo = caminho.split('/').pop();
  if (ultimo.includes('.')) return existsSync(join(DIST, caminho));
  return existsSync(join(DIST, caminho, 'index.html'));
}

if (!existsSync(DIST)) {
  console.error('dist/ não existe. Rode o build antes da verificação.');
  process.exit(1);
}

const paginas = listarHtml(DIST);
const violacoes = [];
const pendentes = new Map();
const quebrados = new Map();

for (const arquivo of paginas) {
  const rota = rotaDe(arquivo);
  const html = readFileSync(arquivo, 'utf8');
  const texto = textoPublicado(html);

  for (const [nome, re] of REGRAS) {
    for (const m of texto.matchAll(re)) {
      const trecho = texto.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, ' ');
      violacoes.push({ rota, nome, trecho });
    }
  }

  for (const m of html.matchAll(/\s(?:href|src)="(\/[^"/][^"]*|\/)"/g)) {
    const href = m[1];
    if (resolve(href)) continue;
    const alvo = href.split(/[?#]/)[0].replace(/\/$/, '') || '/';
    const mapa = SITEMAP.has(alvo) ? pendentes : quebrados;
    if (!mapa.has(alvo)) mapa.set(alvo, new Set());
    mapa.get(alvo).add(rota);
  }
}

const listar = (mapa) =>
  [...mapa].sort().forEach(([alvo, origens]) =>
    console.log(`  ${alvo.padEnd(30)} em ${[...origens].sort().join(', ')}`)
  );

console.log(`\nVerificação de ${paginas.length} páginas publicadas\n`);

if (violacoes.length) {
  console.log(`MARCA: ${violacoes.length} violação(ões)`);
  violacoes.forEach((v) => console.log(`  ${v.rota}  ${v.nome}  ...${v.trecho}...`));
} else {
  console.log('MARCA: nenhuma palavra ou caractere proibido.');
}

console.log('');
if (quebrados.size) {
  console.log(`LINKS QUEBRADOS: ${quebrados.size} destino(s) fora do sitemap, que nenhuma página vai atender`);
  listar(quebrados);
} else {
  console.log('LINKS QUEBRADOS: nenhum.');
}

if (pendentes.size) {
  console.log(`\nAVISO: ${pendentes.size} rota(s) do sitemap ainda não construída(s), já linkada(s)`);
  listar(pendentes);
}

console.log('');
process.exit(violacoes.length || quebrados.size ? 1 : 0);
