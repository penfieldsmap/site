// Draws the share image (1200 x 630) as a plate from an old atlas, from the motor figure of the body map.
// Not part of the build: run it only to change the image, after build.py.
// usage: node share-image.js [built site folder, default ../public] [image to write, default ../src/static/og.jpg]
const fs = require('fs'), path = require('path');
const { serve, launch } = require('./lib');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..', 'public'));
const outFile = path.resolve(process.argv[3] || path.join(__dirname, '..', 'src', 'static', 'og.jpg'));

const PAPER = '#efe7d3', PLATE = '#f4eddb', INK = '#221c14';
const VIEW = [40, -56, 693, 526];   // the part of the plate that is shown: the gyrus and its labels, not the base of the brain

// Runs in the page. Returns the motor figure as a drawing that stands on its own: nothing selected, the notes of the
// page removed, the colours laid a little out of register with the black, the lower edge faded out, every style inline.
function plate({ PLATE, INK, VIEW }) {
  const NS = 'http://www.w3.org/2000/svg', svg = document.querySelector('#fig1 svg');
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k])); (parent || svg).appendChild(e); return e; };
  svg.querySelectorAll('.seg.on').forEach(e => e.classList.remove('on'));
  svg.querySelectorAll('text.ori, g.alt:not(.solid)').forEach(e => e.remove());
  // labels and pointer lines that would fall in the faded lower edge go
  const FADE = 44, low = VIEW[1] + VIEW[3] - FADE + 6, inv = svg.getScreenCTM().inverse();
  svg.querySelectorAll('text').forEach(t => { const b = t.getBBox(), m = inv.multiply(t.getScreenCTM()); const ys = [[b.x, b.y + b.height], [b.x + b.width, b.y + b.height], [b.x, b.y], [b.x + b.width, b.y]].map(q => m.b * q[0] + m.d * q[1] + m.f); if (Math.max.apply(null, ys) > low) t.remove(); });
  svg.querySelectorAll('line.ptr').forEach(l => { if (Math.max(+l.getAttribute('y1'), +l.getAttribute('y2')) > low) l.remove(); });
  svg.setAttribute('viewBox', VIEW.join(' '));
  // write the computed look of every shape and every label into it, so the drawing no longer needs the page's style sheet
  const SHAPE = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'fill-opacity', 'stroke-opacity', 'opacity', 'display'];
  const TEXT = SHAPE.concat(['font-family', 'font-size', 'font-style', 'font-weight', 'letter-spacing', 'text-anchor', 'paint-order', 'text-transform', 'dominant-baseline']);
  svg.querySelectorAll('path, ellipse, circle, rect, line, text, tspan').forEach(e => {
    const cs = getComputedStyle(e);
    (/^(text|tspan)$/.test(e.tagName) ? TEXT : SHAPE).forEach(p => { e.style.setProperty(p, cs.getPropertyValue(p)); });
    e.style.setProperty('pointer-events', 'none'); e.style.setProperty('cursor', 'default');
  });
  const paper = v => (v || '').replace(/rgb\(248, 245, 236\)|#f8f5ec/gi, PLATE).replace(/rgb\(243, 239, 228\)|#f3efe4/gi, PLATE).replace(/rgb\(28, 26, 22\)|#1c1a16/gi, INK);
  svg.querySelectorAll('[style]').forEach(e => { e.setAttribute('style', paper(e.getAttribute('style'))); });
  // the patterns of the page, on the plate's paper and in its ink
  const defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(NS, 'defs'), svg.firstChild);
  document.querySelectorAll('svg defs pattern').forEach(p => { if (!defs.querySelector('#' + p.id)) defs.appendChild(p.cloneNode(true)); });
  defs.innerHTML = paper(defs.innerHTML) + '<linearGradient id="og-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + PLATE + '" stop-opacity="0"/><stop offset=".8" stop-color="' + PLATE + '"/></linearGradient>';
  // the colours: a second printing, laid over the black a little out of register
  svg.querySelectorAll('.seg .band, .seg .tex').forEach(e => { e.setAttribute('transform', 'translate(1.5 1.1)'); });
  // the lower edge fades out, as the unfinished part of an engraving does
  el('rect', { x: VIEW[0], y: VIEW[1] + VIEW[3] - FADE, width: VIEW[2], height: FADE, fill: 'url(#og-fade)' });
  ['class', 'style', 'role', 'aria-label', 'aria-labelledby', 'tabindex'].forEach(a => svg.removeAttribute(a));
  return svg.outerHTML;
}

