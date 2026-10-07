/* =============================================================
   Verificação pós-build · capítulos 2 e 8 da especificação v3.1
   (e checklist 37.3 do documento master).

   1. Marca e verdade: nenhuma página publicada pode conter os termos
      proibidos. 1.200 W sempre com os 600 W nominais na mesma seção;
      45 km/h sempre com circuito fechado e legislação; todo peso com
      "sem pedais" e a nota oficial.
   2. Links internos: todo href e src começando com "/" resolve em dist/.
   3. Redirecionamentos da v3.1 existem.
   4. Personalizador FIT4U (v3.2): os arquivos de bikes/, lupa/ e vendor/ chegam ao
      dist/ byte a byte iguais ao pacote (scripts/fit4u-manifesto.md5), bikes/ tem 84
      mapas e todo link ?modelo= usa uma chave que o personalizador conhece.
   5. Mídias pendentes: lista os placeholders de FOTO e VÍDEO que ainda
      precisam ser produzidos (aviso, não erro: as telas os preveem).

   Sai com código 1 se houver violação ou link quebrado.
   ============================================================= */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

/* O simulador é o arquivo original da EDRO, servido sem alteração (capítulo 7). */
/* O personalizador FIT4U também: página pronta da EDRO, só o <head> e o FIT4U_CONFIG são do site (v3.2, 4.8). */
const FORA = new Set(['/simulador', '/fit4u/pintura']);
const CHAVES_FIT4U = [
  'summa-pro', 'summa-xcr', 'summa-ex', 'range-pro', 'range-xcr', 'range-ex', 'impetus-pro', 'impetus-ssr',
  'summa-pro-hz', 'summa-xcr-hz', 'summa-ex-hz', 'range-pro-hz', 'range-xcr-hz', 'range-ex-hz',
];
const REDIRECIONADAS = ['/assistencia', '/comeca-aqui', '/atletas', '/lojistas'];

const REGRAS = [
  ['travessão (U+2014)', /—/g],
  ['meia-risca (U+2013)', /–/g],
  ['"plataforma"', /plataformas?\b/gi],
  ['"recompra"', /recompra/gi],
  ['"promoção"', /promo[cç][aã]o/gi],
  ['"desconto" fora de "5% de desconto no Pix"', /desconto(?![^<]{0,12}Pix)/gi],
  ['"estimado" junto a peso', /(peso[^<.]{0,40}estimad|estimad[^<.]{0,40}peso)/gi],
  ['promessa de "2 horas"', /2 horas|duas horas/gi],
  ['nome no número de série', /nome no n[uú]mero de s[eé]rie|n[uú]mero de s[eé]rie com (o seu )?nome/gi],
  ['"Samsung"', /samsung/gi],
  ['"Fit4U"', /Fit4U/g],
  ['"Edro" fora de caixa alta', /\bEdro\b/g],
  ['"MAVIC"', /MAVIC/gi],
  ['"Vision Metron"', /Vision Metron/gi],
  ['"Wi-Fi"', /Wi-?Fi/gi],
  ['"custo-benefício"', /custo-benef[ií]cio/gi],
  ['"ultra leve"', /ultra[\s-]?leve/gi],
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

/* Texto que chega ao visitante e aos buscadores: sem CSS e JS, com JSON-LD e atributos. */
const textoPublicado = (html) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi, '');

/* Texto visível, por seção: para as regras que valem "na mesma seção". */
const secoes = (html) =>
  (textoPublicado(html).match(/<(section|div class="faixa-specs")[\s\S]*?<\/section>|<div class="faixa-specs">[\s\S]*?<\/div>\s*<\/div>/gi) || [])
    .map((s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' '));

