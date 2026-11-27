(function(){
'use strict';
function $(i){return document.getElementById(i);}
var NS='http://www.w3.org/2000/svg';
function S(t,a,p){var e=document.createElementNS(NS,t),k;for(k in a){if(a[k]!==null&&a[k]!==undefined){e.setAttribute(k,a[k]);}}if(p){p.appendChild(e);}return e;}
function H(t,c,h,p){var e=document.createElement(t);if(c){e.className=c;}if(h!==undefined&&h!==null){e.innerHTML=h;}if(p){p.appendChild(e);}return e;}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function r1(v){return Math.round(v*10)/10;}

var EID={},GK={},SEQ=[];
ENTRIES.forEach(function(e){EID[e.id]=e;SEQ.push(e.id);});
GROUPS.forEach(function(g){GK[g.k]=g;});
var state={sel:null,g:'R'};
var MQ=window.matchMedia?window.matchMedia('(max-width:1020px)'):null;
function isNarrow(){return !!(MQ&&MQ.matches);}
function paneSmall(){return isNarrow()&&$('fig1').clientWidth<560;}
var PMODE='';
function paneMode(){return (paneSmall()?'s':'l')+state.g;}

/* ---------- curves ---------- */
function sp(p){var d='',n=p.length,i,a,b,c,e;
  for(i=0;i<n-1;i++){a=p[i?i-1:0];b=p[i];c=p[i+1];e=p[i+2<n?i+2:n-1];
    d+=' C'+r1(b[0]+(c[0]-a[0])/6)+' '+r1(b[1]+(c[1]-a[1])/6)+' '+r1(c[0]-(e[0]-b[0])/6)+' '+r1(c[1]-(e[1]-b[1])/6)+' '+c[0]+' '+c[1];}
  return d;}
function open(p){return 'M'+p[0][0]+' '+p[0][1]+sp(p);}
function rev(p){return p.slice().reverse();}
function area(parts){var d='',i;for(i=0;i<parts.length;i++){d+=(i?' L':'M')+parts[i][0][0]+' '+parts[i][0][1]+(parts[i].length>1?sp(parts[i]):'');}return d+' Z';}

/* ---------- side view of one hemisphere, front to the left. An original schematic, not to scale. ---------- */
var OUT=[[258,356],[232,366],[196,372],[158,368],[122,356],[94,336],[76,308],[70,272],[76,230],[94,186],[124,144],[164,108],[214,78],[272,56],[336,44],[402,42],[466,50],[526,68],[578,96],[622,134],[654,180],[672,230],[678,282],[670,330],[650,372],[620,404],[584,426],[540,444],[490,460],[436,474],[380,484],[330,484],[288,472],[258,450],[240,420],[236,390],[244,368],[258,356]];
var SYL=[[258,356],[300,344],[352,330],[410,312],[466,292],[516,270],[552,248],[566,222]];
var STS=[[262,410],[310,398],[370,384],[432,366],[492,344],[540,318],[576,286],[592,252]];
var ITS=[[282,452],[336,446],[400,436],[464,420],[524,396],[572,368],[600,350]];
var CS=[[424,43],[420,96],[410,150],[396,204],[382,256],[372,304]];
var PRCS=[[366,52],[358,106],[346,160],[332,214],[320,264],[314,310]];
var POCS=[[480,52],[474,104],[462,158],[446,210],[430,256],[422,292]];
var MINOR=[
  [[352,128],[296,122],[236,134],[180,160]],
  [[326,226],[276,214],[222,222],[172,250]],
  [[300,344],[294,316],[288,292]],
  [[274,352],[248,338],[222,332]],
  [[456,176],[500,146],[548,134],[594,152],[626,190]],
  [[612,330],[640,312],[660,286]],
  [[626,138],[612,160]],
  [[156,300],[124,292]],
  [[556,174],[596,188]],
  [[120,214],[150,200],[176,210]],
  [[206,98],[216,126]],
  [[252,282],[228,272],[208,282]],
  [[512,98],[522,130]],
  [[640,232],[656,258]],
  [[344,468],[396,462]],
  [[410,404],[448,394]]
];
var CING=[[232,338],[206,318],[190,290],[188,258],[204,224],[238,196],[292,174],[360,164],[428,166],[490,182],[530,218]];
var ZONES={
  t1:{k:'a',d:area([SYL.slice(0,7),rev(STS.slice(0,7)),[[242,414],[237,392],[244,370]]])},
  t2:{k:'a',d:area([STS.slice(0,7),rev(ITS),[[262,458],[245,438],[242,414]]])},
  t3:{k:'a',d:area([ITS,[[620,404],[584,426],[540,444],[490,460],[436,474],[380,484],[330,484],[292,474]]])},
  tpo:{k:'a',d:area([[[576,286],[600,350]],[[620,404],[646,360],[644,314],[612,284]]])},
  ang:{k:'a',d:area([[[570,268],[580,236],[606,224],[630,242],[626,276],[600,292],[570,268]]]),ol:1},
  lofc:{k:'a',d:area([[[242,352],[214,340],[168,340],[128,344],[108,350]],[[122,356],[158,368],[196,372],[232,366]]]),ol:1},
  sma:{k:'a',d:area([[[300,52],[334,46],[366,44]],[[364,74],[334,80],[304,86]]]),ol:1},
  sup:{k:'l',p:[[342,340],[410,320],[466,300],[520,278]],w:11,ph:1},
  inf:{k:'l',p:[[330,474],[400,468],[470,452],[540,430]],w:9,ph:1},
  hip:{k:'l',p:[[322,424],[366,416],[408,402],[446,384]],w:13,ph:1},
  rhi:{k:'l',p:[[286,460],[316,466],[348,464]],w:9,ph:1},
  ppa:{k:'l',p:[[452,440],[482,430],[510,418]],w:9,ph:1},
  ffa:{k:'l',p:[[534,424],[560,410],[584,394]],w:9,ph:1},
  pacc:{k:'l',p:[[192,300],[187,272],[192,244]],w:20,ph:1},
  amcc:{k:'l',p:[[244,193],[274,180],[310,170]],w:20,ph:1},
  scc:{k:'l',p:[[234,339],[218,329],[204,315]],w:20,ph:1},
  amy:{k:'c',c:[298,420],r:14,ph:1},
  dai:{k:'c',c:[330,324],r:12,ph:1},
  nac:{k:'c',c:[276,332],r:9,ph:1}
};
var ZNAME={t1:'first temporal convolution, side',t2:'second temporal convolution',t3:'third temporal convolution',tpo:'back of the temporal lobe, toward the occipital lobe',ang:'angular gyrus',lofc:'lateral orbitofrontal cortex',sma:'supplementary motor area',sup:'upper surface of the first temporal convolution, inside the fissure',inf:'under surface of the temporal lobe',hip:'hippocampus (deep)',rhi:'rhinal cortex (inner face)',ppa:'parahippocampal cortex (under surface)',ffa:'fusiform gyrus (under surface)',pacc:'anterior cingulate cortex, in front of the corpus callosum (inner face)',amcc:'anterior midcingulate cortex (inner face)',scc:'subcallosal cingulate (inner face)',amy:'amygdala (deep)',dai:'front of the insula (deep in the fissure)',nac:'nucleus accumbens (deep)'};
var BASE={R:['sup'],I:['sup'],L:['pacc','amcc','scc','dai','nac']};
var LP={
  voices:{x:216,y:584,tx:300,ty:372},music:{x:316,y:584,tx:372,ty:356},both:{x:446,y:584,tx:440,ty:332},flash:{x:236,y:616,tx:330,ty:424},scenes:{x:566,y:616,tx:618,ty:340},
  familiar:{x:190,y:584,tx:300,ty:428},csound:{x:336,y:584,tx:392,ty:350},csight:{x:480,y:584,tx:500,ty:384},fear:{x:290,y:616,tx:350,ty:462},lonely:{x:430,y:616,tx:452,ty:446},
  laughter:{x:120,y:-36,tx:188,ty:268},drive:{x:262,y:-36,tx:276,ty:180},oob:{x:620,y:-36,tx:604,ty:240},mood:{x:112,y:440,tx:160,ty:356},wanting:{x:134,y:480,tx:270,ty:336},bliss:{x:160,y:520,tx:322,ty:329}
};

function zel(id,parent){
  var z=ZONES[id],g=S('g',{'class':'zn'+(z.ph?' ph':'')+(z.ol?' ol':''),'data-z':id,tabindex:'-1'},parent),d;
  if(z.k==='a'){
    S('path',{d:z.d,'class':'zf'},g);S('path',{d:z.d,'class':'zt'},g);S('path',{d:z.d,'class':'zo'},g);
  }else if(z.k==='l'){
    d=open(z.p);
    S('path',{d:d,'class':'ze','stroke-width':z.w},g);S('path',{d:d,'class':'zb','stroke-width':z.w-2.2},g);
    S('path',{d:d,'class':'zf ln','stroke-width':z.w-2.2},g);S('path',{d:d,'class':'zt ln','stroke-width':z.w-2.2},g);
    S('path',{d:d,'class':'zh','stroke-width':Math.max(z.w+10,24)},g);
  }else{
    S('circle',{cx:z.c[0],cy:z.c[1],r:z.r,'class':'zc'},g);S('circle',{cx:z.c[0],cy:z.c[1],r:z.r,'class':'zf'},g);S('circle',{cx:z.c[0],cy:z.c[1],r:z.r,'class':'zt'},g);
    S('circle',{cx:z.c[0],cy:z.c[1],r:z.r+9,'class':'zh'},g);
  }
  return g;
}
function txt(x,y,s,cls,parent,anchor){var t=S('text',{x:x,y:y,'class':cls||null,'text-anchor':anchor||null},parent);t.textContent=s;return t;}

function buildPlate(){
  var wrap=$('fig1'),small=paneSmall(),g=GK[state.g],i,k;
  wrap.innerHTML='';wrap.classList.toggle('fitm',small);PMODE=paneMode();
  var svg=S('svg',{viewBox:small?'56 28 638 530':'30 -70 700 700',role:'img','aria-label':'Side view of one cerebral hemisphere with the regions named in the records'},wrap);
  svg.style.setProperty('--gc',g.c);
  var an=S('g',{'class':'anat'},svg);
  S('path',{d:area([[[516,446],[532,486],[566,514],[610,524],[650,510],[674,478],[680,438],[664,402],[636,386]]]),'class':'cbl'},an);
  S('path',{d:'M468 452 C472 486 480 516 492 550 L530 550 C524 516 520 488 522 450 Z','class':'stem'},an);
  S('path',{d:open(OUT)+' Z','class':'hemi'},an);
  S('path',{d:area([PRCS,rev(POCS),[[440,46],[402,42],[370,44]]]),'class':'strip'},an);
  var zg=S('g',{'class':'zones'},svg),shown={};
  ['t1','t2','t3','tpo','ang','lofc','sma'].forEach(function(id){zel(id,zg);shown[id]=1;});
  var sl=S('g',{'class':'anat sul'},svg);
  [SYL,STS,ITS,CS,PRCS,POCS].forEach(function(p,n){S('path',{d:open(p),'class':n===0?'fis':(n===3?'cs':null)},sl);});
  MINOR.forEach(function(p){S('path',{d:open(p),'class':'fine'},sl);});
  S('path',{d:open(OUT)+' Z','class':'out'},sl);
  if(state.g==='L'){
    S('path',{d:open(CING),'class':'ctx','stroke-width':22},sl);S('path',{d:open(CING),'class':'ctxb','stroke-width':19.8},sl);
    S('ellipse',{cx:380,cy:318,rx:72,ry:22,transform:'rotate(-18 380 318)','class':'ctxe'},sl);
  }
  var pg=S('g',{'class':'zones deep'},svg);
  var need=BASE[state.g].slice(),e=EID[state.sel];
  if(e){e.z.concat(e.z2||[]).forEach(function(id){if(need.indexOf(id)<0){need.push(id);}});}
  need.forEach(function(id){if(!shown[id]&&ZONES[id]){zel(id,pg);shown[id]=1;}});
  if(shown.sup){S('ellipse',{cx:452,cy:305,rx:12,ry:4.4,transform:'rotate(-20 452 305)','class':'hes'},pg);}
  /* anatomy lettering, large panes only */
  var al=S('g',{'class':'anat lbl'},svg);
  txt(78,140,'FRONT','ori',al,'middle');txt(690,150,'BACK','ori',al,'middle');
  txt(246,112,'frontal lobe',null,al,'middle');txt(548,112,'parietal lobe',null,al,'middle');
  txt(606,474,'cerebellum',null,al,'middle');
  txt(476,228,'lateral fissure',null,al,'start');S('path',{d:'M490 232 L482 284','class':'ptr'},al);
  txt(506,312,'1st',null,al,'middle');txt(508,376,'2nd',null,al,'middle');txt(482,444,'3rd',null,al,'middle');
  if(shown.sup){txt(404,280,'Heschl’s gyrus',null,al,'end');S('path',{d:'M406 284 L446 303','class':'ptr'},al);}
  var bl=S('a',{'class':'bodylink',href:BODYURL},svg);
  txt(424,-14,'touch and movement: see the Body map','blk',bl,'middle');S('path',{d:'M424 -8 L424 40','class':'ptr2'},bl);
  /* entry labels */
  var lg=S('g',{'class':'labs'},svg);
  ENTRIES.forEach(function(en){
    if(en.g!==state.g){return;}
    var p=LP[en.id];if(!p){return;}
    var up=p.y<p.ty,a=S('g',{'class':'elab','data-id':en.id,tabindex:'0',role:'button','aria-label':en.l},lg);
    S('path',{d:'M'+p.x+' '+(up?p.y+6:p.y-13)+' L'+p.tx+' '+p.ty,'class':'lead'},a);
    S('circle',{cx:p.tx,cy:p.ty,r:2.2,'class':'dot'},a);
    txt(p.x,p.y,en.lab,'lab',a,'middle');
  });
  mark();
}
function mark(){
  var e=EID[state.sel],on={},on2={},i,els;
  if(e){e.z.forEach(function(z){on[z]=1;});(e.z2||[]).forEach(function(z){on2[z]=1;});}
  els=document.querySelectorAll('#fig1 .zn');
  for(i=0;i<els.length;i++){var z=els[i].getAttribute('data-z');els[i].classList.toggle('on',!!on[z]);els[i].classList.toggle('on2',!!on2[z]&&!on[z]);}
  els=document.querySelectorAll('[data-id]');
  for(i=0;i<els.length;i++){els[i].classList.toggle('on',els[i].getAttribute('data-id')===state.sel);}
  var b=['R','I','L'];
  b.forEach(function(k){['btn-','m-'].forEach(function(pre){var x=$(pre+k);if(x){x.setAttribute('aria-pressed',state.g===k?'true':'false');}});});
  if($('pick')){$('pick').value=state.sel||'';}
}

/* ---------- record ---------- */
function refTag(keys){return keys.map(function(k){return REFS[k]?REFS[k].s:k;}).join('; ');}
function recUrl(id){return XPRE+SLUG[id]+XSUF;}
function caseText(c){return '<b class="who">'+esc(c.i)+', '+esc(c.w)+', '+esc(c.sd)+' side.</b> '+esc(c.t)+' <span class="r">[Case '+c.c+', pp. '+esc(c.p)+']</span>';}
/* A record with case reports opens on one of them; its counts and anatomy follow the cases. */
function renderRecord(){
  var e=EID[state.sel],rec=$('record'),g=GK[e.g],h='',used=[],i,n=0,inG=ENTRIES.filter(function(x){return x.g===e.g;});
  function use(k){if(used.indexOf(k)<0){used.push(k);}}
  for(i=0;i<inG.length;i++){if(inG[i].id===e.id){n=i+1;}}
  var cases=(e.cases||[]).slice(),lead=null,facts='';
  if(cases.length){i=0;if(e.lead){cases.forEach(function(c,j){if(c.c===e.lead){i=j;}});}lead=cases.splice(i,1)[0];}
  if(e.term){facts+='<p class="kv"><b>Penfield’s term</b> '+esc(e.term)+'</p>';}
  if(e.count){facts+='<p class="kv"><b>'+(e.g==='L'?'Evidence':'Count')+'</b> '+esc(e.count)+'</p>';}
  if(e.where){facts+='<p class="kv"><b>Where</b> '+esc(e.where)+'</p>';}
  if(e.side){facts+='<p class="kv"><b>Side</b> '+esc(e.side)+'</p>';}
  h+='<div class="rec-h"><div><div class="rec-id">'+esc(g.l)+' · '+n+' of '+inG.length+'</div><h2>'+esc(e.l)+'</h2>';
  if(lead){h+='<p class="lead">'+caseText(lead)+'</p>';}
  else{if(e.note){h+='<p class="note">'+esc(e.note)+'</p>';}h+=facts;}
  h+='<div class="rec-act"><button type="button" class="plain" data-step="-1">← Previous</button><button type="button" class="plain" data-step="1">Next →</button></div></div></div>';
  if(lead){
    use(PP);
    h+='<div class="sect"><h3>More from the 1963 case reports</h3>';
    cases.forEach(function(c){h+='<div class="row"><span class="m">C'+c.c+'</span><div>'+caseText(c)+'</div></div>';});
    h+='<p class="none">Paraphrased from the case reports of Penfield and Perot 1963. A probe is a touch of the stimulating electrode. The numbers are the case numbers of that paper.</p></div>';
    h+='<div class="sect"><h3>Term, count and site</h3><div class="facts">'+(e.note?'<p class="note">'+esc(e.note)+'</p>':'')+facts+'</div></div>';
  }else if(e.g!=='L'){use(PP);}
  var lat=LATER.filter(function(f){return f.to.indexOf(e.id)>=0;});
  if(lat.length){
    h+='<div class="sect"><h3>'+(e.g==='L'?'Findings':'Later evidence')+'</h3>';
    lat.forEach(function(f){f.r.forEach(use);h+='<div class="row"><span class="m">'+esc(f.m)+'</span><div>'+esc(f.t)+' <span class="r">['+esc(refTag(f.r))+']</span></div></div>';});
    h+='</div>';
  }
  if(e.src){e.src.forEach(use);}
  h+='<div class="sect"><h3>On the plate</h3><p class="none plain2">'+esc(plateNote(e))+'</p></div>';
  h+='<div class="sect"><h3>Sources cited in this record</h3><ol class="srcs">';
  used.forEach(function(k){var r=REFS[k];if(r){h+='<li>'+esc(r.f)+(r.u?' <a href="'+esc(r.u)+'" rel="noopener">'+esc(r.u.replace(/^https?:\/\//,''))+'</a>':'')+(r.n?' <span class="rn">'+esc(r.n)+'</span>':'')+'</li>';}});
  h+='</ol></div>';
  h+='<p class="perm">This record has its own page: <a href="'+esc(recUrl(e.id))+'">penfieldsmap.com/experience/'+esc(SLUG[e.id])+'/</a></p>';
  rec.innerHTML=h;
}
function plateNote(e){
  var a=e.z.map(function(z){return ZNAME[z];}),b=(e.z2||[]).map(function(z){return ZNAME[z];}),s='Shaded: '+a.join('; ')+'.';
  if(b.length){s+=' Lighter, in broken outline, sites from later work: '+b.join('; ')+'.';}
  return s+' Positions are by region, not by point.';
}

/* ---------- selection ---------- */
function select(id,opt){
  opt=opt||{};var e=EID[id];if(!e){return;}
  var regroup=e.g!==state.g;state.sel=id;state.g=e.g;
  buildPlate();buildChips();renderRecord();
  $('f1t').textContent=GK[e.g].l+'. Side view of one hemisphere, front to the left.';
  if($('mnow')){$('mnow').textContent=e.lab;}
  if(!opt.nohash){try{if(location.hash.slice(1)!==id){history.replaceState(null,'','#'+id);}}catch(x){}}
  if(!opt.noscroll){
    var d=$('duo'),y=d.getBoundingClientRect().top+window.pageYOffset-document.querySelector('header.top').offsetHeight-(isNarrow()?0:$('tools').offsetHeight);
    if(opt.scroll||window.pageYOffset>y){window.scrollTo(0,y);}
  }
  var c=document.querySelector('#chips .on');if(c&&regroup===false){var cb=c.parentNode,cr=c.getBoundingClientRect(),br=cb.getBoundingClientRect();if(cr.left<br.left){cb.scrollLeft-=br.left-cr.left+8;}else if(cr.right>br.right){cb.scrollLeft+=cr.right-br.right+8;}}   /* bring the chosen name into view along its row, without moving the page */
}
function step(d){var i=SEQ.indexOf(state.sel);i=(i+d+SEQ.length)%SEQ.length;select(SEQ[i]);}
function setGroup(k){if(k===state.g){return;}var f=ENTRIES.filter(function(x){return x.g===k;})[0];if(f){select(f.id);}}
function pickZone(z){
  var c=ENTRIES.filter(function(x){return x.g===state.g&&(x.z.indexOf(z)>=0||(x.z2||[]).indexOf(z)>=0);});
  if(!c.length){c=ENTRIES.filter(function(x){return x.z.indexOf(z)>=0;});}
  if(!c.length){return;}
  var i=-1,j;for(j=0;j<c.length;j++){if(c[j].id===state.sel){i=j;}}
  select(c[(i+1)%c.length].id);
}
function buildChips(){
  var c=$('chips');c.innerHTML='';
  ENTRIES.forEach(function(e){if(e.g===state.g){var b=H('button','chip'+(e.id===state.sel?' on':''),esc(e.lab),c);b.type='button';b.setAttribute('data-id',e.id);}});
}

/* ---------- key, chart, references ---------- */
function buildKey(){
  var k=$('key');k.innerHTML='';
  GROUPS.forEach(function(g){
    var d=H('div',null,null,k);
    H('h3',null,'<svg class="sw" viewBox="0 0 24 12" aria-hidden="true"><rect width="24" height="12" fill="'+g.c+'"/><rect width="24" height="12" fill="url(#'+g.tx+')"/><rect x=".5" y=".5" width="23" height="11" fill="none" stroke="#1c1a16"/></svg>'+esc(g.l),d);
    H('p',null,esc(g.t),d);
    var ul=H('ul',null,null,d);
    ENTRIES.forEach(function(e){if(e.g===g.k){var li=H('li',null,null,ul),b=H('button','lk',esc(e.l),li);b.type='button';b.setAttribute('data-id',e.id);b.setAttribute('data-scroll','1');}});
  });
  var p=$('pick');p.innerHTML='';
  GROUPS.forEach(function(g){var og=H('optgroup',null,null,p);og.label=g.l;ENTRIES.forEach(function(e){if(e.g===g.k){var o=H('option',null,esc(e.l),og);o.value=e.id;}});});
}
function buildChart(){
  var w=$('fig2');w.innerHTML='';
  var svg=S('svg',{viewBox:'0 0 760 250',role:'img','aria-label':'Responses by kind and by hemisphere, from Table V of the 1963 paper'},w),x0=150,sc=11.4,y=34,g;
  S('line',{x1:x0,y1:18,x2:x0,y2:226,stroke:'#1c1a16','stroke-width':1},svg);
  TABLEV.forEach(function(r){
    g=S('g',{'class':'bar','data-tip':r.k+': '+r.nd+' responses from the non-dominant hemisphere in '+r.ndp+' patients, '+r.d+' from the dominant hemisphere in '+r.dp+' patients'},svg);
    txt(x0-10,y+19,r.k,'bk',g,'end');
    S('rect',{x:x0,y:y,width:r1(r.nd*sc),height:15,fill:'url(#hatch)',stroke:'#1c1a16','stroke-width':.9},g);
    txt(x0+r.nd*sc+7,y+12,r.nd+'  ('+r.ndp+' patients)','bv',g,'start');
    S('rect',{x:x0,y:y+18,width:r1(r.d*sc),height:15,fill:'url(#stip)',stroke:'#1c1a16','stroke-width':.9},g);
    txt(x0+r.d*sc+7,y+30,r.d+'  ('+r.dp+' patients)','bv',g,'start');
    y+=48;
  });
  S('rect',{x:x0+350,y:150,width:24,height:12,fill:'url(#hatch)',stroke:'#1c1a16','stroke-width':.9},svg);txt(x0+382,160,'non-dominant, 91 responses','bv',svg,'start');
  S('rect',{x:x0+350,y:172,width:24,height:12,fill:'url(#stip)',stroke:'#1c1a16','stroke-width':.9},svg);txt(x0+382,182,'dominant, 47 responses','bv',svg,'start');
}
function buildRefs(){
  var ul=$('reflist');if(!ul){return;}
  var ks=Object.keys(REFS).sort(function(a,b){return REFS[a].s.toLowerCase()<REFS[b].s.toLowerCase()?-1:1;});
  ul.innerHTML='';
  ks.forEach(function(k){var r=REFS[k];H('li',null,esc(r.f)+(r.u?' <a href="'+esc(r.u)+'" rel="noopener">'+esc(r.u.replace(/^https?:\/\//,''))+'</a>':'')+(r.n?' <span class="rn">'+esc(r.n)+'</span>':''),ul);});
}

function buildText(){
  if($('about-a')){$('about-a').innerHTML=ABOUT_A;$('about-b').innerHTML=ABOUT_B;}
  var ol=$('methlist');if(ol){ol.innerHTML='';METHODS.forEach(function(m){H('li',null,'<b>'+esc(m[0])+'.</b> '+esc(m[1]),ol);});}
  var s=$('series'),h='<h3>The 1963 series</h3><dl class="series">';SERIES.forEach(function(r){h+='<dt>'+esc(r[0])+'</dt> <dd>'+esc(r[1])+'</dd>';});s.innerHTML=h+'</dl>';
  $('cap2').textContent=CAP2;
}

/* ---------- events ---------- */
document.addEventListener('click',function(ev){
  var t=ev.target;if(!t.closest){return;}
  var a=t.closest('nav.menu a');
  if(a){var h=a.getAttribute('href')||'';if(h.charAt(0)==='#'&&h.length>1){ev.preventDefault();var el=$(h.slice(1));if(el){el.scrollIntoView({block:'start'});}}return;}
  var b=t.closest('[data-step]');if(b){step(parseInt(b.getAttribute('data-step'),10));return;}
  if(t.id==='m-prev'){step(-1);return;}
  if(t.id==='m-next'){step(1);return;}
  var gb=t.closest('[data-g]');if(gb){setGroup(gb.getAttribute('data-g'));return;}
  var d=t.closest('[data-id]');if(d){if(d.tagName==='A'){if(ev.metaKey||ev.ctrlKey||ev.shiftKey){return;}ev.preventDefault();}select(d.getAttribute('data-id'),{scroll:!!d.getAttribute('data-scroll')});return;}
  var z=t.closest('.zn');if(z){pickZone(z.getAttribute('data-z'));return;}
});
document.addEventListener('keydown',function(ev){
  var t=ev.target,tag=t&&t.tagName?t.tagName.toLowerCase():'';
  if(tag==='select'||tag==='input'){return;}
  if((ev.key==='Enter'||ev.key===' ')&&t.getAttribute&&t.getAttribute('data-id')&&tag!=='button'){ev.preventDefault();select(t.getAttribute('data-id'));return;}
  if(ev.metaKey||ev.ctrlKey||ev.altKey){return;}
  if(ev.key==='ArrowRight'){step(1);ev.preventDefault();}
  if(ev.key==='ArrowLeft'){step(-1);ev.preventDefault();}
});
document.addEventListener('mouseover',function(ev){
  var t=ev.target;if(!t.closest){return;}
  var st=$('status'),e=t.closest('[data-id]'),z,b;
  if(e&&EID[e.getAttribute('data-id')]){var x=EID[e.getAttribute('data-id')];st.textContent=x.l+'. '+(x.count||GK[x.g].l);return;}
  z=t.closest('.zn');if(z){st.textContent=ZNAME[z.getAttribute('data-z')];return;}
  b=t.closest('[data-tip]');if(b){st.textContent=b.getAttribute('data-tip');}
});
$('pick').addEventListener('change',function(){if(EID[this.value]){select(this.value,{scroll:true});}});
window.addEventListener('hashchange',function(){var h=location.hash.slice(1);if(/^(sen|mot)-/.test(h)){location.replace(BODYURL+'#'+h);return;}if(EID[h]&&h!==state.sel){select(h,{nohash:true});}});
function toolh(){var st=document.documentElement.style;st.setProperty('--toolh',$('tools').offsetHeight+'px');st.setProperty('--headh',document.querySelector('header.top').offsetHeight+'px');fitPlate();}
/* While the opening lines are still on screen the pinned plate starts lower, so it is made shorter by the same amount and never runs off the bottom. */
function fitPlate(){
  var st=document.documentElement.style;
  if(isNarrow()){st.removeProperty('--p1h');return;}
  var stick=document.querySelector('header.top').offsetHeight+$('tools').offsetHeight,top=Math.max(stick,$('duo').getBoundingClientRect().top);
  st.setProperty('--p1h',Math.max(260,window.innerHeight-top-26)+'px');
}
var FITQ=false;window.addEventListener('scroll',function(){if(FITQ){return;}FITQ=true;(window.requestAnimationFrame||setTimeout)(function(){FITQ=false;fitPlate();});},{passive:true});
function relayout(){toolh();if(paneMode()!==PMODE){buildPlate();}}
window.addEventListener('resize',relayout);
if(MQ&&MQ.addEventListener){MQ.addEventListener('change',relayout);}
if(document.fonts&&document.fonts.ready){document.fonts.ready.then(toolh);}

/* ---------- start ---------- */
var h0='';try{h0=location.hash.slice(1);}catch(x){}
if(/^(sen|mot)-/.test(h0)){location.replace(BODYURL+'#'+h0);return;}
window.__E={ENTRIES:ENTRIES,LATER:LATER,REFS:REFS,ZONES:ZONES,GROUPS:GROUPS,SLUG:SLUG};
buildKey();buildChart();buildRefs();buildText();toolh();
select(EID[h0]?h0:'voices',{nohash:true,noscroll:true});
toolh();

/* ---------- the title plate ---------- */
(function(){
var tp=document.getElementById('plate'),go=document.getElementById('plate-go'),root=document.documentElement;if(!tp||/(^|\s)plate-off(\s|$)/.test(root.className)){return;}
function past(){try{sessionStorage.setItem('pm-plate','1');}catch(x){}window.removeEventListener('scroll',watch);}
function watch(){if(window.pageYOffset>=tp.offsetTop+tp.offsetHeight-document.querySelector('header.top').offsetHeight-4){past();}}   /* once the plate has been scrolled past, a return in this visit starts at the map */
window.addEventListener('scroll',watch,{passive:true});
go.addEventListener('click',function(ev){var m=document.getElementById('map');if(!m||ev.metaKey||ev.ctrlKey||ev.shiftKey){return;}ev.preventDefault();ev.stopPropagation();
  m.scrollIntoView({block:'start',behavior:window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
})();
})();