(async () => {
  const srv = await serve(root), browser = await launch();
  const errs = [];
  const p = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(srv.url + '/body/#mot-hand'); await p.waitForTimeout(800);
  await p.evaluate(() => document.fonts.ready);
  const svg = await p.evaluate(plate, { PLATE, INK, VIEW });
  const font = n => fs.readFileSync(path.join(root, 'fonts', 'libre-baskerville-latin-' + n + '.woff2')).toString('base64');
  const face = (w, s, n) => ['LB', 'Libre Baskerville'].map(f => `@font-face{font-family:"${f}";font-weight:${w};font-style:${s};src:url(data:font/woff2;base64,${font(n)})}`).join('\n');
  const o = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })).newPage();
  o.on('pageerror', e => errs.push(e.message));
  await o.setContent(`<!doctype html><meta charset="utf-8"><style>
${face(400, 'normal', '400-normal')}
${face(700, 'normal', '700-normal')}
${face(400, 'italic', '400-italic')}
${face(700, 'italic', '700-italic')}
*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;background:${PAPER};color:${INK};font-family:LB,serif;position:relative;overflow:hidden}
.ink{position:absolute;inset:0;filter:url(#press)}
/* the frame: a thick rule with a hairline inside it */
.frame{position:absolute;inset:17px;border:3px solid ${INK}}
.frame:after{content:"";position:absolute;inset:5px;border:1px solid ${INK}}
/* the title, set as a title page: centred, in capitals of two sizes, over a swelled rule */
.title{position:absolute;left:44px;top:0;width:440px;height:630px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center}
.over{font-size:11.5px;letter-spacing:.34em;margin:0 0 24px;padding-left:.34em}
.t1{font-size:54px;line-height:1;letter-spacing:.07em;padding-left:.07em;margin:0}
.t2{font-size:106px;line-height:1;letter-spacing:.2em;padding-left:.2em;margin:8px 0 0}
.rule{margin:28px 0 24px;display:block}
.say{font-size:22.5px;line-height:1.38;font-style:italic;margin:0}
.at{font-size:14.5px;letter-spacing:.3em;padding-left:.3em;margin:32px 0 0}
/* the plate: a ruled box on lighter paper, its number above and its caption below */
.plate{position:absolute;left:506px;top:62px;width:640px;height:486px;background:${PLATE};border:1px solid ${INK};overflow:hidden}
.plate svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.no{position:absolute;top:37px;right:54px;font-size:11px;letter-spacing:.3em;margin:0}
.cap{position:absolute;left:506px;width:640px;top:560px;text-align:center;font-size:14.5px;font-style:italic;margin:0}
.cap b{font-style:normal;font-weight:400;letter-spacing:.14em;font-size:12px}
/* paper: grain, a darkening toward the edges, a few age spots; laid over the ink so the whole sheet shares it */
.paper{position:absolute;inset:0;mix-blend-mode:multiply;pointer-events:none}
</style>
<svg width="0" height="0" style="position:absolute"><defs>
<filter id="press" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.4" xChannelSelector="R" yChannelSelector="G"/></filter>
</defs></svg>
<div class="ink">
<div class="frame"></div>
<div class="title">
<p class="over">AN INTERACTIVE REFERENCE</p>
<p class="t1">PENFIELD’S</p>
<p class="t2">MAP</p>
<svg class="rule" width="200" height="9" viewBox="0 0 210 9"><path d="M0 4.5 C60 3.6 85 1 105 1 C125 1 150 3.6 210 4.5 C150 5.4 125 8 105 8 C85 8 60 5.4 0 4.5Z" fill="${INK}"/></svg>
<p class="say">What stimulating the brain<br>made patients hear, see,<br>remember and feel.</p>
<p class="at">PENFIELDSMAP.COM</p>
</div>
<p class="no">PLATE I.</p>
<div class="plate">${svg}</div>
<p class="cap"><b>FIG. 1.</b>—Coronal section, schematic. The 22 labels of the motor figure of 1950.</p>
</div>
<svg class="paper" width="1200" height="630" viewBox="0 0 1200 630"><defs>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="11"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .36  0 0 0 0 .2  0 0 0 .42 -.13"/></filter>
<filter id="cloud" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006 .011" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .42  0 0 0 0 .2  0 0 0 .2 -.05"/></filter>
<radialGradient id="edge" cx="50%" cy="48%" r="72%"><stop offset=".6" stop-color="#fff"/><stop offset="1" stop-color="#decfa9"/></radialGradient>
<radialGradient id="spot"><stop offset="0" stop-color="#9a6a2c" stop-opacity=".24"/><stop offset=".6" stop-color="#9a6a2c" stop-opacity=".08"/><stop offset="1" stop-color="#9a6a2c" stop-opacity="0"/></radialGradient>
</defs>
<rect width="1200" height="630" fill="url(#edge)"/>
<rect width="1200" height="630" filter="url(#cloud)"/>
<rect width="1200" height="630" filter="url(#grain)"/>
<circle cx="1160" cy="590" r="6" fill="url(#spot)"/><circle cx="84" cy="556" r="8" fill="url(#spot)"/><circle cx="62" cy="530" r="3.5" fill="url(#spot)"/>
</svg>`);
  await o.evaluate(() => document.fonts.ready); await o.waitForTimeout(400);
  // JPEG keeps the grain of the paper at a fifth of the size of a PNG
  await o.screenshot(/\.png$/.test(outFile) ? { path: outFile } : { path: outFile, type: 'jpeg', quality: 92 });
  console.log('share image written to', outFile, '| errors', JSON.stringify(errs));
  await browser.close(); srv.close();
  if (errs.length) process.exit(1);
})();
