// Generates apps/web/public/presentation.html from the single shared
// content source (packages/shared/src/content/help-content.ts) — the same
// content the in-app Help & Guides section reads live. Run:
//   pnpm presentation:build
// Regenerate any time packages/shared/src/content/help-content.ts changes.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { HELP_CONTENT } from "../packages/shared/src/content/help-content.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../apps/web/public/presentation.html");

const json = JSON.stringify(HELP_CONTENT).replace(/</g, "\\u003c");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AzentisFieldOS — How the System Works</title>
<meta name="description" content="A simple, visual walkthrough of AzentisFieldOS for construction site owners and supervisors." />
<style>
${css()}
</style>
</head>
<body>
<div class="progress-rail" aria-hidden="true"><div class="progress-fill" id="progressFill"></div></div>
<nav class="dot-nav" id="dotNav" aria-label="Presentation sections"></nav>

<main id="deck"></main>

<script id="help-content" type="application/json">${json}</script>
<script>
${js()}
</script>
</body>
</html>
`;

writeFileSync(OUT, html, "utf8");
console.log(`Wrote ${OUT} (${(html.length / 1024).toFixed(0)} KB)`);

// ---------------------------------------------------------------------------
function css() {
  return `
:root {
  --surface-0:#FBFAF7; --surface-1:#FFFFFF; --surface-2:#F3F1EA; --surface-3:#EAE6DA;
  --border-hairline:#E4E0D3; --border-strong:#D2CBB8;
  --ink-900:#1B2430; --ink-700:#3E4757; --ink-500:#6B7280; --ink-on-accent:#F7F5EE;
  --teal-900:#0B3B3E; --teal-700:#0F5257; --teal-600:#14666C; --teal-100:#E4EFEE;
  --navy-800:#16273E; --navy-600:#223A5E;
  --gold-700:#96700F; --gold-500:#C7912B; --gold-100:#FBF0DA;
  --success-700:#1E6B45; --success-100:#E4F3EA;
  --danger-700:#A32E2E; --danger-100:#FBE7E5;
  --warning-700:#8A5A12; --warning-100:#FBF0DA;
  --r-sm:6px; --r-md:10px; --r-lg:14px; --r-xl:20px; --r-full:9999px;
  --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px; --sp-5:20px; --sp-6:24px; --sp-8:32px; --sp-10:40px; --sp-12:48px; --sp-16:64px;
  --shadow-1:0 1px 2px rgba(27,36,48,.06),0 1px 1px rgba(27,36,48,.04);
  --shadow-2:0 4px 12px rgba(27,36,48,.08),0 2px 4px rgba(27,36,48,.04);
  --shadow-2-hover:0 8px 20px rgba(27,36,48,.12),0 3px 6px rgba(27,36,48,.06);
  --shadow-3:0 12px 32px rgba(27,36,48,.14),0 4px 8px rgba(27,36,48,.06);
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin:0; font-family:var(--font); background:var(--surface-0); color:var(--ink-900);
  font-size:15px; line-height:1.55; -webkit-font-smoothing:antialiased;
}
img { max-width:100%; display:block; }
h1,h2,h3,p,ul,ol { margin:0; }
a { color:inherit; }

/* ---- scroll-snap deck ---- */
main#deck { scroll-snap-type:y proximity; }
section.slide {
  min-height:100vh; width:100%; scroll-snap-align:start;
  display:flex; flex-direction:column; justify-content:center;
  padding: var(--sp-16) var(--sp-16);
  position:relative; overflow:hidden;
}
@media (max-width: 900px) {
  section.slide { padding: var(--sp-10) var(--sp-6); }
}
.slide-inner { max-width:1180px; margin:0 auto; width:100%; }
.slide.dark { background:var(--navy-800); color:var(--ink-on-accent); }
.slide.tint { background:var(--surface-2); }

