// For every record on both maps: the record as plain HTML, the plate as drawn for a wide and a narrow screen,
// and a few words for the page head. build.py turns each into a page of its own, readable without scripts.
// usage: node records.js <built site folder> <records.json to write>
const fs = require('fs');
const { serve, launch } = require('./lib');
const [root, outFile] = process.argv.slice(2);
if (!root || !outFile) { console.error('usage: node records.js <site folder> <out.json>'); process.exit(2); }

// Runs in the page. Returns the record with every control turned into a plain link, or removed.
function grab([kind, id, urls, order]) {
  const norm = s => (s || '').replace(/\s+/g, ' ').trim();
  const rec = document.getElementById('record'), c = rec.cloneNode(true);
  const i = order.indexOf(id), n = order.length;
  const link = (to, text, cls) => { const a = document.createElement('a'); a.setAttribute('href', urls[to]); a.className = cls; a.textContent = text; return a; };
  c.querySelectorAll('.perm').forEach(e => e.remove());
  c.querySelectorAll('#copyrec').forEach(e => e.remove());
  c.querySelectorAll('[data-step]').forEach(b => { const d = parseInt(b.getAttribute('data-step'), 10); b.replaceWith(link(order[(i + d + n) % n], b.textContent, 'plain')); });
  c.querySelectorAll('#prev, #next').forEach(b => { const d = b.id === 'prev' ? -1 : 1; if (b.disabled || i + d < 0 || i + d >= n) { b.remove(); } else { b.replaceWith(link(order[i + d], b.textContent, 'plain')); } });
  c.querySelectorAll('button[data-id]').forEach(b => { const to = b.getAttribute('data-id'); if (urls[to]) { b.replaceWith(link(to, b.textContent, 'lk')); } else { b.replaceWith(document.createTextNode(b.textContent)); } });
  c.querySelectorAll('details').forEach(d => d.setAttribute('open', ''));
  c.querySelectorAll('.fc').forEach(e => e.remove());
  c.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
  c.querySelectorAll('[tabindex]').forEach(e => e.removeAttribute('tabindex'));
  const left = c.querySelectorAll('button'); left.forEach(b => b.remove());
  // a space between neighbouring links, so the text does not run together when it is read without styles
  c.querySelectorAll('.rec-act').forEach(d => Array.from(d.children).slice(1).forEach(k => d.insertBefore(document.createTextNode(' '), k)));
  const svg = document.querySelector('#fig1 svg');
  const first = rec.querySelector('.lead, .note') || rec.querySelector('.row div');
  return {
    html: c.innerHTML, svg: svg ? svg.outerHTML : '', wrap: document.getElementById('fig1').className,
    cap: norm((document.getElementById('f1t') || {}).textContent), title: norm(rec.querySelector('h2').textContent),
    recid: norm((rec.querySelector('.rec-id') || {}).textContent), first: norm(first ? first.textContent : ''),
    text: norm(rec.textContent), dropped: left.length
  };
}

(async () => {
  const srv = await serve(root), B = srv.url, browser = await launch();
  const errs = [], out = { exp: { order: [], rec: {} }, body: { order: {}, rec: {} } };
  const desk = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); desk.on('pageerror', e => errs.push(e.message));
  const phone = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage(); phone.on('pageerror', e => errs.push(e.message));
  const pick = async (pg, id) => { await pg.evaluate(i => { location.hash = i; }, id); await pg.waitForTimeout(45); };

  // ---- experience map
  await desk.goto(B + '/'); await desk.waitForTimeout(600); await phone.goto(B + '/'); await phone.waitForTimeout(600);
  const E = await desk.evaluate(() => ({ ids: window.__E.ENTRIES.map(e => e.id), g: window.__E.ENTRIES.map(e => e.g), lab: window.__E.ENTRIES.map(e => e.lab), slug: window.__E.SLUG }));
  const xurl = {}; E.ids.forEach(id => { xurl[id] = '/experience/' + E.slug[id] + '/'; });
  out.exp.order = E.ids;
  for (let k = 0; k < E.ids.length; k++) {
    const id = E.ids[k]; await pick(desk, id);
    const r = await desk.evaluate(grab, ['exp', id, xurl, E.ids]);
    await pick(phone, id);
    const m = await phone.evaluate(() => ({ svg: document.querySelector('#fig1 svg').outerHTML, wrap: document.getElementById('fig1').className }));
    out.exp.rec[id] = Object.assign(r, { id, url: xurl[id], g: E.g[k], lab: E.lab[k], svgm: m.svg, wrapm: m.wrap });
  }

  // ---- body map
  await desk.goto(B + '/body/'); await desk.waitForTimeout(600); await phone.goto(B + '/body/'); await phone.waitForTimeout(600);
  const D = await desk.evaluate(() => { const ids = Object.keys(window.__D.REG), path = {}; ids.forEach(i => { path[i] = window.__D.recPath(i); }); const fam = id => id.split('-')[0]; const seq = { sen: [], mot: [], g: [] }; ids.forEach(i => { if (i !== 'mot-functions') { seq[fam(i)].push(i); } }); return { ids, path, seq }; });
  const burl = {}; D.ids.forEach(id => { burl[id] = '/body/' + D.path[id] + '/'; });
  out.body.order = D.seq; out.body.ids = D.ids;
  for (const id of D.ids) {
    await pick(desk, id);
    const fam = id.split('-')[0], order = id === 'mot-functions' ? [id] : D.seq[fam];
    const r = await desk.evaluate(grab, ['body', id, burl, order]);
    await pick(phone, id);
    const m = await phone.evaluate(() => ({ svg: document.querySelector('#fig1 svg').outerHTML, wrap: document.getElementById('fig1').className }));
    out.body.rec[id] = Object.assign(r, { id, url: burl[id], fam, svgm: m.svg, wrapm: m.wrap });
  }
  fs.writeFileSync(outFile, JSON.stringify(out));
  const xs = Object.values(out.exp.rec), bs = Object.values(out.body.rec);
  const empty = xs.concat(bs).filter(r => !r.svg || !r.svgm).length;
  console.log('records: experience', xs.length, 'body', bs.length, '| controls dropped', xs.concat(bs).reduce((a, r) => a + r.dropped, 0), '| empty plates', empty, '| errors', JSON.stringify(errs));
  await browser.close(); srv.close();
  if (errs.length || empty) process.exit(1);
})();
