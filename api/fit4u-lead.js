/*
 * FIT4U · recebe os cadastros do personalizador de pintura EDRO
 * Vercel Function (Node.js). Caminho no projeto: /api/fit4u-lead.js  ->  POST https://edrobikes.com.br/api/fit4u-lead
 *
 * O personalizador (public/fit4u/pintura/index.html) envia um JSON por cadastro, no mesmo domínio (sem CORS).
 * Esta função valida, limpa os campos e repassa o cadastro para os destinos configurados nas variáveis de ambiente:
 *
 *   FIT4U_LEAD_FORWARD_URL    (opcional) URL que recebe o cadastro como JSON via POST: CRM Nextags, automação
 *                             (Make, Zapier, n8n), o servidor do SDR da EDRO ou outro endpoint da EDRO.
 *   FIT4U_LEAD_FORWARD_TOKEN  (opcional) enviado como "Authorization: Bearer <token>" para a URL acima.
 *   RESEND_API_KEY            (opcional) chave da Resend (resend.com) para avisar a equipe por e-mail.
 *   FIT4U_LEAD_EMAIL_TO       (opcional) e-mail(s) da EDRO que recebem o aviso, separados por vírgula.
 *   FIT4U_LEAD_EMAIL_FROM     (opcional) remetente verificado na Resend, ex.: "FIT4U <fit4u@edrobikes.com.br>".
 *   FIT4U_ALLOWED_ORIGINS     (opcional) domínios aceitos, separados por vírgula. Padrão: edrobikes.com.br e www.
 *
 * Configure pelo menos um destino (URL ou e-mail). Sem destino, a função responde 503 e o cadastro se perde.
 * Dados pessoais (nome, e-mail, telefone, cidade) não vão para os logs (LGPD).
 */

const ORIGENS_PADRAO = ["https://edrobikes.com.br", "https://www.edrobikes.com.br"];
const SITE = "https://edrobikes.com.br/fit4u/pintura/";

const txt = (v, max = 300) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "");
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }

  // só aceita chamadas do próprio site (ou dos domínios de pré-visualização listados)
  const permitidos = (process.env.FIT4U_ALLOWED_ORIGINS || ORIGENS_PADRAO.join(","))
    .split(",").map((s) => s.trim()).filter(Boolean);
  const origem = req.headers.origin || "";
  if (origem && !permitidos.includes(origem) && !/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origem)) {
    return res.status(403).json({ ok: false });
  }

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { return res.status(400).json({ ok: false }); } }
  if (!b || typeof b !== "object") return res.status(400).json({ ok: false });

  const lead = {
    origem: txt(b.origem, 60) || "FIT4U site",
    pagina: txt(b.pagina, 400),
    consentimento_lgpd: b.consentimento_lgpd === true,
    nome: txt(b.nome, 120),
    email: txt(b.email, 160).toLowerCase(),
    tel: txt(b.tel, 40),
    cidade: txt(b.cidade, 120),
    acao: txt(b.acao, 40),
    modelo: txt(b.modelo, 60),
    projeto: txt(b.projeto, 600),
    resumo: txt(b.resumo, 3000),
    quando: txt(b.quando, 40),
    recebido_em: new Date().toISOString(),
  };
  lead.link_projeto = lead.projeto ? `${SITE}#${encodeURIComponent(lead.projeto)}` : SITE;

  if (!lead.consentimento_lgpd || !lead.nome || !(lead.email || lead.tel) || (lead.email && !emailOk(lead.email))) {
    return res.status(422).json({ ok: false });
  }

  const tarefas = [];

  if (process.env.FIT4U_LEAD_FORWARD_URL) {
    const headers = { "Content-Type": "application/json" };
    if (process.env.FIT4U_LEAD_FORWARD_TOKEN) headers.Authorization = `Bearer ${process.env.FIT4U_LEAD_FORWARD_TOKEN}`;
    tarefas.push(
      fetch(process.env.FIT4U_LEAD_FORWARD_URL, { method: "POST", headers, body: JSON.stringify(lead), signal: AbortSignal.timeout(8000) })
        .then((r) => { if (!r.ok) throw new Error("destino " + r.status); })
    );
  }

  if (process.env.RESEND_API_KEY && process.env.FIT4U_LEAD_EMAIL_TO) {
    const linhas = [
      ["Nome", lead.nome], ["E-mail", lead.email], ["Telefone", lead.tel], ["Cidade", lead.cidade],
      ["Pediu", lead.acao], ["Modelo", lead.modelo], ["Código do projeto", lead.projeto],
    ];
    const html = `<h2 style="font-family:Arial">Novo cadastro no personalizador FIT4U</h2>
<table style="font-family:Arial;font-size:14px;border-collapse:collapse">${linhas.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#555">${k}</td><td style="padding:4px 0"><b>${esc(v || "-")}</b></td></tr>`).join("")}</table>
<p style="font-family:Arial;font-size:14px"><a href="${esc(lead.link_projeto)}">Abrir o projeto no personalizador</a></p>
<pre style="font-family:Arial;font-size:13px;white-space:pre-wrap;background:#f4f5f2;padding:12px">${esc(lead.resumo)}</pre>
<p style="font-family:Arial;font-size:12px;color:#777">Cliente autorizou o contato (LGPD) em ${esc(lead.quando || lead.recebido_em)}.</p>`;
    tarefas.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.FIT4U_LEAD_EMAIL_FROM || "FIT4U <onboarding@resend.dev>",
          to: process.env.FIT4U_LEAD_EMAIL_TO.split(",").map((s) => s.trim()).filter(Boolean),
          reply_to: lead.email || undefined,
          subject: `FIT4U: ${lead.nome} · ${lead.modelo} · ${lead.acao}`,
          html,
        }),
        signal: AbortSignal.timeout(8000),
      }).then((r) => { if (!r.ok) throw new Error("email " + r.status); })
    );
  }

  if (!tarefas.length) {
    console.error(JSON.stringify({ fit4u_lead: "sem_destino_configurado", modelo: lead.modelo, acao: lead.acao }));
    return res.status(503).json({ ok: false });
  }

  const r = await Promise.allSettled(tarefas);
  const ok = r.some((x) => x.status === "fulfilled");
  const falhas = r.filter((x) => x.status === "rejected").map((x) => String(x.reason && x.reason.message));
  console.log(JSON.stringify({ fit4u_lead: ok ? "entregue" : "falhou", modelo: lead.modelo, acao: lead.acao, falhas }));
  return res.status(ok ? 200 : 502).json({ ok });
}