.eyebrow { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--teal-700); margin-bottom:var(--sp-3); }
.slide.dark .eyebrow { color:#9FD8D3; }
.hero-title { font-size:clamp(32px,5vw,58px); font-weight:700; line-height:1.08; letter-spacing:-0.02em; margin-bottom:var(--sp-5); }
.section-title { font-size:clamp(26px,3.4vw,40px); font-weight:700; line-height:1.15; letter-spacing:-0.015em; margin-bottom:var(--sp-4); }
.lede { font-size:clamp(16px,1.6vw,20px); color:var(--ink-700); line-height:1.6; max-width:760px; }
.slide.dark .lede { color:#C7D2DE; }
.slide.tint .lede { color: var(--ink-700); }

.reveal { opacity:0; transform:translateY(14px); transition:opacity .5s ease-out, transform .5s ease-out; }
.reveal.in { opacity:1; transform:none; }
.reveal-1{transition-delay:.05s}.reveal-2{transition-delay:.12s}.reveal-3{transition-delay:.19s}.reveal-4{transition-delay:.26s}.reveal-5{transition-delay:.33s}

/* ---- flow chips / arrows ---- */
.flow-row { display:flex; flex-wrap:wrap; align-items:center; gap:var(--sp-3); margin:var(--sp-8) 0; }
.flow-chip {
  background:var(--surface-1); border:1px solid var(--border-hairline); border-radius:var(--r-lg);
  box-shadow:var(--shadow-1); padding:var(--sp-4) var(--sp-5); font-weight:650; font-size:15px;
  color:var(--ink-900);
}
.slide.dark .flow-chip { background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.14); color:var(--ink-on-accent); box-shadow:none; }
.flow-chip.accent { background:var(--teal-700); color:#fff; border-color:var(--teal-700); }
.flow-arrow { color:var(--ink-500); font-size:20px; }
.slide.dark .flow-arrow { color:#7C8CA3; }
.flow-col { display:flex; flex-direction:column; align-items:flex-start; gap:var(--sp-2); }
.flow-vert-arrow { color:var(--ink-500); font-size:18px; margin-left:calc(var(--sp-5) + 1px); }

/* ---- problem/before-after two-column ---- */
.problem-list, .value-list, .info-list { list-style:none; padding:0; margin:var(--sp-6) 0 0; display:grid; gap:var(--sp-3); }
.problem-list li, .value-list li, .info-list li {
  display:flex; align-items:flex-start; gap:var(--sp-3); background:var(--surface-1); border:1px solid var(--border-hairline);
  border-radius:var(--r-md); padding:var(--sp-3) var(--sp-4); box-shadow:var(--shadow-1); font-size:14.5px; color:var(--ink-700);
}
.problem-list li::before { content:"—"; color:var(--danger-700); font-weight:700; }
.value-list li::before { content:"✓"; color:var(--success-700); font-weight:700; }
.info-list li::before { content:"→"; color:var(--teal-700); font-weight:700; }

.two-col { display:grid; grid-template-columns:1fr 1fr; gap:var(--sp-10); align-items:start; }
@media (max-width: 860px) { .two-col { grid-template-columns:1fr; } }

/* ---- role cards ---- */
.role-grid { display:grid; grid-template-columns:1fr 1fr; gap:var(--sp-6); margin-top:var(--sp-8); }
@media (max-width: 860px) { .role-grid { grid-template-columns:1fr; } }
.role-card { background:var(--surface-1); border:1px solid var(--border-hairline); border-radius:var(--r-lg); box-shadow:var(--shadow-2); padding:var(--sp-8); }
.role-card h3 { font-size:22px; font-weight:650; margin-bottom:var(--sp-1); }
.role-card .role-sub { color:var(--ink-500); font-size:13px; margin-bottom:var(--sp-5); }
.role-card ul { list-style:none; padding:0; margin:0; display:grid; gap:var(--sp-2); }
.role-card li { padding-left:var(--sp-5); position:relative; color:var(--ink-700); font-size:14.5px; }
.role-card li::before { content:""; position:absolute; left:0; top:9px; width:6px; height:6px; border-radius:50%; background:var(--teal-700); }

/* ---- stat tiles (owner morning) ---- */
.stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:var(--sp-4); margin-top:var(--sp-8); }
.stat-tile { background:var(--surface-1); border:1px solid var(--border-hairline); border-radius:var(--r-lg); box-shadow:var(--shadow-1); padding:var(--sp-5); }
.stat-tile.warn { border-color:#E8CC8F; background:var(--warning-100); }
.stat-tile .num { font-size:26px; font-weight:700; letter-spacing:-0.01em; }
.stat-tile .lbl { color:var(--ink-500); font-size:13px; margin-top:2px; }

/* ---- module gallery + accordion detail ---- */
.module-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:var(--sp-3); margin-top:var(--sp-6); }
.module-card {
  text-align:left; cursor:pointer; background:var(--surface-1); border:1px solid var(--border-hairline);
  border-radius:var(--r-lg); box-shadow:var(--shadow-1); padding:var(--sp-4); font:inherit; color:inherit;
  transition:box-shadow .16s ease-out, transform .16s ease-out;
}
.module-card:hover, .module-card.active { box-shadow:var(--shadow-2-hover); transform:translateY(-2px); border-color:var(--teal-700); }
.module-card .m-name { font-weight:650; font-size:15px; margin-bottom:4px; }
.module-card .m-what { color:var(--ink-500); font-size:13px; line-height:1.4; }
.module-detail { display:none; margin-top:var(--sp-6); background:var(--surface-1); border:1px solid var(--border-hairline); border-radius:var(--r-lg); box-shadow:var(--shadow-2); padding:var(--sp-8); }
.module-detail.open { display:block; }
.module-detail h4 { font-size:22px; font-weight:650; margin-bottom:var(--sp-4); }
.module-detail .m-grid { display:grid; grid-template-columns:1.1fr .9fr; gap:var(--sp-8); }
@media (max-width: 860px) { .module-detail .m-grid { grid-template-columns:1fr; } }
.module-detail .m-row { margin-bottom:var(--sp-4); }
.module-detail .m-row .m-label { font-size:11px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--teal-700); margin-bottom:4px; }
.module-detail .m-row p { color:var(--ink-700); font-size:14.5px; }
.module-detail ol { margin:0; padding-left:20px; color:var(--ink-700); font-size:14.5px; display:grid; gap:6px; }
.module-detail .m-example { background:var(--gold-100); border-radius:var(--r-md); padding:var(--sp-4); color:var(--ink-900); font-size:14px; }
.module-detail .m-shot { border-radius:var(--r-md); overflow:hidden; border:1px solid var(--border-hairline); box-shadow:var(--shadow-2); }
.module-detail .m-shot img { width:100%; }
.who-badges { display:flex; gap:6px; margin-top:6px; }
.badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:var(--r-full); font-size:11.5px; font-weight:600; }
.badge.owner { background:var(--teal-100); color:var(--teal-700); }
.badge.supervisor { background:var(--gold-100); color:var(--gold-700); }

