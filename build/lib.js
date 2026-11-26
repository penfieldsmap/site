// Shared by the build and check scripts: a small static file server and a browser launcher.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const TYPES = { '.html': 'text/html; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.json': 'application/json', '.js': 'text/javascript' };

// Serves a folder on a free local port. An address ending in a slash gets that folder's index.html.
function serve(root) {
  return new Promise(resolve => {
    const srv = http.createServer((q, r) => {
      let p = path.join(root, decodeURIComponent(q.url.split('?')[0].split('#')[0]));
      if (p.endsWith(path.sep) || p.endsWith('/')) p += 'index.html';
      fs.readFile(p, (e, d) => {
        if (e) { r.writeHead(404); r.end('not found'); }
        else { r.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); r.end(d); }
      });
    });
    srv.listen(0, '127.0.0.1', () => resolve({ url: 'http://127.0.0.1:' + srv.address().port, close: () => srv.close() }));
  });
}

// Uses the Chromium that Playwright installs. Set CHROME to the path of another Chrome or Chromium to use that instead.
// Set NO_SANDBOX=1 where the browser has to run without its sandbox, for example as root in a container.
function launch() {
  const opt = {};
  if (process.env.CHROME) opt.executablePath = process.env.CHROME;
  if (process.env.NO_SANDBOX) opt.args = ['--no-sandbox'];
  return chromium.launch(opt);
}

module.exports = { serve, launch };
