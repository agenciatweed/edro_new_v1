# FIT4U · Personalizador de pintura EDRO
## Guia de integração no novo site (Astro + Vercel)

Versão de 07/10/2026. Responsável pelo conteúdo: Eduardo Cardoso Lima (EDRO).

O personalizador FIT4U é uma página pronta, autônoma (HTML, CSS e JavaScript num arquivo só, mais as imagens), que roda inteira no navegador do cliente. Não há custo por uso, não há chamada a serviço de IA e não precisa de build: é copiar a pasta para `public/`, publicar a função de cadastros e ligar os botões do site.

O cliente escolhe a bicicleta (14 modelos), monta a pintura (cores, degradês, faixas, bicolor, mármore, filete, respingos, cinco acabamentos, cor dos logotipos, assinatura no topo do tubo superior com lupa), vê o resultado em estúdio ou na foto ambientada e gera a imagem em alta (JPG 2752 x 1852) e o projeto em PDF. Para gerar os arquivos ele preenche nome, e-mail, telefone e cidade e autoriza o contato (LGPD). Esse cadastro precisa chegar à EDRO (seção 4).

---

## 1. O que vem no pacote

O pacote já está na mesma estrutura de pastas do repositório do site. Copie o conteúdo de `EDRO_FIT4U_entrega/` para a raiz do projeto.

```
EDRO_FIT4U_entrega/
  public/fit4u/pintura/        o personalizador (vai para https://edrobikes.com.br/fit4u/pintura/)
    index.html                 página completa (não precisa de build)
    bikes/                     84 arquivos .webp: fotos e mapas de pintura das 14 bikes
    lupa/                      vista de cima do tubo superior (lupa da assinatura)
    vendor/jspdf.umd.min.js    biblioteca do PDF (jsPDF 2.5.1, servida localmente)
    logo-edro.png, fit4u-*.png logotipos usados na página, na imagem em alta e no PDF
  api/fit4u-lead.js            função Vercel que recebe os cadastros (seção 4)
  vercel.headers.json          cabeçalhos de cache para mesclar no vercel.json (seção 6)
  src/components/FIT4UEmbed.astro  componente opcional para embutir em iframe (seção 3)
  INTEGRACAO_FIT4U.md          este guia
  PROMPT_CLAUDE_CODE.md        instrução pronta para o Claude Code fazer a integração
```

Tamanho total: cerca de 42 MB. O navegador só baixa as imagens do modelo que o cliente abre (cerca de 3 MB por modelo), então a primeira tela carrega rápido.

O pacote chega em dois arquivos .zip (parte 1 e parte 2 com as elétricas HORIZON, arquivos terminados em `-hz`). Descompacte os dois no mesmo lugar: a parte 2 completa a pasta `public/fit4u/pintura/bikes/`.

**Regras para não quebrar o personalizador**

1. Não renomeie arquivos nem pastas dentro de `public/fit4u/pintura/`. O `index.html` usa caminhos relativos.
2. Não otimize, converta nem recomprima as imagens de `bikes/` e `lupa/`. Os arquivos `_a.webp` e `_b.webp` são mapas de dados (sombreamento, máscara do quadro, logotipos) salvos sem perda; qualquer recompressão estraga a pintura. Arquivos em `public/` não passam pelo pipeline de imagens do Astro, o que é o correto aqui. Não ligue otimização de imagem da Vercel para esse caminho.
3. No `index.html`, altere apenas o bloco `window.FIT4U_CONFIG` (seção 5) e, se quiser, acrescente o código de rastreamento do site no `<head>` (seção 7).

---

## 2. Endereço e rotas

| Endereço | O que é |
|---|---|
| `/fit4u/pintura/` | Personalizador (página inteira, recomendado) |
| `/fit4u/pintura/?modelo=range-xcr` | Abre direto num modelo |
| `/fit4u/pintura/#E3.....` | Abre um projeto salvo (código que o cliente recebe no PDF e que chega no cadastro) |
| `POST /api/fit4u-lead` | Recebe os cadastros |

A página FIT4U do site (`/fit4u`) continua sendo a página institucional do programa; o personalizador fica num caminho abaixo dela e não conflita com a rota do Astro.

