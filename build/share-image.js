// Composes the share image (1200 x 630): the title and the line under it beside the picture of a brain with numbered paper tickets on it
// (share-brain.png, in this folder). The tickets recall those laid on the cortex at each point that answered the
// electrode.
// The picture is an illustration made for this site in the manner of a specimen photograph. It is not an archival
// photograph, and the ticket numbers mark no real points.
// Not part of the build: run it only to change the image.
// usage: node share-image.js [image to write, default ../src/static/og.jpg]
const fs = require('fs'), path = require('path');
const { launch } = require('./lib');
const outFile = path.resolve(process.argv[2] || path.join(__dirname, '..', 'src', 'static', 'og.jpg'));
const fonts = path.join(__dirname, '..', 'src', 'static', 'fonts');
const brainFile = process.env.BRAIN || path.join(__dirname, 'share-brain.png');

const W = 1200, H = 630, PAPER = process.env.PAPER || '#f3efe4', INK = '#17130e';   // the paper of the site, flat
const RIGHT = 52;                                  // space between the picture and the right edge
// the line under the title, as on the cover of the home page
const LINE = 'An interactive reference and research companion to Velco Dar’s <cite>NEURAL: How <span class="nb">Brain-Computer</span> Interfaces Will Redefine Commerce and Power</cite>';

(async () => {
  const browser = await launch(), errs = [];
  const font = n => fs.readFileSync(path.join(fonts, 'libre-baskerville-latin-' + n + '.woff2')).toString('base64');
  const brain = fs.readFileSync(brainFile), bw = brain.readUInt32BE(16), bh = brain.readUInt32BE(20);   // width and height from the PNG header
  const o = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  o.on('pageerror', e => errs.push(e.message));
  await o.setContent(`<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:LB;font-weight:400;src:url(data:font/woff2;base64,${font('400-normal')})}
@font-face{font-family:LB;font-weight:400;font-style:italic;src:url(data:font/woff2;base64,${font('400-italic')})}
@font-face{font-family:LB;font-weight:500;src:url(data:font/woff2;base64,${font('500-normal')})}
*{box-sizing:border-box}
body{margin:0;width:${W}px;height:${H}px;background:${PAPER};color:${INK};font-family:LB,serif;position:relative;overflow:hidden}
/* the picture, at its own size, with nothing added round it */
.brain{position:absolute;left:${W - RIGHT - bw}px;top:${Math.round((H - bh) / 2)}px;width:${bw}px;height:${bh}px;display:block}
/* the title, the line under it, and the address */
.title{position:absolute;left:44px;top:0;width:470px;height:${H}px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;filter:url(#press)}
.t1,.t2{font-size:80px;font-weight:500;line-height:1.06;margin:0}
.rule{display:block;margin:24px 0 19px}
.line{font-size:17px;line-height:1.5;margin:0;max-width:400px;text-wrap:balance}
.line cite{font-style:italic}
.line .nb{white-space:nowrap}
.at{font-size:13px;letter-spacing:.3em;padding-left:.3em;margin:22px 0 0}
</style>
<svg width="0" height="0" style="position:absolute"><defs><filter id="press" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>
<img class="brain" alt="" src="data:image/png;base64,${brain.toString('base64')}">
<div class="title">
<p class="t1">Penfield’s</p>
<p class="t2">Map</p>
<svg class="rule" width="200" height="9" viewBox="0 0 210 9"><path d="M0 4.5 C60 3.6 85 1 105 1 C125 1 150 3.6 210 4.5 C150 5.4 125 8 105 8 C85 8 60 5.4 0 4.5Z" fill="${INK}"/></svg>
<p class="line">${LINE}</p>
<p class="at">PENFIELDSMAP.COM</p>
</div>`);
  await o.evaluate(() => Promise.all([document.fonts.load('400 20px LB'), document.fonts.load('italic 400 20px LB'), document.fonts.load('500 20px LB'), document.querySelector('.brain').decode()]));
  await o.evaluate(() => document.fonts.ready); await o.waitForTimeout(300);
  await o.screenshot(/\.png$/.test(outFile) ? { path: outFile } : { path: outFile, type: 'jpeg', quality: 92 });
  console.log('share image written to', outFile, '| picture', bw + ' x ' + bh, '| errors', JSON.stringify(errs));
  await browser.close();
  if (errs.length) process.exit(1);
})();
