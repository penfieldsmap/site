// Renders the two full map pages and extracts their About, Methods and References as HTML fragments.
// usage: node capture.js <folder with the full pages> <fragments.json to write>
const fs = require('fs');
const { serve, launch } = require('./lib');
const [root, outFile] = process.argv.slice(2);
if (!root || !outFile) { console.error('usage: node capture.js <full pages folder> <out.json>'); process.exit(2); }
(async () => {
  const srv = await serve(root), browser = await launch();
  const errs = []; const out = {};
  for (const [key, url, base] of [['exp', '/', '@EXP@'], ['body', '/body/', '@BODY@']]) {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    p.on('pageerror', e => errs.push(key + ': ' + e.message));
    await p.goto(srv.url + url); await p.waitForTimeout(700);
    out[key] = await p.evaluate(({ key, base }) => {
      function grab(el) {
        const c = el.cloneNode(true);
        c.querySelectorAll('button[data-id]').forEach(b => { const a = document.createElement('a'); a.className = 'lk'; a.setAttribute('href', base + '#' + b.getAttribute('data-id')); a.textContent = b.textContent; b.replaceWith(a); });
        c.querySelectorAll('a[href^="#"]').forEach(a => a.setAttribute('href', base + a.getAttribute('href')));
        c.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
        return c.innerHTML;
      }
      const q = s => document.querySelector(s);
      const A = key === 'exp' ? q('#about-a') : q('#about > div:nth-child(1)');
      const B = key === 'exp' ? q('#about-b') : q('#about > div:nth-child(2)');
      return { aA: grab(A), aB: grab(B), meth: '<ol>' + grab(q('#methods ol')) + '</ol>', codes: '<dl>' + grab(q('#methods dl')) + '</dl>', refs: grab(q('#reflist')), nrefs: document.querySelectorAll('#reflist li').length, nmeth: document.querySelectorAll('#methods ol li').length };
    }, { key, base });
    await p.close();
  }
  fs.writeFileSync(outFile, JSON.stringify(out));
  console.log('captured', 'exp refs', out.exp.nrefs, 'methods', out.exp.nmeth, '| body refs', out.body.nrefs, 'methods', out.body.nmeth, '| errors', JSON.stringify(errs));
  await browser.close(); srv.close();
  if (errs.length) process.exit(1);
})();