**Chaves de modelo para `?modelo=`**

| Linha | PRO | XCR / SSR | EX |
|---|---|---|---|
| *SUMMA* | `summa-pro` | `summa-xcr` | `summa-ex` |
| *RANGE* | `range-pro` | `range-xcr` | `range-ex` |
| *IMPETUS* | `impetus-pro` | `impetus-ssr` | (*IMPETUS* SS ainda não tem foto no personalizador) |
| *SUMMA* HORIZON | `summa-pro-hz` | `summa-xcr-hz` | `summa-ex-hz` |
| *RANGE* HORIZON | `range-pro-hz` | `range-xcr-hz` | `range-ex-hz` |

Na página o cliente alterna entre "Bicicletas" e "Bicicletas elétricas" no topo; o link com `?modelo=` já abre na aba certa.

---

## 3. Como ligar ao site

**Recomendado: página inteira.** Botões e links simples apontando para o personalizador:

- Página FIT4U (`/fit4u`): botão principal "Monte a sua pintura" para `/fit4u/pintura/`.
- Menu (item FIT4U): subitem ou destaque "Monte a sua pintura".
- Página de cada modelo (*SUMMA*, *RANGE*, *IMPETUS*, *SUMMA* HORIZON, *RANGE* HORIZON): botão "Personalize a pintura" com o `?modelo=` da versão que está na tela (ou da PRO, se a página não tiver seletor de versão).
- Home: o banner FIT4U do carrossel pode levar direto para `/fit4u/pintura/`.

A página tem cabeçalho próprio com o logo EDRO (que leva para `/`) e o logo FIT4U. O palco da bike fica fixo ao rolar e ocupa a largura toda no celular, por isso página inteira funciona melhor do que iframe.

**Opcional: dentro de outra página.** Use `src/components/FIT4UEmbed.astro`:

```astro
---
import FIT4UEmbed from "../components/FIT4UEmbed.astro";
---
<FIT4UEmbed modelo="summa-pro-hz" altura="100vh" />
```

O componente já repassa os eventos do personalizador para o `dataLayer` da página que o contém. Imagem em alta e PDF baixam normalmente dentro do iframe.

---

## 4. Cadastros (leads): obrigatório antes de publicar

Cada vez que o cliente gera a imagem em alta ou o PDF, o personalizador envia um `POST` em JSON para `/api/fit4u-lead`:

```json
{
  "origem": "FIT4U site",
  "pagina": "https://edrobikes.com.br/fit4u/pintura/",
  "consentimento_lgpd": true,
  "nome": "Nome do cliente",
  "email": "cliente@exemplo.com",
  "tel": "(48) 99999-0000",
  "cidade": "Tubarão / SC",
  "acao": "PDF do projeto",
  "modelo": "RANGE HORIZON XCR",
  "projeto": "E3.c2002214.0A8A1E....",
  "resumo": "texto completo do projeto: cores, grafismo, filete, respingos, assinatura, observações",
  "quando": "2026-10-07T14:46:31.389Z"
}
```

`acao` é "PDF do projeto" ou "Imagem em alta". O envio é feito em segundo plano (`keepalive`) e não trava o cliente; o download acontece mesmo se o endpoint falhar.

**A função `api/fit4u-lead.js`** (Vercel Function, Node.js) valida os campos, recusa chamadas de outros domínios, não grava dados pessoais nos logs e entrega o cadastro aos destinos configurados por variável de ambiente. O projeto Astro já usa `"type": "module"` no `package.json`, que é o que a função precisa. Se o projeto estiver com o adaptador `@astrojs/vercel` em modo servidor e a pasta `api/` da raiz não for publicada, a mesma lógica pode ir para `src/pages/api/fit4u-lead.ts` como endpoint do Astro (com `export const prerender = false`).

