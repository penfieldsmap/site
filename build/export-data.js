// Writes the records, findings, coordinates and references of both maps as plain data files, JSON and CSV.
// The files are generated from the sources in src/. Edit the sources, never the files in data/.
// usage: node export-data.js <src folder> <data folder to write> <records.json from records.js>
const fs = require('fs'), path = require('path');
const [SRC, OUT, RECS] = process.argv.slice(2);
if (!SRC || !OUT || !RECS) { console.error('usage: node export-data.js <src> <data out> <records.json>'); process.exit(2); }
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const SITE = 'https://penfieldsmap.com';
const R = JSON.parse(fs.readFileSync(RECS, 'utf8'));
const must = (ok, what) => { if (!ok) { console.error('export-data: ' + what); process.exit(1); } };
const unent = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// The list of method codes is written in each page as a definition list that includes the code HIST.
function codes(html) {
  const lists = html.match(/<dl>[\s\S]*?<\/dl>/g) || [], dl = lists.filter(d => d.includes('<dt>HIST</dt>'));
  must(dl.length === 1, 'expected one list of method codes');
  const out = {}; let m; const re = /<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g;
  while ((m = re.exec(dl[0]))) out[unent(m[1])] = unent(m[2]);
  return out;
}
const refs = (o) => Object.keys(o).map(k => ({ key: k, short: o[k].s, full: o[k].f, url: o[k].u, how_read: o[k].n }));

// ---------- experience map ----------
const X = new Function(read('experience-data.js') + ';return {PP,SLUG,GROUPS,ENTRIES,LATER,TABLEV,REFS}')();
const T = new Function('BODYURL', 'EXPURL', read('experience-text.js') + ';return {SERIES,METHODS}')('', '');
const zn = read('experience-app.js').match(/^var ZNAME=(\{.*\});\s*$/m); must(zn, 'ZNAME not found in experience-app.js');
const ZNAME = new Function('return ' + zn[1])();
const xcodes = codes(read('experience.html'));
const zone = id => ({ id, name: ZNAME[id] || '' });
X.ENTRIES.forEach(e => { must(R.exp.rec[e.id], 'no page for experience record ' + e.id); (e.z.concat(e.z2)).forEach(z => must(ZNAME[z], 'no name for zone ' + z)); });
X.LATER.forEach(f => { must(xcodes[f.m], 'unknown method code ' + f.m); f.r.forEach(k => must(X.REFS[k], 'unknown reference ' + k)); f.to.forEach(i => must(R.exp.rec[i], 'finding points at unknown record ' + i)); });
const experience = {
  about: 'Experience map of Penfield’s Map, ' + SITE + '/. Generated from src/ by build/export-data.js. Case reports are paraphrases of the case reports in Penfield and Perot 1963 and carry that paper’s case numbers and page numbers.',
  licence: 'CC BY 4.0. Credit: Dargentic Intelligence, Penfield’s Map, ' + SITE,
  layers: X.GROUPS.map(g => ({ key: g.k, name: g.l, short_name: g.s, description: g.t })),
  records: X.ENTRIES.map(e => ({
    id: e.id, address: SITE + R.exp.rec[e.id].url, layer: e.g, title: e.l, plate_label: e.lab,
    term_in_1963_paper: e.term || '', note: e.note || '', count: e.count, site: e.where, side: e.side,
    plate_zones: e.z.map(zone), plate_zones_secondary: e.z2.map(zone),
    extra_references: e.src || [],
    cases: (e.cases || []).map(c => ({ case: c.c, initials: c.i, patient: c.w, side_operated: c.sd, pages: c.p, report: c.t, opens_the_record: e.lead ? c.c === e.lead : c === e.cases[0] }))
  })),
  later_findings: X.LATER.map(f => ({ records: f.to, method: f.m, text: f.t, references: f.r })),
  method_codes: xcodes,
  responses_by_hemisphere: X.TABLEV.map(r => ({ kind: r.k, non_dominant_points: r.nd, non_dominant_patients: r.ndp, dominant_points: r.d, dominant_patients: r.dp })),
  the_1963_series: T.SERIES.map(r => ({ item: r[0], value: r[1] })),
  methods_and_known_gaps: T.METHODS.map(r => ({ heading: r[0], text: r[1] }))
};