/* ---- inventory / labour visual stories ---- */
.story-block { margin-top:var(--sp-8); }
.story-block h4 { font-size:17px; font-weight:650; margin-bottom:var(--sp-3); color:var(--teal-700); }
.slide.dark .story-block h4 { color:#9FD8D3; }
.mini-shot { border-radius:var(--r-md); overflow:hidden; border:1px solid var(--border-hairline); box-shadow:var(--shadow-2); margin-top:var(--sp-6); }
.shot-frame { border-radius:var(--r-lg); overflow:hidden; border:1px solid var(--border-hairline); box-shadow:var(--shadow-3); }
.shot-frame img { width:100%; }

/* ---- guide steps ---- */
.guide-steps { display:grid; gap:var(--sp-3); margin-top:var(--sp-5); }
.guide-step { display:flex; gap:var(--sp-4); align-items:flex-start; background:var(--surface-1); border:1px solid var(--border-hairline); border-radius:var(--r-lg); box-shadow:var(--shadow-1); padding:var(--sp-4); }
.step-num { flex:none; width:30px; height:30px; border-radius:var(--r-full); background:var(--teal-700); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; }
.guide-step .g-title { font-weight:650; font-size:14.5px; }
.guide-step .g-detail { color:var(--ink-500); font-size:13.5px; margin-top:2px; }
.guide-result { margin-top:var(--sp-4); background:var(--success-100); color:var(--success-700); border-radius:var(--r-md); padding:var(--sp-3) var(--sp-4); font-weight:600; font-size:14px; }
.try-it { display:inline-flex; align-items:center; gap:8px; margin-top:var(--sp-4); background:var(--teal-700); color:#fff; text-decoration:none; padding:10px 18px; border-radius:var(--r-md); font-weight:650; font-size:14px; box-shadow:var(--shadow-1); }
.try-it:hover { background:var(--teal-600); }

/* ---- timeline ---- */
.timeline { margin-top:var(--sp-8); display:grid; gap:0; border-left:2px solid var(--border-strong); margin-left:8px; }
.timeline .t-item { position:relative; padding:0 0 var(--sp-6) var(--sp-8); }
.timeline .t-item::before { content:""; position:absolute; left:-7px; top:2px; width:12px; height:12px; border-radius:50%; background:var(--teal-700); border:3px solid var(--surface-0); }
.timeline .t-time { font-size:11px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--teal-700); }
.timeline .t-title { font-weight:650; font-size:16px; margin-top:2px; }
.timeline .t-detail { color:var(--ink-500); font-size:13.5px; margin-top:2px; }

/* ---- CTA / footer nav ---- */
.cta-row { display:flex; gap:var(--sp-3); margin-top:var(--sp-8); flex-wrap:wrap; }
.btn { display:inline-flex; align-items:center; gap:8px; padding:12px 22px; border-radius:var(--r-md); font-weight:650; font-size:14.5px; text-decoration:none; box-shadow:var(--shadow-1); }
.btn.primary { background:var(--teal-700); color:#fff; }
.btn.primary:hover { background:var(--teal-600); }
.btn.ghost { background:transparent; color:var(--ink-on-accent); border:1px solid rgba(255,255,255,.3); }

.badge-soon { display:inline-flex; align-items:center; gap:6px; background:var(--warning-100); color:var(--warning-700); border-radius:var(--r-full); padding:4px 12px; font-size:12px; font-weight:650; }

/* ---- nav chrome ---- */
.progress-rail { position:fixed; top:0; left:0; right:0; height:3px; background:var(--surface-3); z-index:50; }
.progress-fill { height:100%; width:0%; background:var(--teal-700); transition:width .15s linear; }
.dot-nav { position:fixed; right:22px; top:50%; transform:translateY(-50%); z-index:50; display:flex; flex-direction:column; gap:9px; }
.dot-nav button { width:9px; height:9px; border-radius:50%; border:none; background:var(--border-strong); cursor:pointer; padding:0; }
.dot-nav button.active { background:var(--teal-700); width:11px; height:11px; }
@media (max-width: 760px) { .dot-nav { display:none; } }

.logo-mark { display:inline-flex; align-items:center; gap:10px; font-weight:700; font-size:15px; letter-spacing:-0.01em; }
.logo-dot { width:28px; height:28px; border-radius:8px; background:var(--teal-700); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; }

.two-shot { display:grid; grid-template-columns:1fr 1fr; gap:var(--sp-4); margin-top:var(--sp-6); }
@media (max-width: 760px) { .two-shot { grid-template-columns:1fr; } }

.comparison { display:grid; grid-template-columns:1fr 1fr; gap:var(--sp-8); margin-top:var(--sp-8); }
@media (max-width: 760px) { .comparison { grid-template-columns:1fr; } }
.comparison .col h4 { font-size:15px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; margin-bottom:var(--sp-3); }
.comparison .before h4 { color:var(--danger-700); }
.comparison .after h4 { color:var(--success-700); }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior:auto; }
  .reveal { transition:none; opacity:1; transform:none; }
}
`;
}

// ---------------------------------------------------------------------------
function js() {
  return `
