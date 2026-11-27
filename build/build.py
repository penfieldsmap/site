# Builds the site from the sources in src/ into public/ (what the web host serves) and preview/ (opens from disk).
# usage: python3 build/build.py        see README.md for what it needs
import re, shutil, os, io, json, subprocess, sys
from urllib.parse import quote
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
SRC=os.path.join(ROOT,'src'); STATIC=os.path.join(SRC,'static'); WORK=os.path.join(HERE,'.work')
SITE=os.environ.get('OUT_DIR') or os.path.join(ROOT,'public'); PREVIEW=os.path.join(ROOT,'preview')
# ---------- settings ----------
UPDATED='2026-11-27'; DATE_LONG='27 November 2026'   # the date shown on every page; src/body.html and src/experience.html carry the same stamp
MAIL='suggestions@penfieldsmap.com'
REPO='https://github.com/penfieldsmap/site'
# The footer says the site is open source and every record page links to the two issue forms of the repository.
OPEN_SOURCE=True
def rd(f): return io.open(os.path.join(SRC,f),encoding='utf-8').read()
def node(script,*args):
    r=subprocess.run(['node',os.path.join(HERE,script)]+list(args),capture_output=True,text=True)
    print(r.stdout.strip(), r.stderr.strip()[:600])
    if r.returncode!=0: sys.exit('%s failed'%script)
    return r.stdout
def wr(f,s):
    os.makedirs(os.path.dirname(f),exist_ok=True); io.open(f,'w',encoding='utf-8').write(s)
body_src=rd('body.html'); exp_src=rd('experience.html')
STAMP='updated %s'%UPDATED
assert STAMP in body_src and STAMP in exp_src, 'the date in src/body.html and src/experience.html must match UPDATED'
FONTLINK='<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,500;0,700;1,400;1,700&amp;display=swap" rel="stylesheet">'
FF=''.join("@font-face{font-family:\"Libre Baskerville\";font-style:%s;font-weight:%d;font-display:swap;src:url(\"/fonts/libre-baskerville-latin-%d-%s.woff2\") format(\"woff2\")}\n"%(st,w,w,st) for w,st in ((400,'normal'),(400,'italic'),(500,'normal'),(700,'normal'),(700,'italic')))   # 500 is the weight of the headings
# Every page ends with a link back to its top. The address is left alone: a hash chooses a record or a section on these pages.
TOPJS="<script>(function(){var a=document.querySelector('.foot .totop');if(!a){return;}a.addEventListener('click',function(e){e.preventDefault();var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;try{window.scrollTo({top:0,behavior:still?'auto':'smooth'});}catch(x){window.scrollTo(0,0);}var h=document.querySelector('header.top h1 a');if(h){try{h.focus({preventScroll:true});}catch(x){}}});})();</script>"
FOOT='<footer class="foot"><a class="totop" href="#">Back to top</a> <div class="ft"><p>An interactive reference and research companion to Velco Dar’s <a href="https://neuralthebook.com/" rel="noopener"><cite>NEURAL: How Brain-Computer Interfaces Will Redefine Commerce and Power</cite></a>.</p> <p>Published and maintained by <a href="https://www.dargentic.com" rel="noopener">Dargentic Intelligence</a>. %s © 2026 Dargentic Pty Ltd. <a href="@RECS@">Index of records</a>. Corrections: <a href="mailto:%s">%s</a></p></div></footer>\n'+TOPJS+'\n\n'
FOOT=FOOT%(('<a href="%s" rel="noopener">Open source</a>, not peer reviewed.'%REPO) if OPEN_SOURCE else 'Not peer reviewed.',MAIL,MAIL)
FOOTCSS='.foot{font-size:11px;color:var(--ink2)}\n.foot .ft{padding:12px 16px 16px}\n.foot p{margin:0}\n.foot p+p{margin-top:5px}\n.foot .totop{display:block;padding:9px 16px;background:var(--ink);color:var(--bg);font-size:12.5px;text-decoration:none}\n.foot .totop:hover{text-decoration:underline;text-underline-offset:3px}\n.foot .totop:focus-visible{outline:2px solid var(--bg);outline-offset:-5px}\n@media (max-width:1020px){.foot .totop{padding:13px 16px}}\n'
PAGECSS='''
/* ---------- standalone pages ---------- */
.pg{min-height:60vh}
.pg .doc:first-child{border-top:0}
.pg [id]{scroll-margin-top:96px}
.pg .about>div+div>h3:first-child{margin-top:24px}
.pg .lk{color:var(--link)}
.jump{margin:0;padding:12px 16px 0;font-size:11.5px;font-style:italic;color:var(--ink2)}
.jump a{margin-right:16px;white-space:nowrap}
.reflist{list-style:none;padding:0;margin:0;font-size:11.5px;max-width:118ch}
.reflist li{padding:3px 0 3px 2em;text-indent:-2em}
.reflist .rn{color:var(--ink2);font-style:italic}
.reflist a{overflow-wrap:anywhere}
.refbar{position:static}
.refbar+.doc,.refbar+[hidden]+.doc{border-top:0}
@media (max-width:1020px){.refbar .lbl{display:none}.refbar .seg2{display:flex;flex:1 1 auto}.refbar .grp{flex:1 1 auto;display:flex}.refbar .seg2 button{flex:1 1 50%;padding:6px 8px;font-size:12px}}
.pg [hidden]{display:none}
@media print{.refbar{display:none}.pg section[hidden]{display:grid}}
@media (max-width:1020px){.pg .about>div+div>h3:first-child{margin-top:14px}}
'''
OGALT='The title Penfield’s Map beside a picture of a preserved brain seen from the side, with numbered paper tickets on it. The picture is an illustration, not an archival photograph; Wilder Penfield laid such tickets on the cortex at each point that answered his electrode.'
def one(s,a,b):
    assert s.count(a)==1,(a[:60],s.count(a)); return s.replace(a,b)
