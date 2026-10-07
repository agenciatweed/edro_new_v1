/* =============================================================
   EDRO · Helpers compartilhados
   Formatacao e links que toda pagina usa. Nenhum numero mora aqui:
   tudo vem de content/bikes.json.
   ============================================================= */

import bikes from '../content/bikes.json';

import catalogo from '../content/bikes_2027.json';
import catalogoHz from '../content/horizon_2027.json';
import horizonSite from '../content/horizon.json';

export { bikes, catalogo, catalogoHz };

/* ---- Formatacao, capitulo 11: virgula decimal, ponto de milhar ---- */

export const brl = (n) => 'R$\u00A0' + new Intl.NumberFormat('pt-BR').format(n);

export const kg = (n) => n.toFixed(2).replace('.', ',');

/* Numero e unidade nunca se separam no fim da linha ("menos de 7 | kg",
   "160 | mm"): o espaco entre eles vira inseparavel. Serve a qualquer texto
   que venha de dado, inclusive HTML ja montado (nao toca em tag). */
export const junto = (s) =>
  typeof s === 'string'
    ? s.replace(/(\d) (kg|g|mm|cm|ml|km|W|TPI)\b/g, '$1\u00A0$2').replace(/R\$ (?=\d)/g, 'R$\u00A0')
    : s;

/* Medida de tabela (geometria): numero vira 1.143,8; texto como "77°" passa direto. */
export const medida = (v) =>
  typeof v === 'number'
    ? new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v)
    : v;

/* ---- WhatsApp, numeros reais da decisao 37.1.13 ---- */

export const digitos = (s) => s.replace(/\D/g, '');

export const comercial = digitos(bikes.contato.whatsapp_comercial);
export const suporte = digitos(bikes.contato.whatsapp_suporte);

/* Exibicao no padrao do capitulo 27: +55 48 99110-2017 vira (48) 99110-2017. */
export const telefoneBr = (s) => {
  const m = digitos(s).replace(/^55(?=\d{10,11}$)/, '').match(/^(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : s;
};

/* Todo caminho termina numa conversa com mensagem pre-preenchida e
   codigo de origem. Botao sem mensagem e sem origem e bug. */
export const wa = (msg, numero = comercial) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;

/* ---- Personalizador de pintura FIT4U (v3.2, seção 4) ---- */

export const PERSONALIZADOR = '/fit4u/pintura/';

/* Chaves aceitas em ?modelo= (INTEGRACAO_FIT4U.md, seção 2). A IMPETUS SS
   ainda não tem foto no personalizador e fica sem chave. */
export const CHAVES_FIT4U = [
  'summa-pro', 'summa-xcr', 'summa-ex', 'range-pro', 'range-xcr', 'range-ex', 'impetus-pro', 'impetus-ssr',
  'summa-pro-hz', 'summa-xcr-hz', 'summa-ex-hz', 'range-pro-hz', 'range-xcr-hz', 'range-ex-hz',
];

export const chaveFit4u = (linha, versao, horizon = false) => {
  const k = `${linha}-${versao}${horizon ? '-hz' : ''}`;
  return CHAVES_FIT4U.includes(k) ? k : null;
};

export const personalizar = (chave) => (chave ? `${PERSONALIZADOR}?modelo=${chave}` : PERSONALIZADOR);

/* ---- Catálogo 2027 (v3.2, seção 2): fonte de preço, peso, resumo, destaques,
   ficha e tamanhos de todas as versões. bikes.json e horizon.json guardam só o
   que o catálogo não cobre (geometria, números de engenharia, macros, vídeos). ---- */

const versaoDoCatalogo = (v) => {
  const chave = v.personalizar_url ? new URLSearchParams(v.personalizar_url.split('?')[1]).get('modelo') : null;
  if (v.personalizar_url && !CHAVES_FIT4U.includes(chave))
    throw new Error(`personalizar_url com chave desconhecida: ${v.personalizar_url}`);
  return {
    slug: v.versao.toLowerCase(),
    nome: v.versao,
    chave: v.chave_fit4u,
    preco: v.preco,
    preco_texto: v.preco_texto,
    parcelamento: v.parcelamento,
    peso_kg: Number(v.peso_kg),
    peso_texto: v.peso_texto,
    resumo: v.resumo,
    destaques: v.destaques,
    ficha: Object.entries(v.ficha),
    /* Foto lateral oficial (Drive); a IMPETUS SS usa o recorte do catálogo. */
    foto: `bikes/${v.chave_fit4u}.png`,
    personalizar: v.personalizar_url,
  };
};

/* macro_specs da v3.1, agora com as linhas Rodas, Transmissão, Suspensão, Canote e Freios da ficha. */
const MACRO = ['Rodas', 'Transmissão', 'Suspensão', 'Canote', 'Freios'];
const macroSpecs = (versoes) => MACRO.map((item) => {
  const valores = versoes.map((v) => [v.nome, v.ficha.find(([k]) => k === item)?.[1]]).filter(([, x]) => x);
  if (!valores.length) return null;
  const iguais = new Set(valores.map(([, x]) => x)).size === 1;
  return [item, iguais ? valores[0][1] : valores.map(([n, x]) => `${x} (${n})`).join('; ')];
}).filter(Boolean);

const linhaDoCatalogo = (c) => {
  const versoes = c.versoes.map(versaoDoCatalogo);
  return {
    para_quem: c.para_quem,
    tipo: c.tipo,
    quadro_texto: c.quadro,
    tamanhos_texto: c.tamanhos,
    versoes,
    macro_specs: macroSpecs(versoes),
    pro: versoes[0],
    entrada: versoes[versoes.length - 1],
  };
};

/* ---- Plataformas, com a versao de destaque e a de entrada ---- */

export const plataformas = bikes.plataformas.map((p) => {
  const c = catalogo.linhas.find((l) => l.id === p.slug);
  if (!c) throw new Error(`Linha ${p.slug} fora do catálogo 2027`);
  return { ...p, ...linhaDoCatalogo(c), beneficio: c.para_quem };
});

export const porSlug = (slug) => plataformas.find((p) => p.slug === slug);

/* HORIZON: textos do site (horizon.json) + dados do catálogo (horizon_2027.json). */
export const horizonLinhas = horizonSite.linhas.map((l) => {
  const c = catalogoHz.linhas.find((x) => x.id === l.slug);
  if (!c) throw new Error(`Linha ${l.slug} fora do catálogo 2027`);
  return { ...l, ...linhaDoCatalogo(c) };
});

/* Peso como o catálogo publica: duas casas nas linhas (8,47), uma na HORIZON (14,5). */
export const pesoTexto = (v) => v.peso_texto.replace(/\s*kg$/, '');

export const notaPeso = catalogo.nota_peso;
export const vigencia = catalogo.vigencia;
export const rodapeFicha = [catalogo.nota_peso, catalogo.vigencia, 'Imagem ilustrativa; a pintura é definida com você no FIT4U.'];

/* Nome de plataforma em caixa de titulo, para links e listas. */
export const titulo = (nome) => nome.charAt(0) + nome.slice(1).toLowerCase();