const DATA = JSON.parse(document.getElementById('help-content').textContent);
const deck = document.getElementById('deck');

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === 'class') node.className = attrs[k];
    else if (k === 'html') node.innerHTML = attrs[k];
    else node.setAttribute(k, attrs[k]);
  }
  (children || []).forEach((c) => { if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
  return node;
}
function chip(text, accent) { return el('div', { class: 'flow-chip' + (accent ? ' accent' : '') }, [text]); }
function arrow(vertical) { return el('div', { class: vertical ? 'flow-vert-arrow' : 'flow-arrow', html: vertical ? '\\u2193' : '\\u2192' }); }
function flowRow(items, opts) {
  opts = opts || {};
  const row = el('div', { class: 'flow-row' });
  items.forEach((label, i) => {
    row.appendChild(chip(label, opts.accentLast && i === items.length - 1));
    if (i < items.length - 1) row.appendChild(arrow(false));
  });
  return row;
}
function shot(name, alt) {
  return el('div', { class: 'shot-frame reveal' }, [el('img', { src: '/presentation-assets/' + name + '.png', alt: alt || '', loading: 'lazy' })]);
}
function slide(opts) {
  const s = el('section', { class: 'slide' + (opts.dark ? ' dark' : '') + (opts.tint ? ' tint' : ''), id: opts.id });
  const inner = el('div', { class: 'slide-inner' });
  s.appendChild(inner);
  deck.appendChild(s);
  return inner;
}

// ---- 1. Cover ----
(function () {
  const inner = slide({ id: 's-cover', dark: true });
  inner.appendChild(el('div', { class: 'logo-mark reveal in', style: 'margin-bottom:56px;color:#fff;' }, [el('span', { class: 'logo-dot' }, ['A']), DATA.product.name]));
  inner.appendChild(el('div', { class: 'eyebrow reveal in' }, ['Client Walkthrough']));
  inner.appendChild(el('h1', { class: 'hero-title reveal in' }, [DATA.product.tagline]));
  inner.appendChild(el('p', { class: 'lede reveal in' }, [DATA.product.intro]));
  inner.appendChild(el('div', { class: 'cta-row reveal in' }, [el('a', { href: '#s-problem', class: 'btn primary' }, ['Start \\u2192'])]));
})();

// ---- 2. The problem today ----
(function () {
  const inner = slide({ id: 's-problem', tint: true });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['Before']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['How things usually get lost today']));
  const flow = el('div', { class: 'reveal' });
  flow.appendChild(flowRow(DATA.problemToday.flow));
  inner.appendChild(flow);
  const list = el('ul', { class: 'problem-list reveal' });
  DATA.problemToday.problems.forEach((p) => list.appendChild(el('li', {}, [p])));
  inner.appendChild(list);
})();

