/* =============================================================
   Captura de tela com emulacao de dispositivo real, via CDP.

   O Chrome headless no Windows nao respeita --window-size abaixo
   da largura minima de janela do sistema: ele diagrama a pagina
   larga e recorta a imagem, o que produz uma captura invalida.
   Emulation.setDeviceMetricsOverride define o viewport de layout
   de verdade, entao o clamp nao acontece.

   Uso:
     node scripts/shot.mjs <url> <saida.png> <largura> [altura]

   O script so grava o arquivo depois de conferir que
   document.documentElement.clientWidth bate com a largura pedida.
   ============================================================= */

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const [url, saida, larguraArg, alturaArg] = process.argv.slice(2);
if (!url || !saida || !larguraArg) {
  console.error('uso: node scripts/shot.mjs <url> <saida.png> <largura> [altura]');
  process.exit(2);
}

const largura = Number(larguraArg);
const altura = Number(alturaArg || 900);
const ehMobile = largura < 768;
const PORTA = 9222 + Math.floor(Math.random() * 500);

const CHROME = process.env.CHROME_BIN
  || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  `--remote-debugging-port=${PORTA}`,
  'about:blank',
], { stdio: 'ignore' });

let ws;
let idSeq = 0;
const pendentes = new Map();
const ouvintes = new Map();

function cdp(method, params = {}) {
  const id = ++idSeq;
  return new Promise((resolve, reject) => {
    pendentes.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

function aoEvento(nome) {
  return new Promise((resolve) => {
    if (!ouvintes.has(nome)) ouvintes.set(nome, []);
    ouvintes.get(nome).push(resolve);
  });
}

async function alvo() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORTA}/json/list`);
      const abas = await r.json();
      const p = abas.find((a) => a.type === 'page');
      if (p?.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch {}
    await espera(250);
  }
  throw new Error('CDP nao respondeu');
}

function encerrar(codigo) {
  try { ws?.close(); } catch {}
  try { chrome.kill(); } catch {}
  process.exit(codigo);
}

try {
  const wsUrl = await alvo();

  ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pendentes.has(msg.id)) {
      const { resolve, reject } = pendentes.get(msg.id);
      pendentes.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      return;
    }
    if (msg.method && ouvintes.has(msg.method)) {
      ouvintes.get(msg.method).splice(0).forEach((fn) => fn(msg.params));
    }
  });

  await cdp('Page.enable');
  await cdp('Runtime.enable');

  // O viewport de layout de verdade. E isto que o --window-size nao faz.
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: largura,
    height: altura,
    deviceScaleFactor: 1,
    mobile: ehMobile,
    screenWidth: largura,
    screenHeight: altura,
  });

  // Nenhum elemento pode ficar escondido por animacao de entrada.
  await cdp('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });

  const carregou = aoEvento('Page.loadEventFired');
  await cdp('Page.navigate', { url });
  await Promise.race([carregou, espera(30000)]);
  await espera(2500);

  // Confere o viewport antes de gravar qualquer coisa.
  const { result: medida } = await cdp('Runtime.evaluate', {
    expression: `JSON.stringify({
      cw: document.documentElement.clientWidth,
      sw: document.documentElement.scrollWidth,
      sh: document.documentElement.scrollHeight,
      h1: (() => { const e = document.querySelector('h1'); return e ? Math.round(parseFloat(getComputedStyle(e).fontSize)) : null; })(),
      main: !!document.querySelector('main')
    })`,
    returnByValue: true,
  });
  const m = JSON.parse(medida.value);

  if (m.cw !== largura) {
    console.error(`FALHOU: viewport de layout ${m.cw}px, esperado ${largura}px. Nada foi gravado.`);
    encerrar(1);
  }

  // Servidor fora do ar vira pagina de erro do Chrome, sem imagem nenhuma,
  // e passaria pelas outras conferencias. Toda pagina do site tem <main>.
  if (!m.main) {
    console.error(`FALHOU: ${url} nao tem <main> (servidor fora do ar ou pagina errada). Nada foi gravado.`);
    encerrar(1);
  }

  // Com captureBeyondViewport a pagina nunca rola, entao nenhuma
  // imagem com loading="lazy" entra no viewport de carregamento e
  // todas saem em branco abaixo da dobra. Forca o carregamento e
  // espera a decodificacao antes de capturar.
  const { result: imagens } = await cdp('Runtime.evaluate', {
    expression: `(async () => {
      document.querySelectorAll('img').forEach((i) => {
        i.loading = 'eager';
        i.removeAttribute('decoding');
      });
      await new Promise((r) => setTimeout(r, 400));
      await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
      const vazias = [...document.images]
        .filter((i) => i.naturalWidth === 0)
        .map((i) => i.currentSrc || i.getAttribute('src') || ('[alt] ' + i.alt) || '(sem src)');
      return JSON.stringify({ total: document.images.length, vazias });
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  const img = JSON.parse(imagens.value);

  // Uma imagem em branco e evidencia invalida. Melhor falhar alto.
  if (img.vazias.length) {
    console.error(`FALHOU: ${img.vazias.length} de ${img.total} imagens nao carregaram. Nada foi gravado.`);
    img.vazias.slice(0, 12).forEach((s) => console.error('   vazia:', s));
    encerrar(1);
  }

  await espera(600);

  const { data } = await cdp('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    optimizeForSpeed: false,
  });

  mkdirSync(dirname(saida), { recursive: true });
  writeFileSync(saida, Buffer.from(data, 'base64'));

  console.log(JSON.stringify({
    ok: true,
    arquivo: saida,
    viewportConferido: m.cw,
    scrollWidth: m.sw,
    alturaDocumento: m.sh,
    h1FontSize: m.h1,
    imagensCarregadas: img.total,
    imagensVazias: img.vazias.length,
  }, null, 2));

  encerrar(0);
} catch (e) {
  console.error('ERRO:', e.message);
  encerrar(1);
}
