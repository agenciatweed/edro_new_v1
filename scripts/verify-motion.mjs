/* =============================================================
   Verifica as duas batidas de movimento do capitulo 12.7 num
   contexto onde requestAnimationFrame realmente roda.

   A pane do navegador, quando oculta, congela o rAF e nao dispara
   IntersectionObserver, o que faz uma animacao correta parecer
   morta. Headless via CDP nao tem esse problema.

   Uso: node scripts/verify-motion.mjs [url]
   ============================================================= */

import { spawn } from 'node:child_process';

const url = process.argv[2] || 'http://localhost:4321/';
const PORTA = 9800 + Math.floor(Math.random() * 300);
const CHROME = process.env.CHROME_BIN
  || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${PORTA}`, 'about:blank',
], { stdio: 'ignore' });

let ws, idSeq = 0;
const pendentes = new Map();

function cdp(method, params = {}) {
  const id = ++idSeq;
  return new Promise((resolve, reject) => {
    pendentes.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function avaliar(expr, awaitPromise = true) {
  const { result } = await cdp('Runtime.evaluate', {
    expression: expr, awaitPromise, returnByValue: true,
  });
  return result.value;
}

function encerrar(c) {
  try { ws?.close(); } catch {}
  try { chrome.kill(); } catch {}
  process.exit(c);
}

try {
  let wsUrl;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try {
      const abas = await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json();
      wsUrl = abas.find((a) => a.type === 'page')?.webSocketDebuggerUrl;
    } catch {}
    if (!wsUrl) await espera(250);
  }
  if (!wsUrl) throw new Error('CDP nao respondeu');

  ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res, { once: true });
    ws.addEventListener('error', rej, { once: true });
  });
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pendentes.has(m.id)) {
      const { resolve, reject } = pendentes.get(m.id);
      pendentes.delete(m.id);
      m.error ? reject(new Error(m.error.message)) : resolve(m.result);
    }
  });

  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
  });
  // Sem emular movimento reduzido: queremos ver a animacao acontecer.
  await cdp('Page.navigate', { url });
  await espera(3000);

  const contagem = await avaliar(`(async () => {
    const ler = () => [...document.querySelectorAll('.stat__valor')].map(e => e.textContent).join(' | ');
    const antes = ler();
    document.querySelector('.engenharia__grade').scrollIntoView({ block: 'center' });
    const amostras = [];
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 120));
      amostras.push(ler());
    }
    return JSON.stringify({ antes, amostras });
  })()`);

  const passos = await avaliar(`(async () => {
    const ler = () => [...document.querySelectorAll('.passo__num')]
      .map(e => e.classList.contains('aceso') ? 'X' : '.').join('');
    document.querySelector('.passos').scrollIntoView({ block: 'center' });
    const amostras = [];
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 90));
      amostras.push(ler());
    }
    return JSON.stringify({ amostras });
  })()`);

  const c = JSON.parse(contagem);
  const p = JSON.parse(passos);

  console.log('CONTAGEM (12.7, 0 ao valor, 800 ms)');
  console.log('  antes do scroll:', c.antes);
  c.amostras.forEach((a, i) => console.log(`  t=${(i + 1) * 120}ms:`.padEnd(12), a));
  const contou = c.amostras.some((a) => a !== c.antes);
  console.log('  VEREDITO:', contou ? 'contagem observada' : 'NENHUMA MUDANCA');

  console.log('');
  console.log('PASSOS (12.7, acendem em sequencia, 100 ms cada)');
  p.amostras.forEach((a, i) => console.log(`  t=${(i + 1) * 90}ms:`.padEnd(12), a));
  const acendeu = p.amostras.at(-1) === 'XXXX' && p.amostras[0] !== 'XXXX';
  console.log('  VEREDITO:', acendeu ? 'sequencia observada' : (p.amostras.at(-1) === 'XXXX' ? 'todos acesos, sequencia rapida demais para amostrar' : 'NAO ACENDERAM'));

  encerrar(contou && p.amostras.at(-1) === 'XXXX' ? 0 : 1);
} catch (e) {
  console.error('ERRO:', e.message);
  encerrar(1);
}
