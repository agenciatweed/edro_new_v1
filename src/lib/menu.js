/* Menu principal (v3.3), um só para o site e para o personalizador FIT4U (/fit4u/pintura/).
   "linhas" monta o painel com a foto da PRO, o tipo e as versões de cada linha;
   "grupos" monta colunas de links. A volta à home é pelo logo. */
export const menu = [
  { id: 'bikes', rotulo: 'Bikes', href: '/bikes', linhas: ['summa', 'range', 'impetus'] },
  { id: 'ebikes', rotulo: 'E-Bikes', href: '/horizon', linhas: ['summa-horizon', 'range-horizon'] },
  {
    id: 'monte', rotulo: 'Monte a sua', href: '/fit4u',
    grupos: [{ links: [['Fit for you', '/fit4u'], ['Personalizador', '/fit4u/pintura/']] }],
  },
  {
    id: 'diferenciais', rotulo: 'Diferenciais', href: '/programas',
    grupos: [
      { titulo: 'Diferenciais', links: [
        ['Compra Certa', '/programas#compra-certa'], ['Ciclo EDRO', '/programas#ciclo-edro'],
        ['Carbon Assist', '/programas#carbon-assist'], ['Garantia vitalícia', '/programas#garantia'],
        ['Embaixadores', '/parcerias#embaixadores'], ['Treinadores', '/parcerias#treinadores'],
      ] },
      { links: [['Engenharia', '/engenharia'], ['Sobre nós', '/a-marca']] },
    ],
  },
];

export const LOJISTA = { rotulo: 'Quero ser lojista', href: '/parcerias#lojistas' };

/* Logo do cabeçalho: só a tipografia EDRO, sem o símbolo.
   TODO(EDRO): trocar pelo arquivo oficial escuro sem símbolo; este foi recortado do logo vertical e pintado de tinta EDRO. */
export const LOGO_MENU = 'brand/logo-edro-texto-escuro.png';
