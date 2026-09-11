/* =============================================================
   EDRO · FAQ das paginas de plataforma
   Bloco 11 do capitulo 14: tamanho, prazo, pneus, peso real e
   upgrade, com schema FAQPage.

   O capitulo 26 so responde "prazo". As outras quatro respostas
   sao compostas de fatos ja documentados: 23.3 e 37.2.7 (tamanho e
   bike fit), 25 (entrega), 37.1.8 e Anexo A (pneus), nota legal
   (peso), 24.2 e 24.4 (Ciclo EDRO e garantia). Nenhum claim novo.

   Nenhum numero e digitado aqui: todo valor sai do bikes.json.
   ============================================================= */

import { bikes, kg, junto } from './edro.js';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* O schema FAQPage precisa do texto puro que aparece na tela. */
const semTags = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const juntar = (itens) =>
  itens.length < 2 ? itens.join('') : `${itens.slice(0, -1).join(', ')} e ${itens.at(-1)}`;

const minuscula = (s) => s.charAt(0).toLowerCase() + s.slice(1);

/* A Regra do Modelo: plataforma em italico, versao em Verde EDRO. */
const modelo = (p) => `<i class="modelo">${esc(p.nome)}</i>`;
const comVersao = (p, v) => `${modelo(p)} <span class="verde">${esc(v.nome)}</span>`;

/* A resposta diz "em todas as versoes". So pode dizer se for verdade
   no dado: se uma versao trocar de pneu, o build falha em vez de
   publicar uma afirmacao falsa. */
const modeloDoPneu = (s) =>
  s.split(/[,(;]/)[0].trim().split(/\s+/).slice(0, 4).join(' ');

function pneuComum(p) {
  const base = modeloDoPneu(p.pro.pneus);
  const outra = p.versoes.find((v) => modeloDoPneu(v.pneus) !== base);
  if (outra) {
    throw new Error(
      `FAQ da ${p.nome}: o pneu da ${outra.nome} difere do da ${p.pro.nome}. ` +
      'A resposta afirmaria "em todas as versões" sem ser verdade. Reescreva antes de publicar.'
    );
  }
  return p.pro.pneus;
}

export function montarFaq(p) {
  const c = bikes.meta.condicoes;

  const ciclo = bikes.programas.find((x) => x.slug === 'ciclo-edro');
  if (!ciclo?.janela_meses) {
    throw new Error('FAQ: o programa ciclo-edro precisa de janela_meses no bikes.json.');
  }
  const [mesesMin, mesesMax] = ciclo.janela_meses;

  const folga = p.quadro.folga_pneu
    ? ` O quadro e o garfo aceitam pneus até ${esc(p.quadro.folga_pneu)}, o que aumenta a versatilidade.`
    : '';

  const itens = [
    [
      `Qual tamanho de ${modelo(p)} é o meu?`,
      `A ${modelo(p)} é produzida nos tamanhos ${esc(juntar(p.tamanhos))}. Você não escolhe sozinho: pelo FIT4U, a EDRO define o tamanho do quadro e os componentes a partir do seu relatório de bike fit ou das suas medidas, e a bike chega com pré-fit ajustado de fábrica. O bike fit profissional é recomendado, mas não é obrigatório.`,
    ],
    [
      'Qual o prazo de entrega?',
      `${c.prazo_entrega_dias} dias após a confirmação do pedido e a aprovação do projeto de pintura, incluindo ${c.cura_pintura_dias} dias de cura da pintura em ambiente controlado. O frete é ${esc(minuscula(c.frete))}, e você também pode retirar a bike na fábrica, em Tubarão, SC.`,
    ],
    [
      `Quais pneus a ${modelo(p)} usa?`,
      `A ${modelo(p)} sai de fábrica com ${esc(pneuComum(p))}, em todas as versões.${folga}`,
    ],
    [
      'O peso anunciado é o peso real?',
      `Os pesos publicados são da bike completa: ${kg(p.pro.peso_kg)} kg na ${comVersao(p, p.pro)} e ${kg(p.entrada.peso_kg)} kg na ${comVersao(p, p.entrada)}. ${esc(bikes.meta.nota_legal)}`,
    ],
    [
      'Posso fazer upgrade depois?',
      `Sim. Se você é o comprador original, o Ciclo EDRO permite usar a sua EDRO, com ${mesesMin} a ${mesesMax} meses de compra, como parte do valor de entrada de uma nova EDRO, mediante avaliação técnica e comercial. O valor não vira dinheiro e só vale na mesma compra. Para trocar componentes, fale antes com a EDRO: alteração não autorizada no quadro, no garfo ou em componentes anula a garantia.`,
    ],
  ];

  return itens.map(([p1, r1]) => {
    const [pergunta, resposta] = [junto(p1), junto(r1)];
    return {
      perguntaHtml: pergunta,
      respostaHtml: resposta,
      pergunta: semTags(pergunta),
      resposta: semTags(resposta),
    };
  });
}
