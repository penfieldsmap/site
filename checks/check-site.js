// Checks the built site. Exits with an error if any check fails.
// usage: node checks/check-site.js [site folder, default public/]
const fs = require('fs'), path = require('path');
const { serve, launch } = require('../build/lib');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..', 'public'));
const PAGES = ['/', '/body/', '/body/fig-2/', '/body/fig-3/', '/about/', '/methods/', '/references/', '/records/'];
const DESK = { viewport: { width: 1440, height: 900 } }, PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true };
const fails = []; let passed = 0;
const check = (ok, what) => { if (ok) { passed++; } else { fails.push(what); console.log('FAIL', what); } };

(async () => {
  const srv = await serve(root), B = srv.url, browser = await launch();
  const errs = [];
  const hook = (p, tag) => {
    p.on('console', m => { if (m.type() === 'error') errs.push(tag + ' console: ' + m.text()); });
    p.on('pageerror', e => errs.push(tag + ' page error: ' + e.message));
    p.on('response', r => { if (r.status() >= 400) errs.push(tag + ' ' + r.status() + ' ' + r.url().replace(B, '')); });
  };

  // 1. Every main page loads cleanly on a wide and a narrow screen.
  for (const [tag, ctx] of [['desktop', DESK], ['phone', PHONE]]) {
    const p = await (await browser.newContext(ctx)).newPage(); hook(p, tag);
    for (const u of PAGES) {
      await p.goto(B + u); await p.waitForTimeout(450);
      const i = await p.evaluate(() => ({
        over: document.documentElement.scrollWidth - document.documentElement.clientWidth, title: document.title, h1: document.querySelectorAll('h1').length,
        home: (document.querySelector('header.top h1 a') || { getAttribute: () => '' }).getAttribute('href'),
        stamp: (document.body.textContent.match(/updated \d{4}-\d{2}-\d{2}/g) || []).length
      }));
      check(i.over <= 0, tag + ' ' + u + ' is wider than the screen by ' + i.over + 'px');
      check(i.title.length > 10 && i.h1 === 1, tag + ' ' + u + ' needs a title and one main heading');
      check(i.home === '/', tag + ' ' + u + ': the title at the top left leads to the home page');
      check(i.stamp === 1, tag + ' ' + u + ' carries the date line ' + i.stamp + ' times in its text, expected once');
    }
    await p.context().close();
  }

  // 2. Every record page says what the map says for that record. 3. Every internal link leads somewhere.
  const dctx = await browser.newContext(DESK), map = await dctx.newPage(), rec = await dctx.newPage(); hook(map, 'map'); hook(rec, 'record');
  const strip = () => { const c = document.getElementById('record').cloneNode(true); c.querySelectorAll('.rec-act, .perm, .fc, .cite').forEach(e => e.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); };
  const hrefs = new Set(), urls = []; let same = 0;
  const collect = async pg => (await pg.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href')))).forEach(h => { if (h.charAt(0) === '/') hrefs.add(h.split('#')[0]); });
  for (const base of ['/', '/body/']) {
    await map.goto(B + base); await map.waitForTimeout(500);
    const list = await map.evaluate(() => window.__E ? window.__E.ENTRIES.map(e => [e.id, '/experience/' + window.__E.SLUG[e.id] + '/']) : Object.keys(window.__D.REG).map(i => [i, '/body/' + window.__D.recPath(i) + '/']));
    for (const [id, url] of list) {
      await map.evaluate(i => { location.hash = i; }, id); await map.waitForTimeout(35);
      const a = await map.evaluate(strip);
      await rec.goto(B + url); const b = await rec.evaluate(strip);
      if (a === b && a.length > 100) { same++; } else { check(false, 'record page ' + url + ' differs from the record on the map'); }
      urls.push(url); await collect(rec);
    }
  }
  check(same === urls.length && same > 0, 'record pages matching the map: ' + same + ' of ' + urls.length);
  await rec.goto(B + '/records/'); await collect(rec);
  const listed = await rec.evaluate(() => Array.from(document.querySelectorAll('.idx a')).map(a => a.getAttribute('href')));
  check(urls.every(u => listed.includes(u)), 'the index of records lists every record page');
  const dead = []; for (const h of hrefs) { const r = await rec.request.get(B + h); if (r.status() !== 200) dead.push(h); }
  check(dead.length === 0, 'dead internal links: ' + JSON.stringify(dead));

  // 4. The record pages can be read with scripts turned off.
  const n = await (await browser.newContext(Object.assign({ javaScriptEnabled: false }, DESK))).newPage();
  for (const u of urls.concat(['/records/'])) {
    await n.goto(B + u);
    const i = await n.evaluate(() => ({ words: document.body.innerText.split(/\s+/).length, plate: !!document.querySelector('#fig1 svg path') }));
    check(i.words > 100 && (u === '/records/' || i.plate), 'without scripts ' + u + ' shows ' + i.words + ' words, plate drawn: ' + i.plate);
  }

  // 5. A sample of record pages fits a narrow screen.
  const m = await (await browser.newContext(PHONE)).newPage(); hook(m, 'phone record');
  for (const u of urls.filter((_, k) => k % 6 === 0)) {
    await m.goto(B + u); await m.waitForTimeout(250);
    const over = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(over <= 0, 'phone ' + u + ' is wider than the screen by ' + over + 'px');
  }

  // 6. Every address in the sitemap is a file in the build, and every record page is in the sitemap.
  const sm = (fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').match(/<loc>[^<]+<\/loc>/g) || []).map(l => l.slice(5, -6).replace('https://penfieldsmap.com', ''));
  check(sm.every(u => fs.existsSync(path.join(root, u, 'index.html'))), 'every sitemap address exists in the build');
  check(urls.every(u => sm.includes(u)), 'every record page is in the sitemap');

  // 7. The title plate is the top of the home page on arrival, with the start of the map in view under it. Its link
  //    goes to the map. The plate shows every time the page is opened; only a link that points at a record starts at
  //    the map. With scripts turned off the plate is plain content.
  const shown = pg => pg.evaluate(() => { const c = document.getElementById('plate'); return !!c && getComputedStyle(c).display !== 'none'; });
  for (const [tag, ctx] of [['desktop', DESK], ['phone', PHONE]]) {
    const tp = await (await browser.newContext(ctx)).newPage(); hook(tp, 'plate ' + tag);
    await tp.goto(B + '/'); await tp.waitForTimeout(500);
    const g = await tp.evaluate(() => ({ plate: document.getElementById('plate').getBoundingClientRect().bottom, lede: document.getElementById('lede').getBoundingClientRect().top, h: innerHeight, y: pageYOffset }));
    check(await shown(tp) && g.y === 0 && g.lede < g.h - 30, tag + ': the title plate shows on arrival and the map starts on the first screen (plate ends at ' + Math.round(g.plate) + ' of ' + g.h + 'px)');
    await tp.click('#plate-go'); await tp.waitForTimeout(1200);
    const j = await tp.evaluate(() => ({ lede: document.getElementById('lede').getBoundingClientRect().top, head: document.querySelector('header.top').getBoundingClientRect().bottom, hash: location.hash }));
    check(Math.abs(j.lede - j.head) < 4, tag + ': the link on the plate goes to the map (map starts ' + Math.round(j.lede - j.head) + 'px under the header)');
    await tp.reload(); await tp.waitForTimeout(400);
    check(await shown(tp), tag + ': the plate is still there when the page is loaded again after it has been scrolled past');
    await tp.context().close();
  }
  // 8. Choosing a case from the top of the home page brings the map into view once, with the opening lines under the
  //    header; the next choice does not move the page. On the body map a choice at the top does not move the page.
  const st = await (await browser.newContext(DESK)).newPage(); hook(st, 'settle');
  await st.goto(B + '/'); await st.waitForTimeout(500);
  await st.click('.lede .try a[data-id="music"]'); await st.waitForTimeout(1300);
  const s1 = await st.evaluate(() => ({ y: Math.round(pageYOffset), gap: Math.round(document.getElementById('lede').getBoundingClientRect().top - document.querySelector('header.top').getBoundingClientRect().bottom), rec: document.querySelector('#record h2').textContent }));
  check(Math.abs(s1.gap) < 4 && s1.rec === 'Music', 'a case chosen from the top brings the map into view with the opening lines under the header (gap ' + s1.gap + 'px, record ' + s1.rec + ')');
  await st.click('.lede .try a[data-id="fear"]'); await st.waitForTimeout(900);
  const s2 = await st.evaluate(() => ({ y: Math.round(pageYOffset), rec: document.querySelector('#record h2').textContent }));
  check(s2.y === s1.y && s2.rec === 'Fear', 'the next choice changes the record without moving the page (' + s1.y + ' then ' + s2.y + ')');
  await st.goto(B + '/body/'); await st.waitForTimeout(500);
  const b0 = await st.evaluate(() => { const ids = Object.keys(window.__D.REG); location.hash = ids[5]; return Math.round(pageYOffset); }); await st.waitForTimeout(600);
  check(b0 === 0 && await st.evaluate(() => Math.round(pageYOffset)) === 0, 'a choice at the top of the body map does not move the page');
  await st.context().close();

  const tp2 = await (await browser.newContext(DESK)).newPage(); hook(tp2, 'plate'); await tp2.goto(B + '/#music'); await tp2.waitForTimeout(400);
  check(!(await shown(tp2)), 'a link that points at a record starts at the map');
  await n.goto(B + '/'); check(await shown(n) && await n.evaluate(() => !!document.querySelector('#plate a[href="#map"]') && !!document.getElementById('map')), 'with scripts turned off the plate is plain content with a link to the map');

  // 9. Every page ends with a link back to its top. It returns to the top and leaves the address alone, so a record or a
  //    section chosen through the address stays chosen. With scripts turned off it is still a link to the top.
  for (const [tag, ctx] of [['desktop', DESK], ['phone', PHONE]]) {
    const t = await (await browser.newContext(Object.assign({ reducedMotion: 'reduce' }, ctx))).newPage(); hook(t, 'top ' + tag);
    for (const u of PAGES.concat([urls[0].replace(B, ''), '/#music', '/references/#body'])) {
      await t.goto(B + u); await t.waitForTimeout(350);
      await t.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await t.waitForTimeout(150);
      const was = await t.evaluate(() => ({ y: Math.round(pageYOffset), n: document.querySelectorAll('.foot a.totop').length, href: location.href }));
      if (was.n === 1) { await t.click('.foot a.totop'); await t.waitForTimeout(250); }
      const now = await t.evaluate(() => ({ y: Math.round(pageYOffset), href: location.href, body: (document.getElementById('body') || {}).hidden }));
      check(was.n === 1 && was.y > 0 && now.y === 0 && now.href === was.href, tag + ' ' + u + ' the link at the foot returns to the top and keeps the address (links ' + was.n + ', from ' + was.y + ' to ' + now.y + ', ' + now.href.replace(B, '') + ')');
      if (u === '/references/#body') check(now.body === false, tag + ' ' + u + ' the section chosen through the address is still shown after going back to the top');
    }
    await t.context().close();
  }
  await n.goto(B + '/about/'); check(await n.evaluate(() => { const a = document.querySelector('.foot a.totop'); return !!a && a.getAttribute('href') === '#'; }), 'with scripts turned off the link at the foot still leads to the top of the page');

  // 10. The body map has three figures, each on its own page, and one toggle that sits in the same place on all three.
  //     The page that is open is the one marked. The old address of Figs 2 and 3 still leads to them.
  for (const [tag, ctx] of [['desktop', DESK], ['phone', PHONE]]) {
    const f = await (await browser.newContext(ctx)).newPage(); hook(f, 'figures ' + tag); const at = [];
    for (const [u, n, own] of [['/body/', '1', 'fig1'], ['/body/fig-2/', '2', 'fig2'], ['/body/fig-3/', '3', 'fig3']]) {
      await f.goto(B + u); await f.waitForTimeout(450);
      const i = await f.evaluate(own => { const a = Array.from(document.querySelectorAll('#tools .g-fig a')), r = a.length ? a[0].getBoundingClientRect() : { left: -1, top: -1 };
        const drawn = id => { const e = document.getElementById(id); return !!e && !!e.querySelector('svg') && e.getBoundingClientRect().height > 100; };
        return { hrefs: a.map(x => x.getAttribute('href')).join(' '), cur: a.filter(x => x.getAttribute('aria-current') === 'page').map(x => x.getAttribute('data-fig')).join(','), x: Math.round(r.left), y: Math.round(r.top), own: drawn(own), others: ['fig1', 'fig2', 'fig3'].filter(k => k !== own && drawn(k)).join(',') }; }, own);
      at.push(i.x + ',' + i.y);
      check(i.hrefs === '/body/ /body/fig-2/ /body/fig-3/' && i.cur === n && i.own && i.others === '', tag + ' ' + u + ' shows its own figure only and marks it on the toggle (links ' + i.hrefs + ', marked ' + i.cur + ', drawn ' + i.own + ', others ' + i.others + ')');
    }
    check(at[0] === at[1] && at[1] === at[2], tag + ': the figure toggle sits in the same place on the three pages (' + at.join(' | ') + ')');
    await f.goto(B + '/body/'); await f.waitForTimeout(350); await f.click('#tools .g-fig a[data-fig="3"]'); await f.waitForTimeout(600);
    check(new URL(f.url()).pathname === '/body/fig-3/', tag + ': the toggle on the body map opens Fig. 3 (' + f.url().replace(B, '') + ')');
    await f.click('#tools .g-fig a[data-fig="1"]'); await f.waitForTimeout(600);
    check(new URL(f.url()).pathname === '/body/', tag + ': the toggle on Fig. 3 goes back to Fig. 1 (' + f.url().replace(B, '') + ')');
    await f.context().close();
  }
  const old = await (await browser.newContext(DESK)).newPage();
  await old.goto(B + '/body/figures/'); await old.waitForTimeout(900); check(new URL(old.url()).pathname === '/body/fig-2/', 'the old address of the figures leads to Fig. 2 (' + old.url().replace(B, '') + ')');
  await old.goto(B + '/body/figures/#p3'); await old.waitForTimeout(900); check(new URL(old.url()).pathname === '/body/fig-3/', 'the old address with the anchor of Fig. 3 leads to Fig. 3 (' + old.url().replace(B, '') + ')');
  await old.context().close();

  // 11. "Experience map" in the menu goes straight to the map, as "Body map" does. The title at the top left is the way
  //     to the home page with its title plate.
  for (const [tag, ctx] of [['desktop', DESK], ['phone', PHONE]]) {
    const m = await (await browser.newContext(ctx)).newPage(); hook(m, 'menu ' + tag);
    const gap = () => m.evaluate(() => Math.round(document.getElementById('lede').getBoundingClientRect().top - document.querySelector('header.top').getBoundingClientRect().bottom));
    const under = g => g >= -4 && g < 60;   // the opening lines start just under the header (the phone shows the date line between them)
    for (const u of PAGES.concat([urls[0].replace(B, '')])) {
      await m.goto(B + u); await m.waitForTimeout(300);
      const h = await m.evaluate(() => (document.querySelector('header.top nav.menu a') || { getAttribute: () => '' }).getAttribute('href'));
      check(h === '/#map', tag + ' ' + u + ' the menu link to the experience map points at the map (' + h + ')');
    }
    await m.goto(B + '/about/'); await m.waitForTimeout(300); await m.click('header.top nav.menu a'); await m.waitForTimeout(900);
    const g1 = await gap(); check(new URL(m.url()).pathname === '/' && !(await shown(m)) && under(g1), tag + ': "Experience map" from another page opens at the map, without the title plate (plate shown ' + (await shown(m)) + ', opening lines ' + g1 + 'px under the header)');
    await m.click('header.top h1 a'); await m.waitForTimeout(900);
    check(await shown(m) && await m.evaluate(() => pageYOffset === 0), tag + ': the title at the top left opens the home page with its title plate');
    await m.click('header.top nav.menu a'); await m.waitForTimeout(900);
    const g2 = await gap(); check(under(g2), tag + ': "Experience map" on the home page moves down to the map (opening lines ' + g2 + 'px under the header)');
    await m.context().close();
  }

  // 12. Both maps open the same way: opening lines and a start row above the tool bar, with the whole plate on the first
  //     screen. The text pages share one layout: a title, sections in boxes, and on About the two maps as pictures.
  const o = await (await browser.newContext(DESK)).newPage(); hook(o, 'openings');
  for (const u of ['/#map', '/body/']) {
    await o.goto(B + u); await o.waitForTimeout(600);
    const i = await o.evaluate(() => { const l = document.getElementById('lede'), t = document.getElementById('tools'), p = document.getElementById('p1').getBoundingClientRect(), h = document.querySelector('header.top').getBoundingClientRect();
      return { lede: !!l && l.textContent.length > 200, gap: Math.round(l.getBoundingClientRect().top - h.bottom), order: l.getBoundingClientRect().bottom <= t.getBoundingClientRect().top + 1, starts: l.querySelectorAll('.try a[data-id]').length, fits: p.bottom <= innerHeight + 1 && p.height > 300 }; });
    check(i.lede && Math.abs(i.gap) < 4 && i.order && i.starts >= 5 && i.fits, 'desktop ' + u + ' opens on its opening lines, start row and tool bar, with the whole plate on screen (' + JSON.stringify(i) + ')');
  }
  await o.goto(B + '/body/'); await o.waitForTimeout(500); await o.click('.lede .try a[data-id="sen-tongue"]'); await o.waitForTimeout(700);
  const bt = await o.evaluate(() => ({ rec: document.querySelector('#record h2').textContent, y: Math.round(pageYOffset), on: document.querySelector('.lede .try a.on').textContent }));
  check(bt.rec === 'Tongue' && bt.y === 0 && bt.on === 'Tongue', 'the start row on the body map opens a record without moving the page (' + JSON.stringify(bt) + ')');
  await o.goto(B + '/about/'); await o.waitForTimeout(500); await o.evaluate(() => window.scrollTo(0, 500)); await o.waitForTimeout(700);
  const ab = await o.evaluate(() => ({ cards: Array.from(document.querySelectorAll('.mapcard')).map(c => c.querySelector('h3 a').getAttribute('href') + ' ' + (c.querySelector('img').naturalWidth > 0)).join(' | '), boxes: document.querySelectorAll('main.read .box').length, old: document.querySelectorAll('main .doc').length }));
  check(ab.cards === '/#map true | /body/ true' && ab.boxes >= 8 && ab.old === 0, 'About shows the two maps as pictures that lead to them, and its sections in boxes (' + JSON.stringify(ab) + ')');
  for (const u of ['/methods/', '/references/', '/records/']) { await o.goto(B + u); await o.waitForTimeout(350);
    const t = await o.evaluate(() => ({ read: !!document.querySelector('main.read .phead h2'), old: document.querySelectorAll('main .doc').length, refs: Array.from(document.querySelectorAll('.reflist')).map(l => l.children.length).join(','), idx: document.querySelectorAll('.idx a').length }));
    check(t.read && t.old === 0 && (u !== '/references/' || /^\d+,\d+$/.test(t.refs)) && (u !== '/records/' || t.idx === urls.length), u + ' uses the shared layout of the text pages (' + JSON.stringify(t) + ')'); }
  await o.context().close();

  // 13. In a body record, findings specific to the label come before those that apply to every label, which are folded
  //     on the map when there is something specific above them and shown in full on the record's own page.
  const sp = await (await browser.newContext(DESK)).newPage(); hook(sp, 'specific first');
  await sp.goto(B + '/body/#mot-hand'); await sp.waitForTimeout(700);
  const so = await sp.evaluate(() => { const sec = document.querySelector('#record .sect'), kids = Array.from(sec.children).filter(e => e.classList.contains('row') || e.tagName === 'DETAILS');
    const d = sec.querySelector('details.strip'); return { firstScope: (sec.querySelector('.row .sc') || {}).textContent, lastIsFold: !!kids.length && kids[kids.length - 1].tagName === 'DETAILS', open: d ? d.open : null, inside: d ? Array.from(d.querySelectorAll('.sc')).every(x => /^Applies to: all /.test(x.textContent)) : false, outside: Array.from(sec.querySelectorAll(':scope > .row .sc')).every(x => !/^Applies to: all /.test(x.textContent)) }; });
  check(so.lastIsFold && so.open === false && so.inside && so.outside && !/^Applies to: all /.test(so.firstScope), 'body map: a record lists what is specific to the label first and folds what applies to every label (' + JSON.stringify(so) + ')');
  await sp.goto(B + '/body/motor/hand/'); await sp.waitForTimeout(400);
  check(await sp.evaluate(() => { const d = document.querySelector('details.strip'); return !!d && d.open && d.getBoundingClientRect().height > 60; }), 'record page: the findings that apply to every label are shown in full');
  await sp.context().close();

  check(errs.length === 0, 'errors while loading pages: ' + JSON.stringify(errs.slice(0, 8)));
  await browser.close(); srv.close();
  console.log((fails.length ? 'FAILED ' + fails.length + ' of ' : 'passed all ') + (passed + fails.length) + ' checks: ' + PAGES.length + ' pages on two screens, ' + urls.length + ' record pages, ' + hrefs.size + ' internal links, ' + sm.length + ' sitemap addresses');
  process.exit(fails.length ? 1 : 0);
})();