def head(title,desc,url,ogt,ogd):
    return '''<title>%s</title>
<meta name="description" content="%s">
<link rel="canonical" href="%s">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#f3efe4">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Penfield’s Map">
<meta property="og:title" content="%s">
<meta property="og:description" content="%s">
<meta property="og:url" content="%s">
<meta property="og:image" content="https://penfieldsmap.com/og.jpg?v=2">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="%s">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="%s">
<meta name="twitter:description" content="%s">
<meta name="twitter:image" content="https://penfieldsmap.com/og.jpg?v=2">
<meta name="twitter:image:alt" content="%s">
'''%(title,desc,url,ogt,ogd,url,OGALT,ogt,ogd,OGALT)
def css_of(s): a=s.index('<style>\n')+8; b=s.index('</style>'); return s[a:b]
def defs_of(s): a=s.index('<svg width="0" height="0"'); b=s.index('</svg>',a)+6; return s[a:b]
def alldefs(s): return '\n'.join(m.group(0) for m in re.finditer(r'<svg width="0" height="0".*?</svg>',s,flags=re.S))
def assemble_exp(body_final):
    s=exp_src
    s=one(s,'/*@SHARED_CSS@*/',css_of(body_final)); s=one(s,'<!--@DEFS@-->',defs_of(body_final))
    s=one(s,'/*@DATA@*/',rd('experience-data.js')); s=one(s,'/*@TEXT@*/',rd('experience-text.js')); s=one(s,'/*@APP@*/',rd('experience-app.js'))
    return s
def links(s,fl,depth):
    if fl=='site': m={'EXP':'/','BODY':'/body/','FIGTWO':'/body/fig-2/','FIGTHREE':'/body/fig-3/','ABOUT':'/about/','METHODS':'/methods/','REFS':'/references/','RECS':'/records/','XPRE':'/experience/','BPRE':'/body/','XSUF':'/'}
    else:
        pre='../'*depth
        m={'EXP':pre+'index.html','BODY':pre+'body/index.html','FIGTWO':pre+'body/fig-2/index.html','FIGTHREE':pre+'body/fig-3/index.html','ABOUT':pre+'about/index.html','METHODS':pre+'methods/index.html','REFS':pre+'references/index.html','RECS':pre+'records/index.html','XPRE':pre+'experience/','BPRE':pre+'body/','XSUF':'/index.html'}
    for k,v in m.items(): s=s.replace('@'+k+'@',v)
    assert not re.search(r'@[A-Z_]+@',s), re.search(r'@[A-Z_]+@',s)
    return s
def site_head(s,h):
    a=s.index('<title>'); b=s.index('<style>'); return s[:a]+h+s[b:]
def cut(s):
    a=s.index('<section class="doc about" id="about">')
    b=s.index('<footer class="foot">') if '<footer class="foot">' in s else s.index('<div id="status"')
    return s[:a]+s[b:]