function resolve(href) {
  const caminho = decodeURI(href.split(/[?#]/)[0]);
  if (caminho === '' || caminho === '/') return existsSync(join(DIST, 'index.html'));
  const ultimo = caminho.split('/').pop();
  if (ultimo.includes('.')) return existsSync(join(DIST, caminho));
  return existsSync(join(DIST, caminho, 'index.html'));
}

if (!existsSync(DIST)) {
  console.error('dist/ não existe. Rode o build antes da verificação.');
  process.exit(1);
}

const ehRedirecionamento = (html) => /http-equiv="refresh"/i.test(html) && html.length < 2000;
const paginas = listarHtml(DIST).filter((a) => ![...FORA].some((f) => rotaDe(a).startsWith(f)));
const violacoes = [];
const quebrados = new Map();
const pendentes = new Map();

for (const arquivo of paginas) {
  const rota = rotaDe(arquivo);
  const html = readFileSync(arquivo, 'utf8');
  if (ehRedirecionamento(html)) continue;
  const texto = textoPublicado(html);

  for (const [nome, re] of REGRAS) {
    for (const m of texto.matchAll(re)) {
      const trecho = texto.slice(Math.max(0, m.index - 50), m.index + 50).replace(/\s+/g, ' ');
      violacoes.push({ rota, nome, trecho });
    }
  }

  /* HORIZON: sem "uma por vez" */
  if (rota.startsWith('/horizon') && /uma por vez/i.test(texto)) violacoes.push({ rota, nome: '"uma por vez" em página HORIZON', trecho: '' });

  for (const s of secoes(html)) {
    if (/1\.200 ?W/i.test(s) && !/600 ?W/i.test(s)) violacoes.push({ rota, nome: '1.200 W sem os 600 W nominais na mesma seção', trecho: s.slice(0, 120) });
    if (/45 ?km\/h/i.test(s) && !(/circuitos? fechados?|locais fechados/i.test(s) && /legisla/i.test(s)))
      violacoes.push({ rota, nome: '45 km/h sem circuito fechado e legislação', trecho: s.slice(0, 120) });
    if (/\d,\d{1,2} ?kg/.test(s) && !/sem pedais/i.test(s) && !/<svg/.test(s))
      violacoes.push({ rota, nome: 'peso sem "sem pedais" na mesma seção', trecho: s.slice(0, 120) });
  }

  for (const m of html.matchAll(/\s(?:href|src)="(\/[^"/][^"]*|\/)"/g)) {
    const href = m[1];
    if (resolve(href)) continue;
    const alvo = href.split(/[?#]/)[0].replace(/\/$/, '') || '/';
    if (!quebrados.has(alvo)) quebrados.set(alvo, new Set());
    quebrados.get(alvo).add(rota);
  }

  for (const m of html.matchAll(/href="\/fit4u\/pintura\/\?modelo=([^"&#]+)"/g)) {
    if (!CHAVES_FIT4U.includes(m[1])) violacoes.push({ rota, nome: 'chave do personalizador FIT4U desconhecida', trecho: m[1] });
  }

  for (const m of html.matchAll(/data-midia-pendente="([^"]+)"/g)) {
    if (!pendentes.has(rota)) pendentes.set(rota, []);
    pendentes.get(rota).push(m[1]);
  }
}

/* Personalizador: nenhum mapa recomprimido ou faltando no deploy. */
const fit4u = [];
const MANIFESTO = join(dirname(fileURLToPath(import.meta.url)), 'fit4u-manifesto.md5');
for (const linha of readFileSync(MANIFESTO, 'utf8').split(/\r?\n/).filter(Boolean)) {
  const [md5, nome] = linha.trim().split(/\s+\*?/);
  const arq = join(DIST, 'fit4u', 'pintura', nome.replace(/^\.\//, ''));
  if (!existsSync(arq)) fit4u.push(`falta ${nome}`);
  else if (createHash('md5').update(readFileSync(arq)).digest('hex') !== md5) fit4u.push(`alterado ${nome}`);
}
const mapas = existsSync(join(DIST, 'fit4u/pintura/bikes')) ? readdirSync(join(DIST, 'fit4u/pintura/bikes')).length : 0;
if (mapas !== 84) fit4u.push(`bikes/ com ${mapas} arquivos (esperado 84)`);
if (!existsSync(join(DIST, 'fit4u/pintura/index.html'))) fit4u.push('falta index.html');

const faltaRedir = REDIRECIONADAS.filter((r) => !existsSync(join(DIST, r, 'index.html')));

console.log(`\nVerificação de ${paginas.length} páginas publicadas\n`);
if (violacoes.length) {
  console.log(`MARCA E VERDADE: ${violacoes.length} violação(ões)`);
  violacoes.forEach((v) => console.log(`  ${v.rota}  ${v.nome}  ...${v.trecho}...`));
} else {
  console.log('MARCA E VERDADE: nenhuma violação.');
}

console.log('');
if (quebrados.size) {
  console.log(`LINKS QUEBRADOS: ${quebrados.size}`);
  [...quebrados].sort().forEach(([a, o]) => console.log(`  ${a.padEnd(30)} em ${[...o].sort().join(', ')}`));
} else {
  console.log('LINKS QUEBRADOS: nenhum.');
}

console.log(fit4u.length ? `\nPERSONALIZADOR FIT4U: ${fit4u.length} problema(s)\n  ${fit4u.join('\n  ')}` : '\nPERSONALIZADOR FIT4U: 84 mapas, arquivos idênticos ao pacote.');
console.log(faltaRedir.length ? `\nREDIRECIONAMENTOS FALTANDO: ${faltaRedir.join(', ')}` : '\nREDIRECIONAMENTOS 301: ok.');

const total = [...pendentes.values()].reduce((n, l) => n + l.length, 0);
console.log(`\nAVISO: ${total} mídia(s) ainda a produzir (placeholders das telas site_v3):`);
[...pendentes].sort().forEach(([r, l]) => console.log(`  ${r.padEnd(28)} ${l.join(' · ')}`));

console.log('');
process.exit(violacoes.length || quebrados.size || faltaRedir.length || fit4u.length ? 1 : 0);
