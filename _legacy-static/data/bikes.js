/* =============================================================
   EDRO · Fonte única de dados de produto
   =============================================================
   Nenhum número de peso ou preço é digitado dentro de um
   componente. Todo valor exibido no site sai daqui.

   Para atualizar o site, edite apenas este arquivo.

   PENDÊNCIAS (validar com a EDRO antes de publicar):
   · RANGE  · pesos divergem entre o Documento-Mãe (10,23 / 10,82
     / 10,95) e o material de treinamento (9,89 / 10,58 / 10,99).
     Em uso: catálogo do Documento-Mãe.
   · IMPETUS · pesos da geração 3.1 pendentes de remedição.
   · IMPETUS · a versão SS (R$ 23.990) ainda está marcada
     [CONFIRMAR] no briefing. O card usa a SSR (R$ 32.990), que
     é a versão de entrada confirmada. Trocar para SS quando a
     EDRO validar.
   · Preços de tabela podem mudar antes do lançamento.
   ============================================================= */

window.EDRO_DATA = {

  /* Nota legal obrigatória sob toda ficha e todo peso. */
  notaPeso:
    'Pesos para quadro tamanho M, sem pedais, com variação de até 5% conforme componentes, ' +
    'projeto de pintura e tamanho do quadro. A EDRO reserva-se o direito de alterar ' +
    'especificações sem aviso prévio.',

  /* Bloco em destaque no hero. */
  hero: {
    plataforma: 'SUMMA',
    versao: 'PRO',
    peso: '8,47',
    unidade: 'kg',
    descricao: 'completa, sem pedais',
    linhaTecnica: 'Molde exclusivo, prepreg 46T, monocoque EPS'
  },

  /* As três plataformas, na ordem em que aparecem na home. */
  plataformas: [
    {
      id: 'summa',
      nome: 'SUMMA',
      versaoDestaque: 'PRO',
      uso: 'Hardtail XC 29',
      peso: '8,47',
      versaoEntrada: 'EX',
      precoEntrada: 'R$ 23.990',
      href: '/bikes/summa',
      render: 'assets/bicicletas-png/bicicleta-summa.png',
      wordmark: 'assets/nomes/nome-summa.png',
      selo: 'assets/nomes/modelo-pro.png',
      alt: 'EDRO SUMMA PRO, hardtail de carbono, vista lateral esquerda'
    },
    {
      id: 'range',
      nome: 'RANGE',
      versaoDestaque: 'PRO',
      uso: 'Full suspension XC · 100 mm',
      peso: '10,23',
      versaoEntrada: 'EX',
      precoEntrada: 'R$ 29.990',
      href: '/bikes/range',
      render: 'assets/bicicletas-png/bicicleta-range.png',
      wordmark: 'assets/nomes/nome-range.png',
      selo: 'assets/nomes/modelo-pro.png',
      alt: 'EDRO RANGE PRO, full suspension de carbono, vista lateral esquerda'
    },
    {
      id: 'impetus',
      nome: 'IMPETUS',
      versaoDestaque: 'PRO',
      uso: 'Road disc',
      peso: '6,67',
      versaoEntrada: 'SSR',
      precoEntrada: 'R$ 32.990',
      href: '/bikes/impetus',
      render: 'assets/bicicletas-png/bicicleta-impetus.png',
      wordmark: 'assets/nomes/nome-impetus.png',
      selo: 'assets/nomes/modelo-pro.png',
      alt: 'EDRO IMPETUS PRO, bicicleta de estrada de carbono, vista lateral esquerda'
    }
  ],

  /* Grade 2x2 do bloco de engenharia. O primeiro é o único verde. */
  engenharia: [
    {
      valor: '6,67',
      unidade: 'kg',
      nota: 'IMPETUS PRO completa, sem pedais.',
      destaque: true
    },
    {
      valor: '46T',
      unidade: '',
      nota: 'Prepreg de alto módulo, 40T e 46T, curado em molde exclusivo EDRO.',
      destaque: false
    },
    {
      valor: 'EPS',
      unidade: '',
      nota: 'Monocoque com núcleo expandido, sem juntas, sem peso morto.',
      destaque: false
    },
    {
      valor: '1',
      unidade: 'por vez',
      nota: 'Cada quadro é laminado, pintado, montado e inspecionado individualmente, com laudo técnico próprio.',
      destaque: false
    }
  ],

  /* Contato. Substituir pelo número real do Nextags antes de publicar. */
  whatsapp: {
    numero: '55DDDNUMERO',
    mensagens: {
      hero:    'Olá, EDRO. Quero montar a minha EDRO sob medida. (origem: site-home)',
      closer:  'Olá, EDRO. Quero montar a minha EDRO sob medida. (origem: site-home-fechamento)',
      nav:     'Olá, EDRO. Quero montar a minha EDRO sob medida. (origem: site-home-nav)',
      barra:   'Olá, EDRO. Quero falar com um especialista EDRO. (origem: site-home-barra)',
      fit4u:   'Olá, EDRO. Quero entender o FIT4U e qual EDRO é a minha. (origem: site-home-fit4u)'
    }
  }
};
