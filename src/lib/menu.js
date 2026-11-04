/* Menu principal (v4), um só para o site e para o personalizador FIT4U (/fit4u/pintura/).
   "linhas" monta o painel com a foto, o tipo, a logo e as versões de cada linha
   ([id, versão da foto]: SUMMA EX azul, RANGE XCR vermelha, IMPETUS PRO verde,
   SUMMA HORIZON EX e RANGE HORIZON PRO); "grupos" monta colunas de links.
   "Home" voltou como primeiro item (v4). */
export const menu = [
  { id: 'home', rotulo: 'Home', href: '/' },
  { id: 'bikes', rotulo: 'Bikes', href: '/bikes', linhas: [['summa', 'ex'], ['range', 'xcr'], ['impetus', 'pro']] },
  { id: 'ebikes', rotulo: 'E-Bikes', href: '/horizon', linhas: [['summa-horizon', 'ex'], ['range-horizon', 'pro']] },
  {
    id: 'monte', rotulo: 'Monte a sua', href: '/fit4u', semRodape: true,
    grupos: [{ links: [['Conheça o FIT4U', '/fit4u'], ['Personalizador', '/fit4u/pintura/']] }],
  },
  {
    id: 'diferenciais', rotulo: 'Diferenciais', href: '/programas',
    grupos: [
      { titulo: 'Diferenciais', links: [
        ['Compra Certa', '/programas#compra-certa'], ['Ciclo EDRO', '/programas#ciclo-edro'],
        ['Carbon Assist', '/programas#carbon-assist'], ['Garantia vitalícia', '/programas#garantia'],
      ] },
      { links: [['Engenharia', '/engenharia'], ['Sobre nós', '/a-marca']] },
    ],
  },
];

export const LOJISTA = { rotulo: 'Quero ser lojista', href: '/parcerias#lojistas' };

/* Logo do cabeçalho (barra preta, v4): só a tipografia EDRO, em branco. */
export const LOGO_MENU = 'brand/logo-edro-texto-branco.png';