# The body map has three figures, each on its own page, with one toggle in the tool bar that sits in the same place on all three.
FIGPAGE={2:('fig-2','Penfield’s body map: label sequences compared','Fig. 2 of the body map. The label sequences of the two 1950 figures side by side, with the 2023 fMRI scheme of effector and inter-effector regions on the precentral gyrus.'),
         3:('fig-3','Penfield’s body map: measured positions','Fig. 3 of the body map. Positions from direct electrical stimulation in awake surgery and from group fMRI, in MNI space, with the table of values.')}
def mapv(s):
    a=s.index('    <section class="panel" id="p2">'); b=s.index('</main>'); assert a<b
    return one(s[:a]+s[b:],'data-fig="1"','data-fig="1" aria-current="page"')
def figv(s,fl,n):
    a2=s.index('    <section class="panel" id="p2">'); a3=s.index('    <section class="panel" id="p3">'); b=s.index('</main>'); assert a2<a3<b
    s=s[:a3]+s[b:] if n==2 else s[:a2]+s[a3:]
    slug,title,desc=FIGPAGE[n]
    s=one(s,'<body>','<body class="figs fig%d">'%n)
    s=one(s,'data-fig="%d"'%n,'data-fig="%d" aria-current="page"'%n)
    s=one(s,'<h2><b>Fig. 1.</b> <span>Key and notes</span></h2>','<h2><b>Key.</b> <span>Colours and encoding</span></h2>')
    s=one(s,'The map on this page is drawn by a script.','The figure on this page is drawn by a script.')
    if fl=='site':
        s=site_head(s,head(title,desc,'https://penfieldsmap.com/body/%s/'%slug,'Penfield’s Map: the body map, Fig. %d'%n,desc))
        s=one(s,'<style>\n','<style>\n'+FF)
    else:
        s=one(s,'<title>Penfield’s Map: body map</title>','<title>Penfield’s Map: body map, Fig. %d</title>'%n)
    return s
T_EXP='Penfield’s Map: what stimulating the brain made patients hear, see and feel'
D_EXP='An interactive reference to what Wilder Penfield’s patients reported when their temporal lobes were stimulated: voices, music, scenes, memories, fear. Case by case from the 1963 summary, with later evidence and sources.'
OG_D='Voices, music, scenes, memories and fear from electrical stimulation of the brain. The 1963 cases and the 1950 body map, with later evidence and sources.'
# ---------- stage A: full pages, link tokens left in ----------
full={}
ab=one(body_src,'<title>Penfield Somatotopy Map</title>','<title>Penfield’s Map: body map</title>')
ae=one(assemble_exp(body_src),'<!--@FONTLINK@-->',FONTLINK)
full['preview']={'exp':ae,'body':ab}
db=site_head(body_src,head('Penfield’s body map: the sensory and motor homunculus, label by label',
 'An interactive reference to Wilder Penfield’s 1950 sensory and motor maps of the cortex. Every label on the two figures, with later stimulation, imaging and clinical evidence, measured coordinates and sources.',
 'https://penfieldsmap.com/body/','Penfield’s Map: the body map','Wilder Penfield’s 1950 sensory and motor maps of the cortex, label by label, with later evidence and sources.'))
assert 'fonts.googleapis' not in db
db=one(db,'<style>\n','<style>\n'+FF)
db=one(db,'<div id="status" role="status">',FOOT+'<div id="status" role="status">')
db=one(db,'.narrow{display:none}\n.docfull',FOOTCSS+'.narrow{display:none}\n.docfull')
de=site_head(assemble_exp(db),head(T_EXP,D_EXP,'https://penfieldsmap.com/','Penfield’s Map',OG_D))
de=one(de,'<div id="status" role="status">',FOOT+'<div id="status" role="status">')
assert 'fonts.googleapis' not in de and '@FONTLINK@' not in de
full['site']={'exp':de,'body':db}
# the figures page for the live site: same source, its own head
figsite={}
for n in (2,3):
    fd=figv(body_src,'site',n)
    fd=one(fd,'<div id="status" role="status">',FOOT+'<div id="status" role="status">')
    fd=one(fd,'.narrow{display:none}\n.docfull',FOOTCSS+'.narrow{display:none}\n.docfull')
    assert 'fonts.googleapis' not in fd
    figsite[n]=cut(fd)
