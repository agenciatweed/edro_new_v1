/* =============================================================
   FAQPage em JSON-LD para buscadores e assistentes de IA (novembro de 2026).
   Toda página indexável sai com FAQ ou produto em dados estruturados:
   - páginas de linha (ProductGroup) e de modelo (Product) já têm o produto;
   - /programas, /faq e /horizon/kit-horizon já têm o próprio FAQPage;
   - o personalizador FIT4U traz o FAQPage no próprio HTML (src/fit4u/personalizador.html);
   - as demais páginas recebem aqui um FAQPage com respostas tiradas do conteúdo do site.
   Números (preço, peso, potência, autonomia, contato) vêm sempre dos dados, nunca de texto fixo.
   ============================================================= */
import { bikes, brl, catalogoHz, plataformas, horizonLinhas, telefoneBr, PARCELAMENTO } from './edro.js';

const ct = bikes.contato;
const menorPreco = (l) => Math.min(...l.versoes.map((v) => v.preco));
const menorPeso = (l) => l.versoes.reduce((a, v) => (v.peso_kg < a.peso_kg ? v : a)).peso_texto;
const linha = (slug) => plataformas.find((p) => p.slug === slug) ?? horizonLinhas.find((l) => l.slug === slug);
const pega = (txt, re) => (txt.match(re) ?? [])[1];
const sis = catalogoHz.sistema;
const pico = pega(sis.Motor, /([\d.]+) W de pico/);
const nominal = pega(sis.Motor, /(\d+) W nominal/);
const torque = pega(sis.Motor, /([\d,]+) N\.m/);
const wh = pega(sis.Bateria, /(\d+) Wh/);
const eco = pega(sis.Autonomia, /Eco \d+ a (\d+) km/);
const parcela = PARCELAMENTO.replace(/^em até /, '');

const pagamento = `${parcela} no cartão ou 5% de desconto no Pix.`;
const entrega = 'Até 30 dias após a confirmação do pedido e a aprovação do projeto de pintura, com frete grátis para todo o Brasil.';
const garantia = 'Quadro, garfo e componentes de marca EDRO têm garantia vitalícia contra defeitos de fabricação para o primeiro proprietário. Rodas VORZ e demais componentes têm 2 anos de garantia, com assistência técnica no Brasil.';
const linhas = () => {
  const s = linha('summa'), r = linha('range'), i = linha('impetus'), sh = linha('summa-horizon'), rh = linha('range-horizon');
  return `SUMMA, hardtail de cross country, a partir de ${brl(menorPreco(s))}; RANGE, full suspension de cross country, a partir de ${brl(menorPreco(r))}; IMPETUS, bicicleta de estrada, a partir de ${brl(menorPreco(i))}; e as elétricas de pedal assistido SUMMA HORIZON, a partir de ${brl(menorPreco(sh))}, e RANGE HORIZON, a partir de ${brl(menorPreco(rh))}.`;
};