// ---- 3. How AzentisFieldOS solves it ----
(function () {
  const inner = slide({ id: 's-solution' });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['After']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['One simple flow instead']));
  const col = el('div', { class: 'flow-col reveal' });
  DATA.solutionFlow.forEach((label, i) => {
    col.appendChild(chip(label, i === DATA.solutionFlow.length - 1));
    if (i < DATA.solutionFlow.length - 1) col.appendChild(arrow(true));
  });
  inner.appendChild(col);
  inner.appendChild(shot('dashboard', 'The Owner Dashboard'));
})();

// ---- 4. Who uses the system ----
(function () {
  const inner = slide({ id: 's-who', tint: true });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['Two Simple Roles']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['Who uses the system?']));
  const grid = el('div', { class: 'role-grid' });
  ['OWNER_ADMIN', 'SITE_SUPERVISOR'].forEach((key, i) => {
    const role = DATA.roles[key];
    const card = el('div', { class: 'role-card reveal reveal-' + (i + 1) });
    card.appendChild(el('h3', {}, [role.label]));
    card.appendChild(el('p', { class: 'role-sub' }, [role.summary]));
    grid.appendChild(card);
  });
  inner.appendChild(grid);
})();

// ---- 5. Complete system flow ----
(function () {
  const inner = slide({ id: 's-flow', dark: true });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['The Whole Picture']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['Everything is connected']));
  const wrap = el('div', { class: 'reveal', style: 'margin-top:32px' });
  wrap.appendChild(flowRow(DATA.systemFlow, { accentLast: true }));
  inner.appendChild(wrap);
  inner.appendChild(el('p', { class: 'lede reveal' }, ['Every site\\'s work, materials, labour and expenses flow into one place \\u2014 so the Owner sees the whole business, not fragments of it.']));
})();

// ---- 6. Module-by-module walkthrough ----
(function () {
  const inner = slide({ id: 's-modules' });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['Module by Module']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['Everything in the app, explained simply']));
  inner.appendChild(el('p', { class: 'lede reveal' }, ['Tap any card to see what it is, why it exists, who uses it, how to use it, and a real example.']));
  const grid = el('div', { class: 'module-grid reveal' });
  const detail = el('div', { class: 'module-detail', id: 'moduleDetail' });
  DATA.modules.forEach((m) => {
    const card = el('button', { class: 'module-card', type: 'button', 'data-id': m.id }, [
      el('div', { class: 'm-name' }, [m.name]),
      el('div', { class: 'm-what' }, [m.whatIsIt]),
    ]);
    card.addEventListener('click', () => openModule(m, card));
    grid.appendChild(card);
  });
  inner.appendChild(grid);
  inner.appendChild(detail);

  function openModule(m, card) {
    document.querySelectorAll('.module-card').forEach((c) => c.classList.remove('active'));
    card.classList.add('active');
    detail.classList.add('open');
    const steps = el('ol');
    m.howToUse.forEach((s) => steps.appendChild(el('li', {}, [s])));
    const who = el('div', { class: 'who-badges' });
    m.usedBy.forEach((r) => who.appendChild(el('span', { class: 'badge ' + (r === 'OWNER_ADMIN' ? 'owner' : 'supervisor') }, [DATA.roles[r].label])));
    const left = el('div', {}, [
      el('h4', {}, [m.name]),
      who,
      el('div', { class: 'm-row', style: 'margin-top:16px' }, [el('div', { class: 'm-label' }, ['What is this?']), el('p', {}, [m.whatIsIt])]),
      el('div', { class: 'm-row' }, [el('div', { class: 'm-label' }, ['Why do we use it?']), el('p', {}, [m.whyUseIt])]),
      el('div', { class: 'm-row' }, [el('div', { class: 'm-label' }, ['How to use it']), steps]),
      el('div', { class: 'm-row' }, [el('div', { class: 'm-label' }, ['What happens after saving?']), el('p', {}, [m.afterSaving])]),
      el('div', { class: 'm-row' }, [el('div', { class: 'm-label' }, ['Real-life example']), el('div', { class: 'm-example' }, [m.example])]),
    ]);
    const shotName = MODULE_SHOTS[m.id];
    const right = shotName ? el('div', { class: 'm-shot' }, [el('img', { src: '/presentation-assets/' + shotName + '.png', alt: m.name })]) : el('div');
    detail.innerHTML = '';
    detail.appendChild(el('div', { class: 'm-grid' }, [left, right]));
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  const MODULE_SHOTS = {
    dashboard: 'dashboard', sites: 'sites', 'site-detail': 'site-detail', inventory: 'inventory',
    purchases: 'purchases-new', movements: 'movements', consumption: 'consumption-new', vendors: 'vendors',
    team: 'team', payments: 'payments', 'waste-disposal': 'waste-disposal', dsr: 'dsr-new',
    reports: 'reports-financial', settings: 'settings',
  };
})();