FULL=os.path.join(WORK,'full'); shutil.rmtree(FULL,ignore_errors=True)
wr(FULL+'/index.html',de); wr(FULL+'/body/index.html',db)
node('capture.js',FULL,os.path.join(WORK,'frag.json'))
F=json.load(io.open(os.path.join(WORK,'frag.json'),encoding='utf-8'))
# ---------- stage B: standalone pages ----------
k='<h3>The 1937 and 1950 figures</h3>'; a=F['body']['aA']; assert a.count(k)==1
bio=one(a[:a.index(k)],'<h2>About this map</h2>',''); body_figs=a[a.index(k):]
k='<h3>What the temporal lobe gave</h3>'; a=F['exp']['aA']; assert a.count(k)==1
exp_left=a[a.index(k):]
assert bio.count('<p')==3 and 'The responses on the experience map were recorded' in bio
ABOUT='''<p class="jump">On this page: <a href="#penfield">Wilder Penfield</a> <a href="#experience">The experience map</a> <a href="#body">The body map</a></p>
<section class="doc about" id="penfield">
  <div><h2>About</h2>'''+bio+'''</div>
  <div><h3>The two maps</h3>
    <p>The <a href="@EXP@">experience map</a> covers what his patients heard, saw, remembered and felt when the temporal lobe was stimulated, with later work on feeling from other parts of the brain.</p>
    <p>The <a href="@BODY@">body map</a> covers the strip of cortex for touch and movement, the figure often called the homunculus.</p>
    <p>How the maps were made and checked is under <a href="@METHODS@">Methods</a>. The sources are under <a href="@REFS@">References</a>. Every record also has a page of its own: <a href="@RECS@">index of records</a>.</p>
    <p>The site is a research companion to <i>NEURAL</i>, a book by Velco Dar on brain-computer interfaces forthcoming from Fast Company Press in 2027.</p>
  </div>
</section>
<section class="doc about" id="experience">
  <div><h2>The experience map</h2>'''+exp_left+'''</div>
  <div>'''+F['exp']['aB']+'''</div>
</section>
<section class="doc about" id="body">
  <div><h2>The body map</h2>'''+body_figs+'''</div>
  <div>'''+F['body']['aB']+'''</div>
</section>'''
METHODS='''<p class="jump">On this page: <a href="#experience">The experience map</a> <a href="#body">The body map</a></p>
<section class="doc" id="experience">
  <div><h2>Methods and limitations: the experience map</h2>'''+F['exp']['meth']+'''</div>
  <div id="codes-experience"><h2>Method codes: the experience map</h2>'''+F['exp']['codes']+'''</div>
</section>
<section class="doc" id="body">
  <div><h2>Methods and limitations: the body map</h2>'''+F['body']['meth']+'''</div>
  <div id="codes-body"><h2>Method codes: the body map</h2>'''+F['body']['codes']+'''</div>
</section>'''
REFS='''<div class="tools refbar"><span class="grp"><span class="lbl" id="lblref">References for</span> <span class="seg2" role="group" aria-labelledby="lblref"><button type="button" data-l="experience" aria-pressed="true">Experience map, %d</button> <button type="button" data-l="body" aria-pressed="false">Body map, %d</button></span></span></div>
<section class="doc" id="experience"><div class="docfull"><h2>References: the experience map</h2><ul class="reflist">%s</ul></div></section>
<section class="doc" id="body"><div class="docfull"><h2>References: the body map</h2><ul class="reflist">%s</ul></div></section>'''%(F['exp']['nrefs'],F['body']['nrefs'],F['exp']['refs'],F['body']['refs'])
PAGES=[('about','About','About Penfield’s Map','Who Wilder Penfield was, what his two maps of the brain show, what later work changed, and why they matter for brain-computer interfaces.',ABOUT),
       ('methods','Methods','Methods: Penfield’s Map','How the experience map and the body map were compiled and checked, their limits, known gaps and method codes.',METHODS),
       ('references','References','References: Penfield’s Map','Every source cited on the experience map and the body map, with a note on how much of each was read.',REFS)]
