/* =============================================================
   EDRO · Comportamento da home
   =============================================================
   Progressive enhancement. Sem JavaScript a página continua
   legível: todo conteúdo está no HTML e nada é escondido por
   padrão. Este arquivo liga os números ao arquivo de dados,
   monta os cards, abre o menu e orquestra a entrada.
   ============================================================= */

(function () {
  'use strict';

  var D = window.EDRO_DATA;
  if (!D) { return; }

  var reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var podeAnimar = 'IntersectionObserver' in window && !reduzirMovimento;

  /* ---------------------------------------------------------
     Utilidades
     --------------------------------------------------------- */

  function caminho(obj, chave) {
    return chave.split('.').reduce(function (acc, parte) {
      return (acc === null || acc === undefined) ? acc : acc[parte];
    }, obj);
  }

  function linkWhatsapp(chaveMensagem) {
    var msg = D.whatsapp.mensagens[chaveMensagem] || D.whatsapp.mensagens.hero;
    return 'https://wa.me/' + D.whatsapp.numero + '?text=' + encodeURIComponent(msg);
  }

  function evento(nome, params) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: nome }, params || {}));
  }

  /* ---------------------------------------------------------
     1 · Slots de dados
     O arquivo de dados é a fonte da verdade. O HTML carrega o
     valor como fallback para SEO e para quem navega sem JS.
     Divergência entre os dois é avisada no console.
     --------------------------------------------------------- */

  function preencherSlots() {
    var slots = document.querySelectorAll('[data-edro]');

    Array.prototype.forEach.call(slots, function (el) {
      var chave = el.getAttribute('data-edro');
      var valor = caminho(D, chave);
      if (valor === undefined || valor === null) { return; }

      valor = String(valor);
      var atual = el.textContent.trim();

      if (atual && atual !== valor.trim()) {
        console.warn(
          '[EDRO] Divergência de dados em "' + chave + '". ' +
          'HTML: "' + atual + '". Arquivo de dados: "' + valor.trim() + '". ' +
          'O arquivo de dados prevaleceu.'
        );
      }
      el.textContent = valor;
    });
  }

  /* ---------------------------------------------------------
     2 · Cards das plataformas
     Peso e preço nunca são digitados no componente.
     --------------------------------------------------------- */

  var SETA =
    '<svg class="seta" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function montarPlataformas() {
    var alvo = document.getElementById('grade-plataformas');
    if (!alvo) { return; }

    var html = D.plataformas.map(function (p) {
      return '' +
        '<article class="card-plataforma">' +
          '<a class="card-plataforma__link" href="' + p.href + '" ' +
             'aria-label="' + p.nome + ' ' + p.versaoDestaque + ', ver plataforma">' +
            '<p class="eyebrow">' + p.uso + '</p>' +
            '<p class="card-plataforma__nome">' +
              '<img class="card-plataforma__wordmark" src="' + p.wordmark + '" alt="' + p.nome + '" height="22">' +
              '<img class="card-plataforma__selo" src="' + p.selo + '" alt="' + p.versaoDestaque + '" height="15">' +
            '</p>' +
          '</a>' +
          '<img class="card-plataforma__render" src="' + p.render + '" alt="' + p.alt + '" ' +
               'width="1400" height="900" loading="lazy" decoding="async">' +
          '<div class="card-plataforma__rodape">' +
            '<div class="card-plataforma__bloco">' +
              '<p class="metric-stat">' + p.peso + '<span class="unidade"> kg</span></p>' +
              '<span class="micro card-plataforma__rotulo">versão ' + p.versaoDestaque + '</span>' +
            '</div>' +
            '<div class="card-plataforma__bloco">' +
              '<p class="card-plataforma__preco">' + p.precoEntrada + '</p>' +
              '<span class="micro card-plataforma__rotulo">a partir de, versão ' + p.versaoEntrada + '</span>' +
            '</div>' +
            SETA +
          '</div>' +
        '</article>';
    }).join('');

    alvo.innerHTML = html;
  }

  /* ---------------------------------------------------------
     3 · Grade de engenharia · o primeiro bloco é o único verde
     --------------------------------------------------------- */

  function montarEngenharia() {
    var alvo = document.getElementById('grade-engenharia');
    if (!alvo) { return; }

    alvo.innerHTML = D.engenharia.map(function (e) {
      var unidade = e.unidade ? '<span class="unidade"> ' + e.unidade + '</span>' : '';
      return '' +
        '<div class="stat' + (e.destaque ? ' stat--destaque' : '') + '">' +
          '<p class="metric-stat">' + e.valor + unidade + '</p>' +
          '<p class="stat__nota">' + e.nota + '</p>' +
        '</div>';
    }).join('');
  }

  /* ---------------------------------------------------------
     4 · WhatsApp · nenhum botão sem mensagem e sem origem
     --------------------------------------------------------- */

  function ligarWhatsapp() {
    var botoes = document.querySelectorAll('[data-wa]');

    Array.prototype.forEach.call(botoes, function (el) {
      var origem = el.getAttribute('data-wa');
      el.setAttribute('href', linkWhatsapp(origem));
      el.setAttribute('rel', 'noopener');

      el.addEventListener('click', function () {
        evento('whatsapp_click', {
          origem: origem,
          pagina: 'home',
          plataforma: '',
          versao: '',
          posicao: origem
        });
      });
    });
  }

  /* ---------------------------------------------------------
     5 · Menu mobile
     --------------------------------------------------------- */

  function ligarMenu() {
    var botao = document.querySelector('.nav__hamburguer');
    var painel = document.getElementById('menu-mobile');
    if (!botao || !painel) { return; }

    function fechar() {
      botao.setAttribute('aria-expanded', 'false');
      botao.setAttribute('aria-label', 'Abrir menu');
      painel.hidden = true;
      document.body.style.overflow = '';
    }

    function abrir() {
      botao.setAttribute('aria-expanded', 'true');
      botao.setAttribute('aria-label', 'Fechar menu');
      painel.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    botao.addEventListener('click', function () {
      if (botao.getAttribute('aria-expanded') === 'true') { fechar(); } else { abrir(); }
    });

    painel.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { fechar(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
        fechar();
        botao.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && botao.getAttribute('aria-expanded') === 'true') { fechar(); }
    });
  }

  /* ---------------------------------------------------------
     6 · Entrada · uma vez por elemento, nunca em cascata longa
     --------------------------------------------------------- */

  function ligarEntrada() {
    if (!podeAnimar) { return; }

    document.documentElement.classList.add('js-anim');

    var bike = document.querySelector('.hero__bike');
    if (bike) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { bike.classList.add('visivel'); });
      });
    }

    var alvos = document.querySelectorAll(
      '.secao .cabecalho, .secao .caixa, .card-plataforma, .stat, ' +
      '.passo, .card-programa, .tile, .manifesto__interno > *, .fechamento__interno > *'
    );

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visivel');
          obs.unobserve(entrada.target);
        }
      });
    }, { threshold: .2, rootMargin: '0px 0px -5% 0px' });

    Array.prototype.forEach.call(alvos, function (el) {
      el.classList.add('revelar');
      obs.observe(el);
    });
  }

  /* ---------------------------------------------------------
     7 · Item ativo do menu
     --------------------------------------------------------- */

  function ligarMenuAtivo() {
    if (!('IntersectionObserver' in window)) { return; }

    var links = document.querySelectorAll('.nav__link');
    if (!links.length) { return; }

    var mapa = {};
    Array.prototype.forEach.call(links, function (l) {
      var id = l.getAttribute('href').replace('#', '');
      if (id) { mapa[id] = l; }
    });

    var secoes = Object.keys(mapa)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        var link = mapa[entrada.target.id];
        if (!link) { return; }
        if (entrada.isIntersecting) {
          Array.prototype.forEach.call(links, function (l) { l.classList.remove('ativo'); });
          link.classList.add('ativo');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    secoes.forEach(function (s) { obs.observe(s); });
  }

  /* ---------------------------------------------------------
     Início
     --------------------------------------------------------- */

  function iniciar() {
    montarPlataformas();
    montarEngenharia();
    preencherSlots();
    ligarWhatsapp();
    ligarMenu();
    ligarEntrada();
    ligarMenuAtivo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

})();