// ---- 7. Inventory visual story ----
(function () {
  const inner = slide({ id: 's-inventory', tint: true });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['Follow the Material']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['Where does the material actually go?']));
  const s = DATA.inventoryStory;
  [['Material Purchase', s.purchase.steps], ['Material Consumption', s.consumption.steps], ['Material Movement', s.movement.steps]].forEach(([title, steps]) => {
    const block = el('div', { class: 'story-block reveal' });
    block.appendChild(el('h4', {}, [title]));
    const col = el('div', { class: 'flow-col' });
    steps.forEach((label, i) => {
      col.appendChild(chip(label, i === steps.length - 1));
      if (i < steps.length - 1) col.appendChild(arrow(true));
    });
    block.appendChild(col);
    inner.appendChild(block);
  });
  const shots = el('div', { class: 'two-shot' });
  shots.appendChild(shot('purchases-new'));
  shots.appendChild(shot('consumption-new'));
  inner.appendChild(shots);
})();

// ---- 8. Labour visual story ----
(function () {
  const inner = slide({ id: 's-labour' });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['Follow the Worker']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['From a day\\'s work to a fair payment']));
  const col = el('div', { class: 'flow-col reveal' });
  DATA.labourStory.steps.forEach((label, i) => {
    col.appendChild(chip(label, i === DATA.labourStory.steps.length - 1));
    if (i < DATA.labourStory.steps.length - 1) col.appendChild(arrow(true));
  });
  inner.appendChild(col);
  const ex = DATA.labourStory.example;
  const stats = el('div', { class: 'stat-grid reveal' }, [
    el('div', { class: 'stat-tile' }, [el('div', { class: 'num' }, ['\\u20B9' + ex.wage.toLocaleString('en-IN')]), el('div', { class: 'lbl' }, ['Wage'])]),
    el('div', { class: 'stat-tile' }, [el('div', { class: 'num' }, ['\\u20B9' + ex.advance.toLocaleString('en-IN')]), el('div', { class: 'lbl' }, ['Advance already given'])]),
    el('div', { class: 'stat-tile warn' }, [el('div', { class: 'num' }, ['\\u20B9' + ex.paid.toLocaleString('en-IN')]), el('div', { class: 'lbl' }, ['Amount actually paid to ' + ex.workerName])]),
  ]);
  inner.appendChild(stats);
  inner.appendChild(shot('payments'));
})();

// ---- 9. DSR visual story ----
(function () {
  const inner = slide({ id: 's-dsr', dark: true });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['The Most Important Screen']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['The Daily Site Report \\u2014 one update, everything covered']));
  const two = el('div', { class: 'two-col' });
  const left = el('div', { class: 'flow-col reveal' });
  DATA.dsrStory.steps.forEach((label, i) => {
    left.appendChild(chip(label));
    if (i < DATA.dsrStory.steps.length - 1) left.appendChild(arrow(true));
  });
  two.appendChild(left);
  two.appendChild(shot('dsr-new', 'The Daily Site Report form'));
  inner.appendChild(two);
  inner.appendChild(el('p', { class: 'lede reveal', style: 'margin-top:32px;color:#C7D2DE' }, ['One submission automatically updates:']));
  inner.appendChild(flowRow(DATA.dsrStory.contributesTo, { accentLast: false }));
})();