# The references page shows one list at a time. Without scripts both lists stay visible.
REFJS='''<script>
(function(){
  var secs={experience:document.getElementById('experience'),body:document.getElementById('body')},btns=document.querySelectorAll('.refbar button');
  function show(k,keep){
    Object.keys(secs).forEach(function(n){secs[n].hidden=(n!==k);});
    Array.prototype.forEach.call(btns,function(b){b.setAttribute('aria-pressed',b.getAttribute('data-l')===k?'true':'false');});
    if(keep){try{history.replaceState(null,'','#'+k);}catch(e){}}
  }
  function fromHash(){var h='';try{h=location.hash.slice(1);}catch(e){}show(secs[h]?h:'experience');}
  Array.prototype.forEach.call(btns,function(b){b.addEventListener('click',function(){show(b.getAttribute('data-l'),true);window.scrollTo(0,0);});});
  window.addEventListener('hashchange',fromHash);fromHash();
})();
</script>
'''
EXTRA={'references':REFJS}
def static(fl,slug,sub,title,desc,content):
    cur={'about':'ABOUT','methods':'METHODS','references':'REFS'}.get(slug,'')
    nav=''.join('    <a href="@%s@"%s>%s</a>\n'%(t,' aria-current="page"' if t==cur else '',lab) for t,lab in (('ABOUT','About'),('METHODS','Methods'),('REFS','References')))
    hd=head(title,desc,'https://penfieldsmap.com/%s/'%slug,title,desc) if fl=='site' else '<title>%s</title>\n%s\n'%(title,FONTLINK)
    return '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
%s<style>
%s%s</style>
</head>
<body>

<header class="top">
  <h1><a href="@EXP@">Penfield’s Map</a> <small>%s</small></h1>
  <nav class="menu" aria-label="Site">
    <a href="@EXP@">Experience<span class="mw"> map</span></a>
    <a href="@BODY@">Body<span class="mw"> map</span></a>
    <span class="sep" aria-hidden="true"></span>
%s  </nav>
  <span class="build" data-t="%s"></span>
</header>
<p class="build2">%s</p>

<main class="pg">
%s
</main>