| Variável (Vercel > Settings > Environment Variables) | Para que serve |
|---|---|
| `FIT4U_LEAD_FORWARD_URL` | URL que recebe o cadastro em JSON: CRM Nextags, automação (Make, Zapier, n8n) ou outro sistema da EDRO |
| `FIT4U_LEAD_FORWARD_TOKEN` | Opcional, vai como `Authorization: Bearer` para a URL acima |
| `RESEND_API_KEY` | Opcional, aviso por e-mail via Resend |
| `FIT4U_LEAD_EMAIL_TO` | E-mail(s) da EDRO que recebem o aviso, separados por vírgula |
| `FIT4U_LEAD_EMAIL_FROM` | Remetente verificado na Resend, ex.: `FIT4U <fit4u@edrobikes.com.br>` |
| `FIT4U_ALLOWED_ORIGINS` | Opcional. Padrão: `https://edrobikes.com.br,https://www.edrobikes.com.br` (pré-visualizações `*.vercel.app` também são aceitas) |

Configure pelo menos um destino. Sem destino a função responde 503 e o cadastro se perde.

**Ponto a decidir com a EDRO:** para onde vão os cadastros. O CRM da EDRO é a Nextags (endpoint e token a confirmar com o suporte da Nextags). Enquanto isso, o aviso por e-mail resolve: cada cadastro chega com os dados do cliente, o resumo do projeto e o link que reabre a pintura no personalizador.

Respostas da função: `200` entregue, `403` domínio não autorizado, `405` método errado, `422` dados inválidos ou sem consentimento, `502` todos os destinos falharam, `503` nenhum destino configurado.

---

## 5. Configuração no `index.html`

No início do `public/fit4u/pintura/index.html`:

```html
<script>
window.FIT4U_CONFIG={ leadWebhook:"/api/fit4u-lead", onEvent:null };
</script>
```

- `leadWebhook`: já aponta para a função do pacote. Só mude se os cadastros forem para outro endereço (outro domínio exige CORS liberado para `https://edrobikes.com.br`).
- `onEvent`: opcional, função `(nome, dados)` chamada a cada evento (seção 7).

Outras constantes que podem mudar no futuro, dentro do `index.html`: `WA_NUM` (WhatsApp comercial que recebe "Enviar projeto à EDRO", hoje 5548991102017).

---

## 6. Cache e desempenho

Mescle o conteúdo de `vercel.headers.json` no `vercel.json` do projeto (chave `headers`):

- `bikes/` e `lupa/`: 7 dias com revalidação em segundo plano.
- `vendor/`: 30 dias.
- `index.html`: 5 minutos, para atualizações entrarem rápido.

Se a EDRO trocar as fotos de uma bike, os arquivos novos substituem os antigos com o mesmo nome; o cache de 7 dias garante que todos recebam a versão nova em no máximo uma semana. Para troca imediata, faça purge do cache na Vercel.

Dependências externas: só as fontes do Google Fonts (Saira Condensed, Barlow e Yellowtail). Se o site já carrega fontes por conta própria, pode manter assim; o personalizador funciona com as fontes de reserva se o Google Fonts falhar.

---

## 7. Eventos para análise (GA4, GTM, Meta Pixel)

O personalizador não carrega nenhum código de rastreamento. Ele publica eventos sem dados pessoais em três lugares ao mesmo tempo:

1. `window.dataLayer.push({ event: "fit4u_<nome>", ...dados })`
2. `window.FIT4U_CONFIG.onEvent(nome, dados)`, se definido
3. `window.parent.postMessage({ fonte: "fit4u", evento, dados }, "*")`, quando está dentro de iframe

| Evento | Quando | Dados |
|---|---|---|
| `modelo` | Cada bike carregada (inclusive a primeira) | `modelo` ("RANGE HORIZON XCR"), `eletrica` (true/false), `ambiente` |
| `lead` | Cliente gerou imagem em alta ou PDF | `acao`, `modelo`, `projeto` |
| `whatsapp` | Clique em "Enviar projeto à EDRO" ou no projeto feito à mão | `tipo` ("projeto" ou "projeto_a_mao"), `modelo`, `projeto` |

Para o site, o caminho mais simples é colar no `<head>` do `index.html` o mesmo snippet do GTM (ou GA4/Pixel) usado nas outras páginas, respeitando o banner de cookies do site, e mapear no GTM:

