/* Menu principal, um só para o site e para o personalizador FIT4U (/fit4u/pintura/). */
export const menu = [
  { rotulo: 'Home',            href: '/' },
  { rotulo: 'Bikes',           href: '/bikes' },
  { rotulo: 'Bikes elétricas', href: '/horizon' },
  { rotulo: 'FIT4U',           href: '/fit4u', sub: [{ rotulo: 'Monte a sua pintura', href: '/fit4u/pintura/' }] },
  { rotulo: 'Programas',       href: '/programas' },
  { rotulo: 'Engenharia',      href: '/engenharia' },
  { rotulo: 'Parcerias',       href: '/parcerias' },
  { rotulo: 'A marca',         href: '/a-marca' },
];

/* Logo do menu: símbolo sobre o nome EDRO. */
export const LOGO_MENU = 'brand/logo-menu-branco.png';