%s</body>
</html>
'''%(hd,css_of(full[fl]['body']),PAGECSS,sub,nav,STAMP,STAMP,content,(FOOT if fl=='site' else '')+EXTRA.get(slug,''))
out={'site':SITE,'preview':PREVIEW}
for fl in ('site','preview'):
    o=out[fl]
    for d in ('about','methods','references','body','experience','records'): shutil.rmtree(o+'/'+d,ignore_errors=True)
    wr(o+'/index.html',links(cut(full[fl]['exp']),fl,0)); wr(o+'/body/index.html',links(mapv(cut(full[fl]['body'])),fl,1))
    for n in (2,3): wr(o+'/body/%s/index.html'%FIGPAGE[n][0],links(figsite[n] if fl=='site' else figv(cut(full['preview']['body']),'preview',n),fl,2))
    for slug,sub,title,desc,content in PAGES: wr(o+'/%s/index.html'%slug,links(static(fl,slug,sub,title,desc,content),fl,1))
# Files served as they are: the fonts and their licence, the icon, the share image, and the search console ownership file, which must stay on the site.
shutil.copytree(STATIC,SITE,dirs_exist_ok=True)
open(SITE+'/robots.txt','w').write('User-agent: *\nAllow: /\n\nSitemap: https://penfieldsmap.com/sitemap.xml\n')

# ---------- stage C: a page for every record ----------
node('records.js',SITE,os.path.join(WORK,'records.json'))
R=json.load(io.open(os.path.join(WORK,'records.json'),encoding='utf-8'))
RECCSS="""
/* ---------- record pages ---------- */
body.rec{--toolh:0px;--headh:60px}
body.rec #fig1 svg.pl-m{display:none}
body.rec #fig1 [data-id]{cursor:pointer}
body.rec a.plain{display:inline-block;color:var(--ink);text-decoration:none}
body.rec a.plain:hover{background:var(--bar)}
body.rec .crumb{display:flex;flex-wrap:wrap;gap:2px 16px;align-items:baseline}
body.rec .crumb a{margin-right:0}
body.rec .cite p{margin:0;padding:8px 14px 0;font-size:11.5px;color:var(--ink2);overflow-wrap:anywhere}
body.rec .cite p:last-child{padding-bottom:14px}
.idx{columns:3 250px;column-gap:36px;margin:0;padding:0;list-style:none;font-size:12px}
.idx li{break-inside:avoid;padding:2px 0 5px}
.idx li span{display:block;color:var(--ink2);font-size:11px}
.idxh{font:700 11px/1.4 var(--display);text-transform:uppercase;letter-spacing:.09em;margin:18px 0 6px}
@media (max-width:1020px){
  body.rec{--headh:77px}
  body.rec #fig1 svg.pl-d{display:none}
  body.rec #fig1 svg.pl-m{display:block}
}
"""
FITM={'exp':"body.rec svg.fitm .labs,body.rec svg.fitm .anat.lbl,body.rec svg.fitm .bodylink{display:none}\n",
      'body':"body.rec svg.fitm .seg .lab,body.rec svg.fitm .seg .lead,body.rec svg.fitm .alt,body.rec svg.fitm .anat text,body.rec svg.fitm .anat .ptr{display:none}\nbody.rec svg.fitm .seg .hit{stroke-width:64}\nbody.rec svg.fitm .seg .halo{stroke-width:32}\n"}
# The record pages run no map script. This sets the pinned plate under the header and lets a label on the plate open that record's page.
RECJS="""<script>
(function(){
  var U=%s,h=document.querySelector('header.top');
  function fit(){document.body.style.setProperty('--headh',h.offsetHeight+'px');}
  fit();window.addEventListener('resize',fit);if(document.fonts&&document.fonts.ready){document.fonts.ready.then(fit);}
  function go(t){var e=t.closest?t.closest('#fig1 [data-id]'):null,u=e&&U[e.getAttribute('data-id')];if(u){location.href=u;return true;}return false;}
  document.addEventListener('click',function(ev){go(ev.target);});
  document.addEventListener('keydown',function(ev){if(ev.key==='Enter'&&go(ev.target)){ev.preventDefault();}});
})();
</script>
"""
RECTPL="""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
%s<style>
%s%s%s</style>
</head>
<body class="rec">
%s
<header class="top">
  <h1><a href="@EXP@">Penfield’s Map</a> <small>%s</small></h1>
  <nav class="menu" aria-label="Site">
%s  </nav>
  <span class="build" data-t="%s"></span>
</header>
<p class="build2">%s</p>
<p class="crumb"><a href="%s#%s">← Open this record on the %s</a> <span>%s</span> <a href="@RECS@">Index of records</a></p>

<main>
  <div class="duo" id="duo">
    <section class="panel" id="p1">
      <h2><b>Fig. 1.</b> <span>%s</span></h2>
      <div class="pbody">
        <div class="svgwrap" id="fig1">%s%s</div>
      </div>
    </section>
    <article class="record" id="record">%s%s</article>
  </div>
</main>

%s%s</body>
</html>
"""
def esc(t): return t.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')
def clip(t,n=158):
    t=re.sub(r'\s+',' ',t).strip()
    if len(t)<=n: return t
    t=t[:n]; return t[:t.rfind(' ')].rstrip(',;:')+'…'
def svgcls(svg,cls):
    m=re.match(r'<svg\b([^>]*)>',svg); assert m,svg[:80]
    att=m.group(1)
    if re.search(r'\bclass="',att): att=re.sub(r'\bclass="','class="'+cls+' ',att,1)
    else: att=' class="'+cls+'"'+att
    return '<svg'+att+'>'+svg[m.end():]
def rel(html,fl,depth):
    """Captured markup carries site addresses beginning with a slash. The preview copy needs them relative."""
    if fl=='site': return html
    pre='../'*depth
    def f(m):
        path,_,frag=m.group(1).partition('#')
        path=path.lstrip('/'); path=(path+'index.html') if (path=='' or path.endswith('/')) else path
        return 'href="'+pre+path+(('#'+frag) if frag else '')+'"'
    return re.sub(r'href="(/[^"]*)"',f,html)
FAM={'sen':('sensory figure of 1950','Postcentral gyrus, sensory figure of 1950'),'mot':('motor figure of 1950','Precentral gyrus, motor figure of 1950'),'g':('fMRI scheme of 2023','Precentral gyrus, fMRI scheme of 2023')}
def recpage(fl,kind,r,depth,urls):
    src=full[fl]['exp' if kind=='exp' else 'body']
    if kind=='exp':
        title='%s under brain stimulation · Penfield’s Map'%r['title']; sub='of human experience'; mapname='experience map'; maptok='@EXP@'
        desc=clip(r['first'] or r['text']); where=(r['recid'][:1]+r['recid'][1:].lower()) if r['recid'] else ''; citename=r['title']
    else:
        title='%s, %s · Penfield’s body map'%(r['title'],FAM[r['fam']][0]); sub='of the sensorimotor strip'; mapname='body map'; maptok='@BODY@'
        desc=clip('%s on Penfield’s body map, %s. %s'%(r['title'],FAM[r['fam']][0],r['first'])); where=FAM[r['fam']][1]; citename='%s, %s'%(r['title'],FAM[r['fam']][0])
    canon='https://penfieldsmap.com'+r['url']
    hd=head(esc(title),esc(desc),canon,esc(title),esc(desc)) if fl=='site' else '<title>%s</title>\n%s\n'%(esc(title),FONTLINK)
    nav='    <a href="@EXP@"%s>Experience<span class="mw"> map</span></a>\n    <a href="@BODY@"%s>Body<span class="mw"> map</span></a>\n    <span class="sep" aria-hidden="true"></span>\n    <a href="@ABOUT@">About</a>\n    <a href="@METHODS@">Methods</a>\n    <a href="@REFS@">References</a>\n'%((' aria-current="page"','') if kind=='exp' else ('',' aria-current="page"'))
    forms='<p><a href="%s/issues/new?template=report-an-error.yml&amp;record=%s" rel="noopener">Report an error</a> or <a href="%s/issues/new?template=suggest-a-finding.yml&amp;record=%s" rel="noopener">suggest a finding</a> on GitHub.</p>'%(REPO,quote(canon,safe=''),REPO,quote(canon,safe='')) if OPEN_SOURCE else ''
    cite='<div class="sect cite"><h3>Cite or correct this record</h3><p>Dargentic Intelligence. “%s.” Penfield’s Map, updated %s. %s</p><p>Corrections and suggestions, with a source: <a href="mailto:%s?subject=%s">%s</a></p>%s</div>'%(esc(citename),DATE_LONG,canon,MAIL,esc(citename).replace(' ','%20').replace(',','%2C'),MAIL,forms)
    svgd=svgcls(r['svg'],'pl-d'); svgm=svgcls(r['svgm'],'pl-m'+(' fitm' if 'fitm' in r['wrapm'] else ''))
    U=json.dumps({k:(v if fl=='site' else '../'*depth+v.lstrip('/')+'index.html') for k,v in urls.items()},separators=(',',':'))
    page=RECTPL%(hd,css_of(src),RECCSS,FITM[kind],alldefs(src),sub,nav,STAMP,STAMP,maptok,r['id'],mapname,esc(where),esc(r['cap']),
                 rel(svgd,fl,depth),rel(svgm,fl,depth),rel(r['html'],fl,depth),cite,(FOOT if fl=='site' else ''),RECJS%U)
    return links(page,fl,depth)
XU={k:v['url'] for k,v in R['exp']['rec'].items()}; BU={k:v['url'] for k,v in R['body']['rec'].items()}
GL={g['k']:g['l'] for g in json.loads(subprocess.run(['node','-e',"const s=require('fs').readFileSync(process.argv[1],'utf8');console.log(JSON.stringify(new Function(s+';return GROUPS.map(g=>({k:g.k,l:g.l}))')()))",os.path.join(SRC,'experience-data.js')],capture_output=True,text=True).stdout)}
def idx(fl):
    h='<section class="doc"><div class="docfull"><h2>Index of records</h2><p style="max-width:84ch;margin:0 0 4px">Every record on the two maps has a page of its own, readable without scripts and with a fixed address. The maps open the same records: <a href="@EXP@">experience map</a>, <a href="@BODY@">body map</a>.</p>'
    for k in ('R','I','L'):
        h+='<h3 class="idxh">Experience map: %s</h3><ul class="idx">'%esc(GL[k])
        for i in R['exp']['order']:
            r=R['exp']['rec'][i]
            if r['g']==k: h+='<li><a href="%s">%s</a> <span>%s</span></li>'%(r['url'],esc(r['title']),esc(clip(r['first'],110)))
        h+='</ul>'
    for fam,lab in (('sen','Body map: sensory figure of 1950, postcentral gyrus'),('mot','Body map: motor figure of 1950, precentral gyrus'),('g','Body map: fMRI scheme of 2023, precentral gyrus')):
        h+='<h3 class="idxh">%s</h3><ul class="idx">'%lab
        for i in R['body']['ids']:
            r=R['body']['rec'][i]
            if r['fam']==fam: h+='<li><a href="%s">%s</a></li>'%(r['url'],esc(r['title']))
        h+='</ul>'
    return rel(h+'</div></section>',fl,1)
for fl in ('site','preview'):
    o=out[fl]
    for i,r in R['exp']['rec'].items(): wr(o+r['url']+'index.html',recpage(fl,'exp',r,2,XU))
    for i,r in R['body']['rec'].items(): wr(o+r['url']+'index.html',recpage(fl,'body',r,3,BU))
    pg=static(fl,'records','Index of records','Index of records: Penfield’s Map','Every record on the experience map and the body map, each with a page and a fixed address of its own.',idx(fl))
    wr(o+'/records/index.html',links(one(pg,PAGECSS,PAGECSS+RECCSS),fl,1))
    # the old address of Figs 2 and 3 leads to Fig. 2, or to Fig. 3 when it carried that figure's anchor
    f2,f3=('/body/fig-2/','/body/fig-3/') if fl=='site' else ('../fig-2/index.html','../fig-3/index.html')
    wr(o+'/body/figures/index.html','<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><title>Figs 2 and 3 of the body map: Penfield’s Map</title><link rel="icon" href="data:,"><meta name="robots" content="noindex"><script>if(location.hash==="#p3"){location.replace("%s");}</script><meta http-equiv="refresh" content="0; url=%s"></head><body><p><a href="%s">Fig. 2</a> <a href="%s">Fig. 3</a></p></body></html>\n'%(f3,f2,f2,f3))
    # a bare address such as /experience/ leads to the index
    for d in ('experience','body/sensory','body/motor','body/2023'):
        to='/records/' if fl=='site' else '../'*(d.count('/')+1)+'records/index.html'
        wr(o+'/'+d+'/index.html','<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><title>Index of records: Penfield’s Map</title><link rel="icon" href="data:,"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=%s"></head><body><p><a href="%s">Index of records</a></p></body></html>\n'%(to,to))
recurls=['records/']+[v['url'].lstrip('/') for v in R['exp']['rec'].values()]+[v['url'].lstrip('/') for v in R['body']['rec'].values()]
open(SITE+'/sitemap.xml','w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('  <url><loc>https://penfieldsmap.com/%s</loc><lastmod>%s</lastmod></url>\n'%(u,UPDATED) for u in ['','body/','body/fig-2/','body/fig-3/','about/','methods/','references/']+recurls)+'</urlset>\n')
# a plain index for programs that read sites on a person's behalf
L=['# Penfield’s Map','','> What Wilder Penfield’s patients reported when their brains were stimulated, record by record, with case and page references, later evidence and sources. Published and maintained by Dargentic Intelligence. Not peer reviewed.','','Each record below is a plain page that needs no scripts.','','## Experience map']
for i in R['exp']['order']:
    r=R['exp']['rec'][i]; L.append('- [%s](https://penfieldsmap.com%s): %s'%(r['title'],r['url'],clip(r['first'],200)))
for fam,lab in (('sen','Body map: sensory figure of 1950'),('mot','Body map: motor figure of 1950'),('g','Body map: fMRI scheme of 2023')):
    L+=['','## '+lab]
    for i in R['body']['ids']:
        r=R['body']['rec'][i]
        if r['fam']==fam: L.append('- [%s](https://penfieldsmap.com%s)'%(r['title'],r['url']))
L+=['','## About the site','- [About](https://penfieldsmap.com/about/)','- [Methods and known gaps](https://penfieldsmap.com/methods/)','- [References](https://penfieldsmap.com/references/)','- [Index of records](https://penfieldsmap.com/records/)','']
open(SITE+'/llms.txt','w').write('\n'.join(L))
# ---------- the data files ----------
node('export-data.js',SRC,os.path.join(ROOT,'data'),os.path.join(WORK,'records.json'))
# ---------- checks ----------
# No page may leave a link token unfilled. A local file build/blocklist.local.txt, one regular expression a line,
# lists anything else that must never appear on the site; the build fails if a page matches.
BL=os.path.join(HERE,'blocklist.local.txt')
block=[re.compile(l.strip()) for l in io.open(BL,encoding='utf-8') if l.strip() and not l.startswith('#')] if os.path.exists(BL) else []
bad=0; n=0; size=0
for dp,dn,fn in os.walk(SITE):
    for f in fn:
        if not f.endswith(('.html','.txt','.xml')) or f=='robots.txt': continue
        x=io.open(os.path.join(dp,f),encoding='utf-8').read(); n+=1; size+=len(x.encode('utf-8'))
        w=[m.group(0) for b in block for m in b.finditer(x)]; t=re.findall(r'@[A-Z_]+@',x)
        if w or t: bad+=1; print('PROBLEM',os.path.join(dp,f),w[:3],t[:3])
print('site: %d text files, %.1f MB, files with blocked words or loose tokens: %d (blocklist patterns: %d)'%(n,size/1e6,bad,len(block)))
for n in ('index.html','body/index.html','body/fig-2/index.html','body/fig-3/index.html','records/index.html','experience/voices/index.html','body/sensory/thumb/index.html'):
    print('%-36s %7d bytes'%(n,os.path.getsize(SITE+'/'+n)))
if bad: sys.exit('the build wrote pages that fail the checks above')
