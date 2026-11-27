// Draws the two small pictures of the maps shown on the About page, from the built site.
// Run by hand after a change to either plate:  node build/about-thumbs.js   (then build again)
const fs = require('fs'), path = require('path');
const { serve, launch } = require('./lib');
const SITE = path.join(__dirname, '..', 'public'), OUT = path.join(__dirname, '..', 'src', 'static', 'about');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serve(SITE), browser = await launch();
  for (const [url, name] of [['/#map', 'map-experience'], ['/body/', 'map-body']]) {
    // the narrow layout draws the plate without its small lettering, which suits a small picture
    const p = await (await browser.newContext({ viewport: { width: 560, height: 1000 }, deviceScaleFactor: 2 })).newPage();
    await p.goto(srv.url + url); await p.waitForTimeout(900);
    await p.addStyleTag({ content: '.zoomb,#m-zoom{display:none!important}' });
    const r = await p.evaluate(() => { const b = document.querySelector('#fig1 svg').getBoundingClientRect(); return { x: b.left + 2, y: b.top + window.pageYOffset + 2, width: b.width - 4, height: b.height - 4 }; });   // inside the frame
    const png = await p.screenshot({ type: 'png', clip: r, fullPage: true });
    for (const w of [1040, 520]) {
      const b64 = await p.evaluate(async ([src, w]) => { const im = new Image(); im.src = 'data:image/png;base64,' + src; await im.decode();
        const c = document.createElement('canvas'); c.width = w; c.height = Math.round(im.height * w / im.width); const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, c.width, c.height);
        return [c.toDataURL('image/webp', 0.95).split(',')[1], c.width, c.height]; }, [png.toString('base64'), w]);
      fs.writeFileSync(path.join(OUT, name + '-' + w + '.webp'), Buffer.from(b64[0], 'base64')); console.log(name + '-' + w + '.webp', b64[1] + 'x' + b64[2], Math.round(Buffer.from(b64[0], 'base64').length / 1024) + ' KB');
    }
    await p.context().close();
  }
  await browser.close(); srv.close();
})();