// ---- 10. Owner experience ----
(function () {
  const inner = slide({ id: 's-owner', tint: true });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['What Does the Owner See?']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['Open the app in the morning \\u2014 and know everything']));
  const stats = el('div', { class: 'stat-grid reveal' });
  DATA.ownerMorning.lines.forEach((line, i) => {
    stats.appendChild(el('div', { class: 'stat-tile' + (i >= 2 ? ' warn' : '') }, [el('div', { class: 'num', style: 'font-size:18px' }, [line])]));
  });
  inner.appendChild(stats);
  inner.appendChild(el('p', { class: 'lede reveal', style: 'margin-top:24px' }, ['The Owner does not need to call everyone to know what is happening.']));
  inner.appendChild(shot('dashboard'));
})();

// ---- 11. A real day in the system ----
(function () {
  const inner = slide({ id: 's-day' });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['A Real Day, Start to Finish']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['One day at Site A']));
  const tl = el('div', { class: 'timeline reveal' });
  DATA.dayInTheLife.forEach((step) => {
    tl.appendChild(el('div', { class: 't-item' }, [
      el('div', { class: 't-time' }, [step.time]),
      el('div', { class: 't-title' }, [step.title]),
      el('div', { class: 't-detail' }, [step.detail]),
    ]));
  });
  inner.appendChild(tl);
})();

// ---- 12. Before vs After ----
(function () {
  const inner = slide({ id: 's-beforeafter', dark: true });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['The Difference']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['Before vs. After']));
  const comp = el('div', { class: 'comparison reveal' });
  const beforeCol = el('div', { class: 'col before' }, [el('h4', {}, ['Before'])]);
  DATA.beforeAfter.before.forEach((b) => beforeCol.appendChild(el('div', { class: 'flow-chip', style: 'margin-bottom:8px' }, [b])));
  const afterCol = el('div', { class: 'col after' }, [el('h4', {}, ['After'])]);
  DATA.beforeAfter.after.forEach((a) => afterCol.appendChild(el('div', { class: 'flow-chip accent', style: 'margin-bottom:8px' }, [a])));
  comp.appendChild(beforeCol);
  comp.appendChild(afterCol);
  inner.appendChild(comp);
})();

