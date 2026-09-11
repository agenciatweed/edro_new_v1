/* =============================================================
   Avalia uma expressao JavaScript numa pagina real, headless.

   Existe porque a pane do navegador, quando oculta, congela o
   requestAnimationFrame e nao entrega IntersectionObserver: codigo
   correto le como morto. Aqui o rAF roda e o IO dispara.

   Uso:
     node scripts/probe.mjs <url> <arquivo-com-expressao.js> [largura] [altura]

   A expressao pode usar await no topo. O valor devolvido e impresso
   como JSON.
   ============================================================= */

import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const [url, arquivoExpr, largArg, altArg] = process.argv.slice(2);
if (!url || !arquivoExpr) {
  console.error('uso: node scripts/probe.mjs <url> <arquivo.js> [largura] [altura]');
  process.exit(2);
}

const largura = Number(largArg || 1440);
const altura = Number(altArg || 900);
const expr = readFileSync(arquivoExpr, 'utf8');

const PORTA = 9500 + Math.floor(Math.random() * 250);
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

const cdp = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++idSeq;
  pendentes.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});

const encerrar = (c) => {
  try { ws?.close(); } catch {}
  try { chrome.kill(); } catch {}
  process.exit(c);
};

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
    width: largura, height: altura, deviceScaleFactor: 1, mobile: largura < 768,
  });
  await cdp('Page.navigate', { url });
  await espera(2800);

  const { result, exceptionDetails } = await cdp('Runtime.evaluate', {
    expression: `(async () => { ${expr} })()`,
    awaitPromise: true,
    returnByValue: true,
  });

  if (exceptionDetails) {
    console.error('ERRO NA EXPRESSAO:', exceptionDetails.exception?.description || exceptionDetails.text);
    encerrar(1);
  }

  console.log(JSON.stringify(result.value, null, 2));
  encerrar(0);
} catch (e) {
  console.error('ERRO:', e.message);
  encerrar(1);
}
