/* =============================================================
   EDRO · Registro de imagens
   Toda imagem do site passa por aqui, para o astro:assets gerar
   AVIF e WebP com srcset. O caminho e relativo a src/assets.
   Caminho inexistente derruba o build: imagem quebrada nao vai ao ar.
   ============================================================= */

const todas = import.meta.glob('../assets/**/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });

export function img(caminho) {
  const achada = todas[`../assets/${caminho}`];
  if (!achada) throw new Error(`[imagens] não encontrei src/assets/${caminho}`);
  return achada;
}

/* Vídeos do YouTube do acervo da LP (lps.edrobikes.com.br) e do site atual.
   A miniatura é baixada para src/assets/youtube: nada do YouTube carrega antes do clique. */
export const videos = {
  porque: { id: 'diGUPCftsX4', titulo: 'EDRO Bikes. Alta performance sem limites de terreno!' },
  leve: { id: 'bmjdG2NrmyE', titulo: 'O quadro mais leve e resistente do mercado' },
  sensacao: { id: 'zciw7e-pcR0', titulo: 'A sensação indescritível de andar com uma EDRO' },
  review: { id: 'GcsUWDhHNkk', titulo: 'Review do atleta Matheus Miranda sobre a nova SUMMA' },
  impetus: { id: 'PYVEcbt5cyE', titulo: 'IMPETUS, a única bicicleta de estrada que você vai precisar' },
  range: { id: 'o0wQDjuSDzg', titulo: 'RANGE, uma MTB full suspension pensada para transformar terreno difícil em desempenho real' },
  fit4u: { id: 'KssFIxkqNKQ', titulo: 'FIT4U' },
  historia: { id: 't8TfIDeYgBo', titulo: 'Conheça nossa história' },
};
