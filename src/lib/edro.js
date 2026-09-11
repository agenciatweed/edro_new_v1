/* =============================================================
   EDRO · Helpers compartilhados
   Formatacao e links que toda pagina usa. Nenhum numero mora aqui:
   tudo vem de content/bikes.json.
   ============================================================= */

import bikes from '../content/bikes.json';

export { bikes };

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

/* ---- Plataformas, com a versao de destaque e a de entrada ---- */

export const plataformas = bikes.plataformas.map((p) => ({
  ...p,
  pro: p.versoes[0],
  entrada: p.versoes[p.versoes.length - 1],
}));

export const porSlug = (slug) => plataformas.find((p) => p.slug === slug);

/* Nome de plataforma em caixa de titulo, para links e listas. */
export const titulo = (nome) => nome.charAt(0) + nome.slice(1).toLowerCase();