- `fit4u_lead` para o evento **Lead** do Meta Pixel e para uma conversão do GA4 (`generate_lead`).
- `fit4u_modelo` para **ViewContent** (com o nome do modelo).
- `fit4u_whatsapp` para um evento de contato.

Se preferir sem GTM, defina `onEvent` no bloco de configuração:

```html
<script>
window.FIT4U_CONFIG={ leadWebhook:"/api/fit4u-lead", onEvent:(n,d)=>{
  if(window.fbq){ if(n==="lead") fbq("track","Lead",{content_name:d.modelo}); if(n==="modelo") fbq("track","ViewContent",{content_name:d.modelo}); }
  if(window.gtag && n==="lead") gtag("event","generate_lead",{item_name:d.modelo});
}};
</script>
```

Use só um dos dois caminhos (GTM ou `onEvent`) para não contar o mesmo lead duas vezes.

---

## 8. SEO e compartilhamento

O `index.html` já tem `title`, `description`, `canonical` (`https://edrobikes.com.br/fit4u/pintura/`) e Open Graph com imagem absoluta. Inclua `/fit4u/pintura/` no sitemap. A página é uma ferramenta (canvas), então o conteúdo para ranqueamento deve ficar na página institucional `/fit4u`, que linka para o personalizador.

---

## 9. LGPD

- O cliente só gera os arquivos depois de marcar a autorização de contato.
- Os dados dele ficam salvos apenas no navegador do próprio cliente (`localStorage` com a chave `fit4u-lead`) para preencher o formulário na próxima vez.
- A função não grava dados pessoais nos logs; eles seguem só para os destinos configurados.
- Recomendado: link da Política de Privacidade do site no rodapé ou no texto da autorização.

---

## 10. Testes antes de publicar

- [ ] Abrir `/fit4u/pintura/` no computador e no celular.
- [ ] Em "Bicicletas", trocar *SUMMA*, *RANGE* e *IMPETUS* e as versões.
- [ ] Em "Bicicletas elétricas", trocar *SUMMA* HORIZON e *RANGE* HORIZON (EX, XCR, PRO). A carenagem da bateria deve sair na cor do quadro; motor e pedivela ficam pretos.
- [ ] Alternar ambiente: estúdio escuro, estúdio claro e foto no local.
- [ ] Aplicar duas ou três inspirações e abrir a lupa ("Ver de perto") com um nome no topo do tubo superior.
- [ ] Gerar a imagem em alta (JPG 2752 x 1852) e o projeto em PDF (1 página A4).
- [ ] Confirmar que os dois cadastros chegaram ao destino (e-mail ou CRM) e que o link do e-mail reabre a pintura.
- [ ] Clicar em "Enviar projeto à EDRO" e conferir a mensagem no WhatsApp.
- [ ] Testar `/fit4u/pintura/?modelo=range-xcr-hz` e um código de projeto no endereço (`#E3...`).
- [ ] No GTM (modo de visualização) ou no Pixel Helper, ver `fit4u_modelo`, `fit4u_lead` e `fit4u_whatsapp`.
- [ ] Lighthouse no celular: a primeira bike deve aparecer em poucos segundos numa conexão 4G.

---

## 11. Arquivos para ver no computador sem servidor

Separados do pacote do site, a EDRO tem `FIT4U_EDRO_bicicletas.html` e `FIT4U_EDRO_bicicletas_eletricas.html`, com as imagens embutidas, que abrem com dois cliques. Servem para apresentação e conferência; no site use sempre a pasta `public/fit4u/pintura/`. A pasta do site, aberta direto do disco (`file://`), não carrega as fotos por segurança do navegador; para testar localmente rode `npx serve public` ou `python3 -m http.server` dentro de `public/` e acesse `http://localhost:3000/fit4u/pintura/` (ou a porta indicada).

---

## 12. Atualizações futuras

As atualizações do personalizador (novas bikes, cores ou ajustes) chegam como uma nova pasta `public/fit4u/pintura/` completa. Substitua a pasta inteira, sem misturar arquivos de versões diferentes, e faça o deploy. A função e a configuração do `vercel.json` continuam valendo.

Dúvidas sobre o personalizador: Eduardo Cardoso Lima, EDRO Performance Bikes.