// ---------- body map ----------
const bsrc = read('body.html'), A = '/* ---------- body divisions ---------- */', Z = 'var STRIPNAME=';
must(bsrc.split(A).length === 2 && bsrc.split(Z).length === 2, 'data block markers not found once each in body.html');
const D = new Function(bsrc.slice(bsrc.indexOf(A), bsrc.indexOf('\n', bsrc.indexOf(Z))) + ';return {DIV,DIVORDER,REG,SEQ,TOT,REFS,ANN,COORDS,RC,TOPICS,DIFFS,SECT,VER,STRIPNAME}')();
const bcodes = codes(bsrc);
const FIG = { S: 'Sensory figure of 1950 (Fig. 17), postcentral gyrus', M: 'Motor figure of 1950 (Fig. 22), precentral gyrus', G: 'fMRI scheme of 2023, precentral gyrus', X: 'Motor figure of 1950 (Fig. 22), function words' };
const SECTNAME = Object.fromEntries(D.SECT);
Object.keys(D.REG).forEach(id => must(R.body.rec[id], 'no page for body record ' + id));
D.ANN.forEach(f => { must(bcodes[f.m], 'unknown method code ' + f.m); must(SECTNAME[f.s], 'unknown section ' + f.s); f.r.forEach(k => must(D.REFS[k], 'unknown reference ' + k)); f.to.forEach(i => must(D.REG[i], 'finding points at unknown label ' + i)); });
D.COORDS.forEach(c => { must(D.REFS[c.src], 'unknown reference ' + c.src); must(bcodes[c.m], 'unknown method code ' + c.m); });
const body = {
  about: 'Body map of Penfield’s Map, ' + SITE + '/body/. Generated from src/ by build/export-data.js. Labels are those lettered on the two figures of Penfield and Rasmussen 1950, in order from the midline outward, and the six regions of the 2023 fMRI scheme.',
  licence: 'CC BY 4.0. Credit: Dargentic Intelligence, Penfield’s Map, ' + SITE,
  divisions: D.DIVORDER.map(k => ({ key: k, name: D.DIV[k].name })),
  labels: Object.values(D.REG).map(r => ({
    id: r.id, address: SITE + R.body.rec[r.id].url, figure: FIG[r.strip], position_in_figure: r.i + 1, label: r.label, long_label: r.long,
    division: r.div, reading_grade: r.ver || '', note: r.note || '', block_line_mm: (r.w === undefined ? null : r.w), kind_2023: r.kind || '',
    coordinate_ids: D.RC[r.id] || []
  })),
  reading_grades: D.VER,
  block_line_totals_mm: { sensory: D.TOT.S, motor: D.TOT.M },
  sections: D.SECT.map(s => ({ key: s[0], name: s[1] })),
  findings: D.ANN.map(f => ({ section: f.s, method: f.m, labels: f.to, applies_to: f.sl, text: f.t, references: f.r })),
  method_codes: bcodes,
  coordinates: D.COORDS.map(c => ({ id: c.id, strip: c.panel === 'S' ? 'sensory' : 'motor', reference: c.src, method: c.m, code: c.code, label: c.label, x_mm: c.x, y_mm: c.y, z_mm: c.z, sd_x: c.sx, sd_y: c.sy, sd_z: c.sz, n: c.n, division: c.div, note: c.note || '' })),
  coordinates_note: 'MNI space, millimetres. x is given as an absolute value. sd is the standard deviation where the source gives one. n is the number of sites or subjects as the source counts them.',
  differences_between_the_two_1950_figures: D.DIFFS.map(d => ({ topic: d[0], text: d[1], record: d[2] })),
  topics: D.TOPICS.map(t => ({ topic: t[0], record: t[1] }))
};

const references = { about: 'Every source cited on the two maps. how_read says how much of the source was read.', experience: refs(X.REFS), body: refs(D.REFS) };

// ---------- write ----------
fs.mkdirSync(OUT, { recursive: true });
const json = (f, o) => fs.writeFileSync(path.join(OUT, f), JSON.stringify(o, null, 2) + '\n');
const cell = v => { const s = v === null || v === undefined ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const csv = (f, head, rows) => fs.writeFileSync(path.join(OUT, f), [head].concat(rows).map(r => r.map(cell).join(',')).join('\n') + '\n');
json('experience.json', experience); json('body.json', body); json('references.json', references);
csv('cases.csv', ['record', 'record_title', 'case', 'initials', 'patient', 'side_operated', 'pages', 'report', 'address'],
  experience.records.flatMap(r => r.cases.map(c => [r.id, r.title, c.case, c.initials, c.patient, c.side_operated, c.pages, c.report, r.address])));
csv('findings.csv', ['map', 'records', 'section', 'method', 'text', 'references'],
  experience.later_findings.map(f => ['experience', f.records.join(';'), 'Later evidence', f.method, f.text, f.references.join(';')])
    .concat(body.findings.map(f => ['body', f.labels.join(';'), SECTNAME[f.section], f.method, f.text, f.references.join(';')])));
csv('coordinates.csv', ['id', 'strip', 'reference', 'method', 'code', 'label', 'x_mm', 'y_mm', 'z_mm', 'sd_x', 'sd_y', 'sd_z', 'n', 'division', 'note'],
  body.coordinates.map(c => [c.id, c.strip, c.reference, c.method, c.code, c.label, c.x_mm, c.y_mm, c.z_mm, c.sd_x, c.sd_y, c.sd_z, c.n, c.division, c.note]));
csv('references.csv', ['map', 'key', 'short', 'full', 'url', 'how_read'],
  references.experience.map(r => ['experience', r.key, r.short, r.full, r.url, r.how_read]).concat(references.body.map(r => ['body', r.key, r.short, r.full, r.url, r.how_read])));
console.log('data: experience records', experience.records.length, 'cases', experience.records.reduce((a, r) => a + r.cases.length, 0), 'later findings', experience.later_findings.length,
  '| body labels', body.labels.length, 'findings', body.findings.length, 'coordinates', body.coordinates.length, '| references', references.experience.length, '+', references.body.length);
