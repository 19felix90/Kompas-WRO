/* Kompas WRO 0.2 — user-facing app, no build step required. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const CITY = [51.108,17.035];
  const ZONES = {
    all:    {name:'Cały Wrocław', bbox:[50.985,16.800,51.225,17.225], center:CITY, zoom:11},
    center: {name:'Centrum', bbox:[51.087,16.985,51.140,17.096], center:[51.113,17.041], zoom:13},
    west:   {name:'Zachód', bbox:[51.066,16.800,51.191,17.014], center:[51.120,16.945], zoom:12},
    east:   {name:'Wschód', bbox:[51.041,17.062,51.180,17.222], center:[51.112,17.130], zoom:12},
    north:  {name:'Północ', bbox:[51.126,16.970,51.226,17.142], center:[51.172,17.049], zoom:12},
    south:  {name:'Południe', bbox:[50.984,16.941,51.104,17.146], center:[51.047,17.039], zoom:12}
  };
  const CATS = {districts:'OSIEDLE',streets:'ULICA',crossings:'SKRZYŻOWANIE',landmarks:'PUNKT'};
  const GIS_ROOT = 'https://gis.um.wroc.pl/portal_srv/rest/services/search/MapServer';
  const PREFS_KEY = 'kompas-wro-pref-v02';
  const PROGRESS_KEY = 'kompas-wro-progress-v1'; // honor results from original version
  const CACHE_MAX_AGE = 7*24*60*60*1000;
  const SEED = window.WRO_STARTER || {districts:[],streets:[],crossings:[],landmarks:[]};
  const currentPrefs = localRead(PREFS_KEY,{});
  const state = {
    mode:'mixed', kind:'learn', zone:'all', difficulty:'medium', showLabels:true,
    sources:{districts:[],streets:[],crossings:[],landmarks:[]},
    officialDistricts:false,officialStreets:false, syncing:false,
    items:[], current:null, selected:null, answered:false,
    recent:[], questionNo:0, mapReady:false,
    apiKey:currentPrefs.apiKey||'',
    progress:localRead(PROGRESS_KEY,{entries:{},answered:0,correct:0,streak:0})
  };
  let map=null, tiles=null, baseLayer=null, answerLayer=null, dbPromise=null;
  const memoryCache=new Map();

  function localRead(k,fallback) {try{const txt=localStorage.getItem(k);return txt?JSON.parse(txt):fallback;}catch(_){return fallback;}}
  function localWrite(k,v) {try{localStorage.setItem(k,JSON.stringify(v));}catch(_){}}
  function setText(id,text) {$(id).textContent=String(text);}
  function esc(s) {return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function fmt(m) {return m>=1000?(m/1000).toFixed(1).replace('.',',')+' km':Math.round(m)+' m';}
  function norm(s) {return String(s||'').toLocaleLowerCase('pl-PL').normalize('NFKC').replace(/\s+/g,' ').trim();}
  function cleanStreetName(name) {return String(name||'').replace(/^\s*(ulica|ul\.|aleja|al\.|plac|pl\.)\s*/i,'').replace(/\s+/g,' ').trim();}
  function keyOf(cat,name) {return cat+':'+norm(cat==='streets'?cleanStreetName(name):name);}
  function inBBox(p,b) {return !!p&&p[0]>=b[0]&&p[0]<=b[2]&&p[1]>=b[1]&&p[1]<=b[3];}
  function sourceLabel(item) {return item.source==='sip'?'Dokładne dane miejskie SIP':item.source==='gis-crossing'?'Skrzyżowanie wyznaczone z danych SIP':item.source==='osm'?'OpenStreetMap':'Położenie orientacyjne — zestaw startowy';}
  function status(message,error=false) {setText('dataStatus',message);$('dataStatus').classList.toggle('error',error);}
  function setConnection() {const online=navigator.onLine;$('connectionDot').classList.toggle('offline',!online);setText('connectionLabel',online?'Mapa online':'Brak internetu');}
  function zoneBounds() {const b=ZONES[state.zone].bbox;return [[b[0],b[1]],[b[2],b[3]]];}
  function home() {if(!map)return;if(state.zone==='all')map.setView(CITY,11);else map.fitBounds(zoneBounds(),{padding:[20,20],maxZoom:13});}
  function haversine(a,b) {const r=Math.PI/180,dy=(a[0]-b[0])*r,dx=(a[1]-b[1])*r;const h=Math.sin(dy/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dx/2)**2;return 12742000*Math.asin(Math.min(1,Math.sqrt(h)));}
  function distanceToSegment(p,a,b) {const sx=111320*Math.cos(p[0]*Math.PI/180),sy=111320,ax=(a[1]-p[1])*sx,ay=(a[0]-p[0])*sy,bx=(b[1]-p[1])*sx,by=(b[0]-p[0])*sy,dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/(dx*dx+dy*dy||1)));return {dist:Math.hypot(ax+t*dx,ay+t*dy),point:[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]};}
  function nearestLine(p,segments) {let closest={dist:Infinity,point:p};for(const coords of segments)for(let i=1;i<coords.length;i++){const v=distanceToSegment(p,coords[i-1],coords[i]);if(v.dist<closest.dist)closest=v;}return closest;}
  function pointInRing(p,ring) {const x=p[1],y=p[0];let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];if((yi>y)!==(yj>y) && x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
  function pointInGeometry(p,geo) {const polygons=geo?.type==='Polygon'?[geo.coordinates]:geo?.type==='MultiPolygon'?geo.coordinates:[];return polygons.some(poly=>poly.length&&pointInRing(p,poly[0])&&!poly.slice(1).some(hole=>pointInRing(p,hole)));}
  function polygonDistance(p,geom) {if(pointInGeometry(p,geom))return {dist:0,point:p};const polys=geom.type==='Polygon'?[geom.coordinates]:geom.type==='MultiPolygon'?geom.coordinates:[],segs=[];for(const poly of polys)for(const ring of poly)segs.push(ring.map(v=>[v[1],v[0]]));return nearestLine(p,segs);}
  function midpointFromGeo(geometry) {
    const polys=geometry.type==='Polygon'?[geometry.coordinates]:geometry.type==='MultiPolygon'?geometry.coordinates:[];
    // Prefer point inside the polygon instead of a bounding-box center which may lie outside it.
    for(const poly of polys){if(!poly.length||!poly[0].length)continue;const ring=poly[0];let lon=0,lat=0;for(const p of ring){lon+=p[0];lat+=p[1];}const pos=[lat/ring.length,lon/ring.length];if(pointInGeometry(pos,geometry))return pos;
      const first=ring[0],second=ring[Math.floor(ring.length/2)]||first;return [(first[1]+second[1])/2,(first[0]+second[0])/2];}
    return CITY;
  }
  function segmentLength(parts) {let len=0;for(const coords of parts)for(let i=1;i<coords.length;i++)len+=haversine(coords[i-1],coords[i]);return len;}
  function pointHalfway(parts) {const len=segmentLength(parts);let walked=0;for(const coords of parts)for(let i=1;i<coords.length;i++){const l=haversine(coords[i-1],coords[i]);if(walked+l>=len/2){const t=(len/2-walked)/(l||1);return [coords[i-1][0]+t*(coords[i][0]-coords[i-1][0]),coords[i-1][1]+t*(coords[i][1]-coords[i-1][1])];}walked+=l;}return parts[0]?.[0]||CITY;}

  function initializeStarter() {
    for(const [category,records] of Object.entries(SEED)) {
      state.sources[category]=records.map(row=>{
        const [name,lat,lon,subtype]=row;const item={cat:category,key:keyOf(category,name),name,position:[lat,lon],source:'starter',priority:1.5};
        if(category==='crossings'){item.roads=name.split(' × ');item.priority=1.3;}
        if(category==='landmarks'){item.subtype=subtype||'miejsce';item.priority=1.8;}
        if(category==='streets')item.priority=1.7;
        return item;
      });
    }
    updateVisible(false);
  }
  function itemFitsZone(item) {if(state.zone==='all')return true;const b=ZONES[state.zone].bbox;if(inBBox(item.position,b))return true;if(item.segments)return item.segments.some(part=>part.some(p=>inBBox(p,b)));return false;}
  function visibleItems() {
    const cats=state.mode==='mixed'?Object.keys(CATS):[state.mode];
    return cats.flatMap(cat=>(state.sources[cat]||[]).filter(itemFitsZone));
  }
  function updateVisible(autoselect=true) {
    state.items=visibleItems();setText('datasetCount',state.items.length.toLocaleString('pl-PL')+' miejsc');
    const cs=Object.keys(CATS).map(cat=>state.sources[cat].length).join('/');
    if(!state.syncing)status('Baza: osiedla / ulice / skrzyżowania / punkty: '+cs+'. '+(state.officialStreets?'Ulice SIP wczytane.':'Dane startowe gotowe.'));
    renderLearnList();renderBaseLayer();
    // Promote a starter pin to the exact GIS geometry as soon as it arrives.
    if(state.kind==='learn'&&state.selected&&state.selected.source==='starter'){
      const upgraded=state.items.find(item=>item.key===state.selected.key&&item.source!=='starter');
      if(upgraded){state.selected=upgraded;displayItemOnMap(upgraded,true);displayPlaceDetails(upgraded);}
    }
    if(state.kind==='quiz'&&state.current&&state.current.source==='starter'){
      const upgraded=state.items.find(item=>item.key===state.current.key&&item.source!=='starter');
      if(upgraded)state.current=upgraded;
    }
    if(autoselect&&state.kind==='learn'&&!state.selected)randomLearn();
  }
  function chosenCategory(items) {
    if(state.mode!=='mixed')return state.mode;
    const categories=Object.keys(CATS).filter(cat=>items.some(item=>item.cat===cat));
    if(!categories.length)return null;
    // All categories have equal chance regardless of number of street names.
    const previous=state.recent.length?state.recent[state.recent.length-1].split(':')[0]:null;
    const alternatives=categories.filter(cat=>cat!==previous);
    const pool=alternatives.length?alternatives:categories;
    return pool[Math.floor(Math.random()*pool.length)];
  }
  function chooseItem() {
    if(!state.items.length)return null;
    const category=chosenCategory(state.items),within=state.items.filter(i=>i.cat===category);
    let candidates=within.filter(i=>!state.recent.includes(i.key));if(!candidates.length)candidates=within;
    let total=0;const now=Date.now();const weighted=candidates.map(item=>{
      const p=state.progress.entries[item.key]||{correct:0,wrong:0,due:0};
      let weight=item.priority||1;
      if(!p.correct&&!p.wrong)weight*=1.5;
      if(p.wrong>p.correct)weight*=1.7;
      if(p.due>now)weight*=.45;
      total+=weight;return [item,weight];
    });
    let selection=Math.random()*total;let answer=weighted[weighted.length-1][0];for(const [item,w] of weighted){selection-=w;if(selection<=0){answer=item;break;}}
    state.recent.push(answer.key);if(state.recent.length>12)state.recent.shift();return answer;
  }

  function initializeMap() {
    if(typeof L==='undefined'){status('Nie udało się załadować silnika mapy Leaflet. Internet może być niedostępny. Losowanie i linki Street View nadal działają.',true);setText('mapHelp','Mapa niedostępna — sprawdź połączenie i odśwież stronę.');return;}
    map=L.map('map',{zoomControl:false,preferCanvas:true,minZoom:9,maxZoom:19}).setView(CITY,11);
    tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,maxNativeZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    L.control.zoom({position:'topright'}).addTo(map);
    baseLayer=L.layerGroup().addTo(map);answerLayer=L.layerGroup().addTo(map);
    map.on('click',e=>{if(state.kind==='quiz'&&!state.answered&&state.current)submitGuess(e.latlng);});
    state.mapReady=true;presentation();renderBaseLayer();
  }
  function presentation() {
    const hidden=state.kind==='quiz'&&!state.showLabels;
    $('map').parentElement.classList.toggle('quiz-map',hidden);
    $('labelsToggle').setAttribute('aria-pressed',String(!hidden));setText('labelsToggle',hidden?'◎ Pokaż podpisy':'◉ Ukryj podpisy');
    setText('mapModeLabel',hidden?'QUIZ · MAPA BEZ NAZW':'NAUKA · ODKRYWAJ MIASTO');
    $('learnTab').classList.toggle('active',state.kind==='learn');$('quizTab').classList.toggle('active',state.kind==='quiz');
    $('learnTab').setAttribute('aria-pressed',String(state.kind==='learn'));$('quizTab').setAttribute('aria-pressed',String(state.kind==='quiz'));
    $('quizPanel').hidden=state.kind!=='quiz';$('learnPanel').hidden=state.kind!=='learn';
    $('difficultyWrapper').hidden=state.kind!=='quiz';
    $('mapRandomBtn').hidden=state.kind!=='learn';
  }
  function renderBaseLayer() {
    if(!baseLayer)return;baseLayer.clearLayers();
    if(state.kind==='quiz'){
      // Outline districts in quiz to give geographical context without revealing names.
      for(const d of state.sources.districts){if(!d.geometry||!itemFitsZone(d))continue;
        L.geoJSON(d.geometry,{style:{color:'#a2b9bc',weight:1.1,fillColor:'#79caba',fillOpacity:.035},interactive:false}).addTo(baseLayer);
      }
    }
  }
  function labelMarker(item) {
    if(!answerLayer)return;
    const icon=L.divIcon({className:'place-label-icon',html:'<span class="place-label-pill">'+esc(item.name)+'</span>',iconSize:[0,0],iconAnchor:[0,0]});
    L.marker(item.position,{icon,interactive:false,zIndexOffset:300}).addTo(answerLayer);
  }
  function displayItemOnMap(item,fit=true) {
    if(!answerLayer)return;answerLayer.clearLayers();
    if(item.geometry){
      const outline=L.geoJSON(item.geometry,{style:{color:'#008e77',weight:3,fillColor:'#33c9ac',fillOpacity:.26},interactive:false}).addTo(answerLayer);
      if(fit){const b=outline.getBounds();if(b.isValid())map.fitBounds(b,{padding:[48,48],maxZoom:14});}
    }else if(item.segments?.length){
      for(const part of item.segments)L.polyline(part,{color:'#079c88',weight:6,opacity:.95,interactive:false,lineCap:'round'}).addTo(answerLayer);
      if(fit){const bounds=L.latLngBounds([]);for(const part of item.segments)for(const p of part)bounds.extend(p);if(bounds.isValid())map.fitBounds(bounds,{padding:[55,55],maxZoom:15});}
    }else{
      L.circleMarker(item.position,{radius:item.cat==='districts'?12:10,color:'#fff',weight:3,fillColor:'#0aaf93',fillOpacity:.95,interactive:false}).addTo(answerLayer);
      if(fit)map.setView(item.position,item.cat==='districts'?13:15);
    }
    labelMarker(item);
  }
  function showLearnItem(item) {
    if(state.kind!=='learn')return;
    state.selected=item;state.current=null;
    displayItemOnMap(item,true);displayPlaceDetails(item,false);
    setText('mapHelp','Zielony obszar, linia lub znacznik: '+item.name+'.');
  }
  function randomLearn() {const item=chooseItem();if(item)showLearnItem(item);else showNoItems();}
  function showNoItems() {if(state.kind==='learn'){
    state.selected=null;setText('spotName','Brak miejsc w tym obszarze');setText('spotDescription','Wybierz większy obszar lub kategorię „Wszystko”.');clearPhoto();
  }else{setText('questionTitle','Brak pytań');$('revealBtn').disabled=true;$('nextBtn').disabled=true;}}
  function setMode(mode) {
    if(mode===state.mode)return;state.mode=mode;state.selected=null;state.current=null;
    document.querySelectorAll('[data-mode]').forEach(btn=>{const active=btn.dataset.mode===mode;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});
    $('searchInput').value='';$('learnList').hidden=true;answerLayer?.clearLayers();updateVisible(false);home();
    state.kind==='learn'?randomLearn():nextQuestion();
  }
  function setKind(kind) {
    if(kind===state.kind)return;state.kind=kind;state.showLabels=kind==='learn';state.selected=null;state.current=null;
    presentation();renderBaseLayer();answerLayer?.clearLayers();
    if(kind==='learn')randomLearn();else nextQuestion();
  }
  function nextQuestion() {
    if(state.kind!=='quiz')return;
    state.current=chooseItem();state.selected=null;state.answered=false;answerLayer?.clearLayers();
    $('feedback').hidden=true;setLockedPhoto();
    if(!state.current){showNoItems();return;}
    state.questionNo++;
    const item=state.current;
    setText('questionNumber','PYTANIE '+String(state.questionNo).padStart(2,'0'));
    setText('questionCategory',CATS[item.cat]);
    const questions={districts:'Gdzie znajduje się osiedle '+item.name+'?',streets:'Gdzie przebiega '+item.name+'?',crossings:'Gdzie krzyżują się '+(item.roads?.join(' i ')||item.name)+'?',landmarks:'Gdzie znajduje się '+item.name+'?'};
    setText('questionTitle',questions[item.cat]);
    setText('questionInstruction',item.cat==='districts'?'Wskaż punkt na obszarze osiedla.':'Przybliż mapę i wskaż lokalizację.');
    $('nextBtn').disabled=true;$('revealBtn').disabled=false;
    setText('mapHelp','Dotknij mapy, aby wskazać odpowiedź.');home();
  }
  function getTolerance(item) {
    const tol={easy:{districts:1800,streets:750,crossings:650,landmarks:650},medium:{districts:1000,streets:420,crossings:330,landmarks:320},hard:{districts:470,streets:170,crossings:160,landmarks:140}};
    return tol[state.difficulty][item.cat];
  }
  function nearestAnswer(item,latlng) {
    const p=[latlng.lat,latlng.lng];
    if(item.geometry)return polygonDistance(p,item.geometry);
    if(item.segments?.length)return nearestLine(p,item.segments);
    return {dist:haversine(p,item.position),point:item.position};
  }
  function submitGuess(latlng) {
    if(!state.current||state.answered)return;
    const result=nearestAnswer(state.current,latlng);
    const correct=state.current.geometry?result.dist===0:result.dist<=getTolerance(state.current);
    showAnswer(result,latlng,correct,false);
  }
  function revealAnswer() {if(!state.current||state.answered)return;showAnswer({dist:Infinity,point:state.current.position},null,false,true);}
  function recordAnswer(item,correct) {
    const p=state.progress,r=p.entries[item.key]||{correct:0,wrong:0,due:0};
    if(correct){p.correct++;p.streak++;r.correct++;}else{r.wrong++;p.streak=0;}
    p.answered++;r.due=Date.now()+(correct?Math.min(14,r.correct*2)*86400000:2*3600000);
    p.entries[item.key]=r;localWrite(PROGRESS_KEY,p);updateStats();
  }
  function showAnswer(result,guess,correct,skipped) {
    const item=state.current;state.answered=true;recordAnswer(item,correct);
    displayItemOnMap(item,skipped||!correct);
    if(guess&&answerLayer){
      const guessIcon=L.divIcon({className:'guess-pin',html:'<div></div>',iconSize:[17,17],iconAnchor:[8,8]});
      L.marker([guess.lat,guess.lng],{icon:guessIcon,interactive:false}).addTo(answerLayer);
      if(result.dist>15)L.polyline([[guess.lat,guess.lng],result.point],{color:correct?'#098e76':'#d35b50',weight:2,opacity:.9,dashArray:'7 6',interactive:false}).addTo(answerLayer);
    }
    const feedback=$('feedback');feedback.hidden=false;feedback.classList.toggle('bad',!correct);
    feedback.textContent=skipped?'Prawidłowa lokalizacja:':correct?'Brawo! Trafione!':'Spójrz na prawidłową lokalizację.';
    const detail=document.createElement('span');detail.className='feedback-detail';
    detail.textContent=skipped?'Miejsce wróci w powtórkach.':item.geometry?(correct?'Wskazałeś miejsce wewnątrz granic osiedla.':'Odległość od osiedla: '+fmt(result.dist)+'.'):'Odległość: '+fmt(result.dist)+' · tolerancja: '+fmt(getTolerance(item))+'.'+(item.source==='starter'?' Dane orientacyjne.':'');
    feedback.appendChild(detail);$('nextBtn').disabled=false;$('revealBtn').disabled=true;
    displayPlaceDetails(item,false);setText('mapHelp','Zielony: prawidłowe miejsce. Czerwony: Twoje wskazanie.');
  }
  function updateStats() {const p=state.progress;setText('statAnswered',p.answered||0);setText('statAccuracy',p.answered?Math.round(100*(p.correct||0)/p.answered)+'%':'0%');setText('statStreak',p.streak||0);}
  function googleStreetURL(item) {const point=item.position.map(n=>Number(n).toFixed(6)).join(',');return 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+encodeURIComponent(point);}
  function googleEmbedURL(item) {const point=item.position.map(n=>Number(n).toFixed(6)).join(',');return 'https://www.google.com/maps/embed/v1/streetview?'+new URLSearchParams({key:state.apiKey,location:point,source:'outdoor',radius:'250',fov:'82',pitch:'4'}).toString();}
  function clearPhoto() {const f=$('streetViewFrame');f.hidden=true;f.removeAttribute('src');$('photoFallback').hidden=false;$('streetViewLink').setAttribute('aria-disabled','true');$('streetViewLink').removeAttribute('href');$('streetViewLink').tabIndex=-1;setText('spotLocation','');}
  function setLockedPhoto() {
    setText('spotCategory','QUIZ');setText('spotName','Najpierw wskaż miejsce');setText('spotDescription','Zdjęcie i położenie ujawnią się po udzieleniu odpowiedzi lub wybraniu „Pokaż odpowiedź”.');
    clearPhoto();setText('photoFallbackTitle','Najpierw odpowiedz na pytanie');setText('photoFallbackText','Mapa i panorama zostaną pokazane po odpowiedzi.');
  }
  function displayPlaceDetails(item,locked=false) {
    if(locked){setLockedPhoto();return;}
    setText('spotCategory',CATS[item.cat]);setText('spotName',item.name);
    const text={districts:'Zobacz położenie i granice osiedla względem innych części Wrocławia.',streets:item.segments?'Zobacz dokładny przebieg ulicy na mapie miasta.':'Zobacz orientacyjne położenie ulicy. Dokładny przebieg pojawi się po synchronizacji z SIP.',crossings:'Porównaj przebieg obu ulic i zobacz skrzyżowanie z poziomu ulicy.',landmarks:'Zapamiętaj punkt orientacyjny i jego otoczenie.'};
    setText('spotDescription',text[item.cat]);
    setText('spotLocation',sourceLabel(item)+' · '+item.position.map(n=>Number(n).toFixed(4)).join(', '));
    const link=$('streetViewLink');link.href=googleStreetURL(item);link.setAttribute('aria-disabled','false');link.tabIndex=0;
    setText('photoFallbackTitle',item.cat==='districts'?'Zobacz osiedle z ulicy':'Zobacz miejsce z poziomu ulicy');
    setText('photoFallbackText','Google Street View otwiera najbliższą dostępną panoramę. Możesz także włączyć podgląd w tym panelu.');
    const frame=$('streetViewFrame');
    if(state.apiKey){frame.src=googleEmbedURL(item);frame.hidden=false;$('photoFallback').hidden=true;}
    else {frame.hidden=true;frame.removeAttribute('src');$('photoFallback').hidden=false;}
  }
  function renderLearnList() {
    const input=$('searchInput'),term=norm(input.value);const list=$('learnList');list.replaceChildren();
    if(state.kind!=='learn'||!term){list.hidden=true;return;}
    const hits=state.items.filter(i=>norm(i.name).includes(term)).sort((a,b)=>a.name.localeCompare(b.name,'pl')).slice(0,24);
    if(!hits.length){const empty=document.createElement('div');empty.className='learn-empty';empty.textContent='Brak pasujących miejsc w tym obszarze.';list.appendChild(empty);}
    for(const item of hits){const btn=document.createElement('button');btn.type='button';btn.className='learn-item';
      const name=document.createElement('span');name.textContent=item.name;const cat=document.createElement('small');cat.textContent=CATS[item.cat];btn.append(name,cat);
      btn.addEventListener('click',()=>{input.value='';list.hidden=true;showLearnItem(item);});list.appendChild(btn);
    }
    list.hidden=false;
  }

  async function fetchJSON(url,ms=22000) {
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),ms);
    try {const res=await fetch(url,{signal:controller.signal,mode:'cors',cache:'default'});if(!res.ok)throw new Error('HTTP '+res.status);const data=await res.json();if(data.error)throw new Error(data.error.message||'Serwer zwrócił błąd');return data;}finally{clearTimeout(timeout);}
  }
  function getDB() {
    if(!('indexedDB' in window))return Promise.resolve(null);if(dbPromise)return dbPromise;
    dbPromise=new Promise(resolve=>{try{const request=indexedDB.open('KompasWroCache',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('datasets'))request.result.createObjectStore('datasets');};request.onsuccess=()=>resolve(request.result);request.onerror=()=>resolve(null);}catch(_){resolve(null);}});
    return dbPromise;
  }
  async function readCache(key){if(memoryCache.has(key))return memoryCache.get(key);const db=await getDB();if(!db)return null;
    return new Promise(resolve=>{try{const r=db.transaction('datasets','readonly').objectStore('datasets').get(key);r.onsuccess=()=>{const v=r.result;if(v&&Date.now()-v.time<CACHE_MAX_AGE){memoryCache.set(key,v.data);resolve(v.data);}else resolve(null);};r.onerror=()=>resolve(null);}catch(_){resolve(null);}});
  }
  async function saveCache(key,data){memoryCache.set(key,data);const db=await getDB();if(!db)return;try{db.transaction('datasets','readwrite').objectStore('datasets').put({time:Date.now(),data},key);}catch(_){}}
  function normalizeDistricts(response){if(response?.type!=='FeatureCollection')throw Error('Niepoprawna odpowiedź osiedli');const result=[];
    for(const f of response.features||[]){const name=f.properties?.NAZWAOSIEDLA||f.properties?.nazwaosiedla||f.properties?.NAZWA||f.properties?.name;
      if(!name||!['Polygon','MultiPolygon'].includes(f.geometry?.type))continue;
      result.push({cat:'districts',key:keyOf('districts',name),name,geometry:f.geometry,position:midpointFromGeo(f.geometry),source:'sip',priority:1.6});}
    if(result.length<35)throw Error('Wczytano tylko '+result.length+' granic osiedli');return result;
  }
  function arcGISQueryUrl(layer,params){const url=new URL(GIS_ROOT+'/'+layer+'/query');for(const [k,v] of Object.entries(params))url.searchParams.set(k,v);return url.toString();}
  async function loadOfficialDistricts(force=false){const key='sip-districts-v02';const cached=force?null:await readCache(key);if(cached?.length>35)return cached;
    const url=arcGISQueryUrl(12,{where:'1=1',outFields:'OBJECTID,NAZWAOSIEDLA',outSR:'4326',geometryPrecision:'5',maxAllowableOffset:'0.00007',f:'geojson'});
    const result=normalizeDistricts(await fetchJSON(url,20000));await saveCache(key,result);return result;
  }
  function normalizeCityRoads(features) {
    const result=new Map();
    for(const f of features){const p=f.properties||{},label=p.ETYKIETA||p.NAZWAGLOWNACZESC||p.NAZWACZESC;
      if(typeof label!=='string'||!label.trim()||label.length>90)continue;
      const name=cleanStreetName(label);if(!name)continue;
      const geom=f.geometry;if(!geom||!['LineString','MultiLineString'].includes(geom.type))continue;
      const parts=(geom.type==='LineString'?[geom.coordinates]:geom.coordinates).map(part=>part.filter(c=>Array.isArray(c)&&Number.isFinite(c[0])&&Number.isFinite(c[1])).map(c=>[c[1],c[0]])).filter(part=>part.length>=2);
      if(!parts.length)continue;const key=keyOf('streets',name);
      let entry=result.get(key);if(!entry){entry={cat:'streets',key,name,position:[],segments:[],source:'sip',priority:1.7};result.set(key,entry);}entry.segments.push(...parts);
    }
    const roads=[];
    for(const entry of result.values()){entry.length=segmentLength(entry.segments);if(entry.length<65)continue;entry.position=pointHalfway(entry.segments);
      entry.priority=Math.min(3.3,1.2+Math.log10(1+entry.length/450));roads.push(entry);}
    roads.sort((a,b)=>b.length-a.length);
    if(roads.length<80)throw Error('Serwer zwrócił zbyt mało ulic: '+roads.length);
    return roads;
  }
  async function loadOfficialStreets(force=false) {
    const key='sip-streets-v02';const cached=force?null:await readCache(key);if(cached?.length>80)return cached;
    const features=[];const pageSize=850;
    for(let page=0;page<15;page++){
      const url=arcGISQueryUrl(8,{where:'1=1',outFields:'OBJECTID,ETYKIETA,NAZWACZESC,NAZWAGLOWNACZESC,TYP',outSR:'4326',geometryPrecision:'5',maxAllowableOffset:'0.00007',resultOffset:String(page*pageSize),resultRecordCount:String(pageSize),f:'geojson'});
      const data=await fetchJSON(url,21000);
      if(data.type!=='FeatureCollection'||!Array.isArray(data.features))throw Error('Niepoprawne dane ulic SIP');
      if(!data.features.length)break;
      features.push(...data.features);
      if(data.features.length<pageSize)break;
    }
    const normalized=normalizeCityRoads(features);await saveCache(key,normalized);return normalized;
  }
  function buildCrossings(roads) {
    // Look for near-coincident vertices from different street axes. Angle filter rejects parallel roads.
    const grid=new Map(),pairs=new Map();const size=.00017,maxItems=350;
    function heading(coords,i) {const prev=coords[Math.max(0,i-1)],next=coords[Math.min(coords.length-1,i+1)];const dx=(next[1]-prev[1])*Math.cos(coords[i][0]*Math.PI/180),dy=next[0]-prev[0];const len=Math.hypot(dx,dy)||1;return [dx/len,dy/len];}
    for(const road of roads){if(road.length<110)continue;
      for(const part of road.segments){if(part.length<2)continue;const stride=Math.max(1,Math.floor(part.length/130));
        for(let i=0;i<part.length;i+=stride){const pos=part[i],x=Math.floor(pos[0]/size),y=Math.floor(pos[1]/size),dir=heading(part,i);
          for(let xx=x-1;xx<=x+1;xx++)for(let yy=y-1;yy<=y+1;yy++)for(const other of grid.get(xx+','+yy)||[]){
            if(other.road.key===road.key||haversine(pos,other.pos)>15)continue;
            const angle=Math.abs(dir[0]*other.dir[0]+dir[1]*other.dir[1]);if(angle>.91)continue;
            const names=[road.name,other.road.name].sort((a,b)=>a.localeCompare(b,'pl'));
            const pairKey=names.join(' × ');const old=pairs.get(pairKey)||[];
            if(old.some(o=>haversine(o.position,pos)<160))continue;
            const center=[(pos[0]+other.pos[0])/2,(pos[1]+other.pos[1])/2];
            old.push({cat:'crossings',key:keyOf('crossings',pairKey)+':'+old.length,name:pairKey,roads:names,position:center,source:'gis-crossing',priority:Math.min(3,1+Math.log10(1+Math.min(road.length,other.road.length)/300))});
            pairs.set(pairKey,old);
          }
          const cell=x+','+y;if(!grid.has(cell))grid.set(cell,[]);grid.get(cell).push({road,pos,dir});
        }
      }
    }
    const result=[...pairs.values()].flat().sort((a,b)=>b.priority-a.priority).slice(0,maxItems);
    // Keep a small manually selected starter set available even if GIS road axes do not share vertices.
    const starter=SEED.crossings.map(r=>({cat:'crossings',key:keyOf('crossings',r[0]),name:r[0],roads:r[0].split(' × '),position:[r[1],r[2]],source:'starter',priority:1.1}));
    if(result.length>=20)return result;
    const good=new Set(result.map(i=>norm(i.name)));return result.concat(starter.filter(i=>!good.has(norm(i.name))));
  }
  async function synchronizeData(force=false) {
    if(state.syncing)return;state.syncing=true;$('retryBtn').disabled=true;
    status('Zestaw startowy jest gotowy. Pobieram dokładne granice osiedli i osie ulic z SIP Wrocław...');
    const jobs=[
      (async()=>{try{const districts=await loadOfficialDistricts(force);state.sources.districts=districts;state.officialDistricts=true;updateVisible(false);return true;}catch(e){console.warn('Granice osiedli:',e);return false;}})(),
      (async()=>{try{const roads=await loadOfficialStreets(force);state.sources.streets=roads;state.officialStreets=true;updateVisible(false);
        // Derive crossings after street geometry loads, no dependency on Overpass.
        state.sources.crossings=buildCrossings(roads);updateVisible(false);return true;
      }catch(e){console.warn('Ulice SIP:',e);return false;}})()
    ];
    const result=await Promise.all(jobs);state.syncing=false;$('retryBtn').disabled=false;updateVisible(false);
    if(result.every(Boolean))status('Gotowe: dokładne osiedla i ulice z SIP Wrocław. Losowanie, quiz i Street View działają.');
    else if(result.some(Boolean))status('Część danych z SIP wczytana. Pozostałe kategorie korzystają z zestawu startowego. Ponów synchronizację w razie potrzeby.');
    else status('Serwer SIP chwilowo niedostępny. Możesz normalnie używać zestawu startowego; miejsca mają orientacyjne współrzędne.',true);
  }
  function setAPIKey(event) {
    event.preventDefault();const key=$('apiKeyInput').value.trim();
    if(!/^[A-Za-z0-9_-]{20,128}$/.test(key)){alert('Sprawdź klucz API Google. Powinien zawierać wyłącznie litery, cyfry, - lub _.');return;}
    state.apiKey=key;localWrite(PREFS_KEY,{apiKey:key});$('apiKeyInput').value='';$('apiSettings').open=false;
    if(state.kind==='learn'&&state.selected)displayPlaceDetails(state.selected);
    if(state.kind==='quiz'&&state.answered&&state.current)displayPlaceDetails(state.current);
  }
  function clearAPIKey() {
    state.apiKey='';localWrite(PREFS_KEY,{apiKey:''});$('apiKeyInput').value='';
    if(state.kind==='learn'&&state.selected)displayPlaceDetails(state.selected);
    if(state.kind==='quiz'&&state.answered&&state.current)displayPlaceDetails(state.current);
  }
  function bindUI() {
    document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
    $('learnTab').addEventListener('click',()=>setKind('learn'));$('quizTab').addEventListener('click',()=>setKind('quiz'));
    $('zoneSelect').addEventListener('change',e=>{state.zone=e.target.value;state.selected=null;home();updateVisible(false);state.kind==='learn'?randomLearn():nextQuestion();});
    $('difficultySelect').addEventListener('change',e=>state.difficulty=e.target.value);
    $('randomBtn').addEventListener('click',randomLearn);$('mapRandomBtn').addEventListener('click',randomLearn);$('nextBtn').addEventListener('click',nextQuestion);
    $('revealBtn').addEventListener('click',revealAnswer);$('mapHomeBtn').addEventListener('click',home);
    $('labelsToggle').addEventListener('click',()=>{state.showLabels=!state.showLabels;presentation();});
    $('searchInput').addEventListener('input',renderLearnList);
    $('retryBtn').addEventListener('click',()=>synchronizeData(true));
    $('apiKeyForm').addEventListener('submit',setAPIKey);$('apiKeyClear').addEventListener('click',clearAPIKey);
    $('resetBtn').addEventListener('click',()=>{if(!confirm('Usunąć zapisane wyniki quizów i powtórki?'))return;state.progress={entries:{},answered:0,correct:0,streak:0};localWrite(PROGRESS_KEY,state.progress);updateStats();});
    window.addEventListener('online',setConnection);window.addEventListener('offline',setConnection);
  }
  function start() {
    initializeStarter();bindUI();initializeMap();updateStats();setConnection();presentation();
    randomLearn();synchronizeData(false);
    if('serviceWorker' in navigator && location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
    window.KompasWroTest={state,haversine,distanceToSegment,nearestLine,pointInRing,pointInGeometry,polygonDistance,normalizeDistricts,normalizeCityRoads,buildCrossings,googleStreetURL,googleEmbedURL,chooseItem,setMode,setKind,randomLearn,submitGuess,nextQuestion};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