const FAQ = {
  '/': () => [
    ['O que é a EDRO?', 'A EDRO Performance Bikes é uma fabricante brasileira de bicicletas de alta performance em carbono, projetadas, laminadas, pintadas e montadas à mão em Tubarão, SC, desde 2017.'],
    ['Quais bicicletas a EDRO fabrica?', `A EDRO fabrica cinco linhas: ${linhas()}`],
    ['A pintura da bike é personalizada?', 'Sim. Toda EDRO tem pintura exclusiva, feita à mão, sem custo adicional. Você pode montar a sua no personalizador de pintura FIT4U e a equipe de design da EDRO aprova o projeto com você.'],
    ['Quais são as formas de pagamento?', pagamento],
    ['Qual o prazo de entrega e o frete?', entrega],
    ['As bikes EDRO têm garantia?', garantia],
  ],
  '/bikes': () => [
    ['Quais modelos de bicicleta a EDRO tem?', linhas()],
    ['Qual bike EDRO é a certa para mim?', 'Para prova e treino de cross country, com leveza máxima, a SUMMA. Para maratona, trilha técnica e mais conforto, a RANGE. Para estrada, treinos longos e provas, a IMPETUS. Para voltar ao ritmo, acompanhar um grupo mais forte, ir mais longe e subir mais, a SUMMA HORIZON ou a RANGE HORIZON, de pedal assistido.'],
    ['Quanto pesa uma bike EDRO?', `A IMPETUS pesa a partir de ${menorPeso(linha('impetus'))}, a SUMMA a partir de ${menorPeso(linha('summa'))} e a RANGE a partir de ${menorPeso(linha('range'))}. Pesos sem pedais, aferidos no tamanho M, podendo variar até 5% conforme o tamanho, os componentes e a pintura.`],
    ['Qual a diferença entre as versões EX, XCR e PRO?', 'As três versões usam o mesmo quadro de carbono. Mudam os componentes: a EX é a forma mais direta de ter a linha sob medida; a XCR traz rodas de carbono e transmissão eletrônica sem fio; a PRO reúne os componentes de topo, como a suspensão Flight Attendant e a transmissão SRAM XX SL. Na IMPETUS, as versões são SS, SSR e PRO.'],
    ['Quais são as formas de pagamento?', pagamento],
  ],
  '/horizon': () => {
    const sh = linha('summa-horizon'), rh = linha('range-horizon');
    return [
      ['O que é a EDRO HORIZON?', 'A HORIZON é a versão elétrica, de pedal assistido, das bikes de cross country da EDRO: a SUMMA HORIZON (hardtail) e a RANGE HORIZON (full suspension), com a mesma geometria e a dinâmica de uma bike convencional.'],
      ['Qual a potência do motor da HORIZON?', `Motor central CYC Photon Gen 2 com ${pico} W de pico, potência nominal de ${nominal} W e ${torque} N.m de torque. A assistência só atua com pedalada, sem acelerador.`],
      ['Qual a autonomia da HORIZON?', `Até ${eco} km no modo Eco, com o EDRO Power Pack de ${wh} Wh. A autonomia varia com terreno, peso e ritmo; o simulador da EDRO calcula a autonomia para a sua rota.`],
      ['Quanto pesa a HORIZON?', `A SUMMA HORIZON pesa a partir de ${menorPeso(sh)} e a RANGE HORIZON a partir de ${menorPeso(rh)}, sem pedais, no tamanho M.`],
      ['Quanto custa a HORIZON?', `A SUMMA HORIZON custa a partir de ${brl(menorPreco(sh))} e a RANGE HORIZON a partir de ${brl(menorPreco(rh))}, em ${parcela} no cartão.`],
      ['A HORIZON precisa de habilitação?', 'Não. É bicicleta elétrica nos termos da CONTRAN 996/2023: pedal assistido, sem acelerador, limitada a 32 km/h de fábrica.'],
      ['Tenho uma SUMMA ou RANGE geração 3. Posso levá-la à versão HORIZON?', 'Sim. O quadro geração 3 já carrega a arquitetura do sistema HORIZON, e o Kit HORIZON leva a sua bike à nova versão, com validação pelo número de série do quadro.'],
    ];
  },
  '/horizon/simulador': () => [
    ['Como funciona o simulador de autonomia da HORIZON?', 'Você envia a rota do seu pedal em GPX, TCX ou FIT, do Strava ou do Garmin, e o simulador calcula a autonomia real da HORIZON considerando trajeto, altimetria, peso, cadência, vento e temperatura.'],
    ['O simulador é preciso?', 'Sim. A margem de erro é de 2% contra pedais reais medidos, calibrada com mais de 15 pedais instrumentados.'],
    ['Qual a autonomia máxima da HORIZON?', `Até ${eco} km no modo Eco, com o EDRO Power Pack de ${wh} Wh. Para a sua rota, o simulador dá o número exato.`],
  ],
  '/fit4u': () => [
    ['O que é o FIT4U da EDRO?', 'É o processo EDRO de personalização: você cria a pintura da sua bike ao seu gosto e a EDRO orienta a escolha exata do tamanho do quadro e dos componentes, como mesa e guidão, para o ajuste ergonômico perfeito.'],
    ['Quanto custa a pintura personalizada?', 'A pintura personalizada não tem custo adicional em nenhuma bike EDRO.'],
    ['Como funciona o FIT4U?', 'Em cinco passos: escolha da bike com um especialista; projeto de pintura no personalizador, revisado com o designer da EDRO; bike fit ou envio das suas medidas; pintura exclusiva à mão em PU Acrílica Carbon Industrial; montagem, inspeção e entrega.'],
    ['Qual o prazo de uma bike FIT4U?', 'A bike é montada, inspecionada e entregue com a sua pintura exclusiva em até 30 dias.'],
    ['A pintura vai para a produção sem a minha aprovação?', 'Não. A equipe de design revisa cada detalhe com você, e só depois da sua aprovação final a bike entra na linha de produção.'],
  ],
  '/engenharia': () => [
    ['Como é feito um quadro EDRO?', 'Cada quadro nasce de um molde exclusivo EDRO, é laminado com prepreg de carbono 40T e 46T, curado com núcleo de EPS em peça única (monocoque), inspecionado, pintado à mão e montado em Tubarão, SC.'],
    ['O que é a moldagem em EPS?', 'O núcleo de EPS pressiona o carbono contra o molde de forma uniforme. A parede interna fica homogênea, sem rugas nem acúmulo de resina: menos peso morto e mais resistência a longo prazo.'],
    ['Por que usar fibra de carbono 46T e 40T?', 'A fibra de módulo mais alto (46T) vai no movimento central e no tubo de direção, onde você faz força; a 40T vai nos stays, onde o conforto importa. As camadas são orientadas a 0°, ±45° e 90° conforme a função de cada tubo.'],
    ['O que é um quadro monocoque?', 'É um quadro moldado em peça única, sem juntas entre os tubos: menos peso, mais responsividade e nenhum ponto de fragilidade onde um tubo encontra o outro.'],
  ],
  '/a-marca': () => [
    ['Onde as bikes EDRO são fabricadas?', 'Em Tubarão, Santa Catarina, onde a EDRO projeta, lamina, pinta e monta as suas bicicletas de alta performance em carbono.'],
    ['Desde quando a EDRO existe?', 'Desde 2017. A EDRO nasceu de dois ciclistas que resolveram fabricar a bike que acreditavam ser a certa: projetada para o corpo de quem pedala, com componentes escolhidos pelo ganho real e assistência de verdade no Brasil.'],
    ['Qual a missão da EDRO?', 'Fabricar bicicletas de alta performance para ciclistas profissionais e amadores, com a visão de ser a melhor marca de bicicletas de alta performance do Brasil.'],
  ],
  '/contato': () => [
    ['Como falar com a EDRO?', `Pelo WhatsApp comercial ${telefoneBr(ct.whatsapp_comercial)}, pelo suporte ${telefoneBr(ct.whatsapp_suporte)} ou pelo e-mail ${ct.email}.`],
    ['Onde fica a fábrica da EDRO?', `${ct.endereco_curto}.`],
    ['Qual o horário de atendimento?', `${ct.horario}.`],
  ],
  '/guias': () => [
    ['Os guias da EDRO são gratuitos?', 'Sim. Os três guias são gratuitos e escritos pela equipe da EDRO para quem já pedala.'],
    ['Quais guias a EDRO oferece?', 'Performance na estrada, com planilhas de treino, aerodinâmica e técnicas de pelotão; Técnicas de MTB XC, com treino, controle de subidas e pilotagem para XC e maratona; e Nutrição no ciclismo, sobre o que comer antes, durante e depois do treino.'],
  ],
  '/politicas': () => [
    ['Posso devolver a minha EDRO?', 'Sim, pelo programa Compra Certa: você tem 10 dias a partir do recebimento para devolver a bike e receber 100% do valor pago.'],
    ['Quanto custa o frete?', 'O frete é grátis para todo o Brasil.'],
    ['Como a EDRO trata os meus dados?', 'Os dados pessoais são tratados conforme a LGPD, apenas para o atendimento e a venda, como descrito na política de privacidade e proteção de dados da EDRO.'],
  ],
};

export function faqDaRota(rota) {
  const gera = FAQ[rota];
  if (!gera) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: gera().map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}