// ---- 13. Client value ----
(function () {
  const inner = slide({ id: 's-value' });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['Why It Matters']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['What this means for your team']));
  const two = el('div', { class: 'two-col' });
  const ownerCol = el('div', { class: 'reveal' }, [el('h4', { style: 'font-weight:650;margin-bottom:12px' }, ['For the Owner'])]);
  const ownerList = el('ul', { class: 'value-list' });
  DATA.clientValue.owner.forEach((v) => ownerList.appendChild(el('li', {}, [v])));
  ownerCol.appendChild(ownerList);
  const supCol = el('div', { class: 'reveal' }, [el('h4', { style: 'font-weight:650;margin-bottom:12px' }, ['For Supervisors'])]);
  const supList = el('ul', { class: 'value-list' });
  DATA.clientValue.supervisor.forEach((v) => supList.appendChild(el('li', {}, [v])));
  supCol.appendChild(supList);
  two.appendChild(ownerCol);
  two.appendChild(supCol);
  inner.appendChild(two);
})();

// ---- 14. End-to-end demonstration ----
(function () {
  const inner = slide({ id: 's-e2e', tint: true });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['Putting It All Together']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['The complete journey']));
  const col = el('div', { class: 'flow-col reveal' });
  DATA.endToEndDemo.forEach((label, i) => {
    col.appendChild(chip(label, i === DATA.endToEndDemo.length - 1));
    if (i < DATA.endToEndDemo.length - 1) col.appendChild(arrow(true));
  });
  inner.appendChild(col);
})();

// ---- 15. Coming soon / roadmap (honest scope) ----
(function () {
  const inner = slide({ id: 's-roadmap' });
  inner.appendChild(el('div', { class: 'eyebrow reveal' }, ['Being Honest About What\\'s Next']));
  inner.appendChild(el('h2', { class: 'section-title reveal' }, ['Coming soon']));
  const grid = el('ul', { class: 'info-list reveal' });
  DATA.comingSoon.forEach((c) => grid.appendChild(el('li', { style: 'align-items:center' }, [el('span', { class: 'badge-soon' }, ['Coming Soon']), ' ' + c.title + ' \\u2014 ' + c.detail])));
  inner.appendChild(grid);
  inner.appendChild(el('h3', { class: 'section-title reveal', style: 'font-size:20px;margin-top:40px' }, ['Recommended future improvements']));
  const grid2 = el('ul', { class: 'info-list reveal' });
  DATA.futureImprovements.forEach((c) => grid2.appendChild(el('li', {}, [c.title + ' \\u2014 ' + c.detail])));
  inner.appendChild(grid2);
})();

// ---- Closing ----
(function () {
  const inner = slide({ id: 's-close', dark: true });
  inner.appendChild(el('div', { class: 'logo-mark reveal', style: 'margin-bottom:24px;color:#fff' }, [el('span', { class: 'logo-dot' }, ['A']), DATA.product.name]));
  inner.appendChild(el('h2', { class: 'hero-title reveal' }, ['This is simple. This is how your team would actually use it.']));
  inner.appendChild(el('div', { class: 'cta-row reveal' }, [
    el('a', { href: '/help', class: 'btn primary' }, ['Open Help & Guides \\u2192']),
    el('a', { href: '/', class: 'btn ghost' }, ['Open the App']),
  ]));
})();

// ---- reveal-on-scroll + progress + dot nav ----
const slides = Array.from(document.querySelectorAll('section.slide'));
const dotNav = document.getElementById('dotNav');
slides.forEach((s, i) => {
  const b = document.createElement('button');
  b.setAttribute('aria-label', 'Go to section ' + (i + 1));
  b.addEventListener('click', () => s.scrollIntoView({ behavior: 'smooth' }));
  dotNav.appendChild(b);
});
const dots = Array.from(dotNav.children);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.2 });
document.querySelectorAll('.reveal').forEach((n) => revealObserver.observe(n));

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const idx = slides.indexOf(e.target);
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }
  });
}, { threshold: 0.5 });
slides.forEach((s) => activeObserver.observe(s));

window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
});
`;
}
