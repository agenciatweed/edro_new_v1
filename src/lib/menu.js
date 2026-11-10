import { wa } from './edro.js';

/* Menu principal (v4), um só para o site e para o personalizador FIT4U (/fit4u/pintura/).
   "linhas" monta o painel com a foto, o tipo, a logo e as versões de cada linha
   ([id, versão da foto]: SUMMA EX azul, RANGE XCR vermelha, IMPETUS PRO verde,
   SUMMA HORIZON EX e RANGE HORIZON PRO); "grupos" monta colunas de links.
   Ajuste 3: sem o item "Home" (a home é pelo logo). */
export const menu = [
  { id: 'bikes', rotulo: 'Bikes', href: '/bikes', linhas: [['summa', 'ex'], ['range', 'xcr'], ['impetus', 'pro']] },
  {
    id: 'ebikes', rotulo: 'E-Bikes', href: '/horizon', linhas: [['summa-horizon', 'ex'], ['range-horizon', 'pro']],
    /* Ajuste 5: o Kit HORIZON entra no painel de E-Bikes, depois das duas linhas. */
    extra: { foto: 'kit-horizon/kit-horizon-range.png', texto: 'Kit conversão EDRO SUMMA e RANGE para pedal assistido', logo: 'brand/kit-horizon-logo.png', href: '/horizon/kit-horizon', nome: 'Kit HORIZON' },
  },
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

/* Ajuste 3: a página Parcerias saiu; quem quer ser lojista fala direto com o comercial. */
export const LOJISTA = { rotulo: 'Quero ser lojista', href: wa('Olá, EDRO. Quero ser lojista EDRO. (origem: site-menu-lojista)') };

/* Logo do cabeçalho (barra preta, v4): só a tipografia EDRO, em branco. */
export const LOGO_MENU = 'brand/logo-edro-texto-branco.png';
