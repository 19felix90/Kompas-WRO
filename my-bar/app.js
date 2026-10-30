/* My Bar - aplikacja bez zależności, działająca w przeglądarce i jako PWA. */
'use strict';

const STORAGE_KEY='mybar_v1_2026';
const API='https://24cocktails.com/api/v1';
const TYPES={alcohol:'Alkohole',mixer:'Miksery i syropy',fresh:'Świeże produkty',other:'Pozostałe'};
const INDEX=new Map(INGREDIENTS.map(x=>[x.id,x]));
const TABS=[['home','Start','home'],['cocktails','Koktajle','glass'],['bar','Mój barek','bottle'],['shopping','Zakupy','basket'],['favorites','Ulubione','heart']];
const iconPaths={
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/>',
  glass:'<path d="M3 3h18L12 13 3 3Z"/><path d="M12 13v8M8 21h8"/><path d="m7 7 2 2"/>',
  bottle:'<path d="M10 2h4M11 2v5l-4.8 6.2A5 5 0 0 0 5.2 16v3.2A2.8 2.8 0 0 0 8 22h8a2.8 2.8 0 0 0 2.8-2.8V16a5 5 0 0 0-1-2.8L13 7V2"/><path d="M7 16h10"/>',
  basket:'<path d="m5 11 4-7m10 7-4-7M3 11h18l-2 10H5L3 11Z"/><path d="M8 15v3m4-3v3m4-3v3"/>',
  heart:'<path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.3 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
  settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
  sparkle:'<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/><path d="m19 17 .8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17Z"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  chevron:'<path d="m9 18 6-6-6-6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  cloud:'<path d="M6.5 19a4.5 4.5 0 1 1 1.1-8.8A6 6 0 0 1 19 12a3.5 3.5 0 0 1-1 7H6.5Z"/><path d="M12 11v7m-3-3 3 3 3-3"/>',
  refresh:'<path d="M20 8a8 8 0 1 0 1 6"/><path d="M20 3v5h-5"/>',
  external:'<path d="M13 5h6v6m0-6-9 9"/><path d="M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
  star:'<path d="m12 2 3.2 6.4 7.1 1-5.1 5 .9 7-6.1-3.3-6.1 3.3.9-7-5.1-5 7.1-1L12 2Z"/>',
  edit:'<path d="m14 4 6 6M4 20l4.5-.8L20 7.7 16.3 4 4.8 15.5 4 20Z"/>',
  trash:'<path d="M4 7h16M10 3h4M6 7l1 14h10l1-14M10 11v6m4-6v6"/>',
  upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 16v4h16v-4"/>',
  download:'<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  fire:'<path d="M12 22a8 8 0 0 0 8-8c0-4-3-5-3-5 0 3-2 4-2 4-1-4-4-5-4-10-4 4-7 7-7 11a8 8 0 0 0 8 8Z"/><path d="M12 22a4 4 0 0 0 4-4c0-2-2-3-2-3 0 2-2 2-2 2s-2-1-2-3c-1 2-2 3-2 4a4 4 0 0 0 4 4Z"/>',
  bookmark:'<path d="M6 3h12v18l-6-4-6 4V3Z"/>',
  alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/>',
  shield:'<path d="M12 2 4 6v6c0 6 4 9 8 10 4-1 8-4 8-10V6l-8-4Z"/><path d="m9 12 2 2 4-4"/>'
};
function ico(id,cl=''){return `<svg class="icon ${cl}" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[id]||iconPaths.info}</svg>`;}
function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function normalize(s){return String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
const byAlias=new Map();
for(const ingredient of INGREDIENTS){
  for(const a of [ingredient.id.replace(/_/g,' '),ingredient.name,ingredient.en,...(ingredient.aliases||[])]){
    let key=normalize(a); if(key && !byAlias.has(key))byAlias.set(key,ingredient.id);
  }
}
const BRAND_RULES=[
  ['bacardi carta blanca','white_rum'],['havana club 3','white_rum'],['bacardi','white_rum'],
  ['havana club 7','dark_rum'],['captain morgan','dark_rum'],['cointreau','triple_sec'],
  ['grand marnier','triple_sec'],['campari','campari'],['aperol','aperol'],
  ['martini rosso','sweet_vermouth'],['martini extra dry','dry_vermouth'],
  ['bombay sapphire','gin'],['hendrick','gin'],['tanqueray','gin'],['beefeater','gin'],
  ['absolut','vodka'],['finlandia','vodka'],['belvedere','vodka'],['grey goose','vodka'],
  ['jameson','irish_whiskey'],['jim beam','bourbon'],['jack daniel','whiskey'],
  ['kahlua','coffee_liqueur'],['disaronno','amaretto'],['schweppes','tonic']
];
function canonical(s){
  const n=normalize(s);
  if(!n)return '';
  if(byAlias.has(n))return byAlias.get(n);
  for(const [term,k] of BRAND_RULES)if(n.includes(term))return k;
  if(/\b(white rum|light rum|rum bialy|rum jasny)\b/.test(n))return 'white_rum';
  if(/\b(dark rum|aged rum|spiced rum|rum ciemny|rum starzony)\b/.test(n))return 'dark_rum';
  if(/\bgin\b/.test(n))return 'gin';
  if(/\b(vodka|wodka)\b/.test(n))return 'vodka';
  if(/\bwhisk(?:ey|y)\b/.test(n))return 'whiskey';
  if(/\brum\b/.test(n))return 'rum';
  if(/\btequila\b/.test(n))return 'tequila';
  if(/\bprosecco\b/.test(n))return 'prosecco';
  if(/\btonic\b/.test(n))return 'tonic';
  if(/\bsoda\b/.test(n))return 'soda';
  if(/\b(juice|sok)\b/.test(n)){
    if(/\b(lime|limonk)\w*/.test(n))return 'lime_juice';
    if(/\b(lemon|cytryn)\w*/.test(n))return 'lemon_juice';
    if(/\b(orange|pomarancz)\w*/.test(n))return 'orange_juice';
    if(/\b(pineapple|ananas)\w*/.test(n))return 'pineapple_juice';
    if(/\b(cranberry|zurawin)\w*/.test(n))return 'cranberry_juice';
  }
  return 'custom:'+n.replace(/\s+/g,'_');
}

const PRODUCT_MATCHES=PRODUCT_BRANDS.map(x=>({...x,norm:normalize(x.name)})).sort((a,b)=>b.norm.length-a.norm.length);
function phraseMatches(haystack,needle){return haystack===needle||haystack.startsWith(needle+' ')||haystack.endsWith(' '+needle)||haystack.includes(' '+needle+' ');}
function identifyProduct(name){
 const n=normalize(name);
 if(!n)return {key:'',status:'empty'};
 const learned=state.brandOverrides?.[n];
 if(learned&&(INDEX.has(learned)||learned.startsWith('custom:')))return {key:learned,status:'remembered'};
 const branded=PRODUCT_MATCHES.find(x=>phraseMatches(n,x.norm));
 if(branded)return {key:branded.key,status:'brand',matched:branded.name};
 const ambiguous=AMBIGUOUS_BRANDS.find(([brand])=>phraseMatches(n,normalize(brand)));
 if(ambiguous)return {key:'',status:'ambiguous',hint:ambiguous[1]};
 const key=canonical(name);
 return key.startsWith('custom:')?{key:'',status:'unknown'}:{key,status:'generic'};
}
function ingredientOptions(selected=''){
 const choice=INDEX.has(selected)?selected:String(selected).startsWith('custom:')?'custom':selected;
 return '<option value="" '+(!choice?'selected':'')+' disabled>Wybierz rodzaj produktu</option>'+
 Object.entries(TYPES).map(([type,title])=>'<optgroup label="'+esc(title)+'">'+INGREDIENTS.filter(x=>x.type===type).map(x=>'<option value="'+esc(x.id)+'" '+(choice===x.id?'selected':'')+'>'+esc(x.name)+'</option>').join('')+'</optgroup>').join('')+
 '<option value="custom" '+(choice==='custom'?'selected':'')+'>Inny produkt — bez dopasowania</option>';
}
function updateProductIdentification(){
 const name=document.getElementById('add-name'),select=document.getElementById('ingredient-type'),box=document.getElementById('product-match');
 if(!name||!select||!box)return;
 const result=identifyProduct(name.value);
 if(!ui.productSelectionManual){
   select.value=result.key?(INDEX.has(result.key)?result.key:'custom'):'';
   ui.selectedIngredient=result.key||'';
 }
 let msg='',type='waiting';
 if(ui.productSelectionManual&&select.value){
   msg='Wybrano ręcznie: <b>'+esc(select.value==='custom'?'Inny / własny produkt':iName(select.value))+'</b><small>Zapamiętamy tę kategorię dla podanej nazwy.</small>';type='matched';
 }else if(result.key&&!result.key.startsWith('custom:')){
   msg='Rozpoznano: <b>'+esc(iName(result.key))+'</b><small>'+(result.status==='brand'?'Na podstawie marki i wariantu.':'Na podstawie nazwy składnika.')+' Możesz zmienić kategorię poniżej.</small>';type='matched';
 }else if(result.status==='remembered'){
   msg='Zapamiętano: <b>Inny / własny produkt</b><small>Nie zastępuje automatycznie składników z przepisów.</small>';type='matched';
 }else if(result.status==='ambiguous'){
   msg='Marka ma różne warianty.<small>'+esc(result.hint)+'</small>';type='uncertain';
 }else if(result.status==='unknown'){
   msg='Nie rozpoznano produktu.<small>Wybierz rodzaj ręcznie, aby poprawnie dopasowywać koktajle.</small>';type='uncertain';
 }else msg='Podaj markę i wariant, np. <b>Martini Rosso</b> lub <b>Havana Club 3 Años</b>.';
 box.className='product-match '+type;
 box.innerHTML='<span class="product-match-icon">'+ico(type==='matched'?'check':type==='uncertain'?'alert':'sparkle','sm')+'</span><span>'+msg+'</span>';
}

function iName(k,fallback=''){return INDEX.get(k)?.name||fallback||k.replace(/^custom:/,'').replace(/_/g,' ');}
function iEn(k){return INDEX.get(k)?.en||iName(k).replace(/\s+/g,' ');}
function iType(k){return INDEX.get(k)?.type||'other';}
function blankState(){return {stock:[],favorites:[],cart:[],history:[],brandOverrides:{},demo:false};}
function loadState(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(raw && Array.isArray(raw.stock))return {
      stock:raw.stock.filter(x=>x&&typeof x.key==='string'&&typeof x.name==='string').slice(0,500).map(x=>({...x,ml:Number.isFinite(Number(x.ml))&&x.ml!==null&&x.ml!==''?Math.max(0,Number(x.ml)):null})),
      favorites:Array.isArray(raw.favorites)?raw.favorites.filter(x=>typeof x==='string'):[],
      cart:Array.isArray(raw.cart)?raw.cart.filter(x=>x&&typeof x.key==='string').slice(0,200):[],
      history:Array.isArray(raw.history)?raw.history.slice(-100):[],brandOverrides:raw.brandOverrides&&typeof raw.brandOverrides==='object'&&!Array.isArray(raw.brandOverrides)?Object.fromEntries(Object.entries(raw.brandOverrides).filter(([n,k])=>n.length<=120&&typeof k==='string'&&(INDEX.has(k)||k.startsWith('custom:'))).slice(0,500)):{},demo:!!raw.demo};
  }catch(e){console.warn('Nie można odczytać danych',e);}
  return {stock:DEMO_STOCK.map(x=>({...x})),favorites:[],cart:[],history:[],brandOverrides:{},demo:true};
}
let state=loadState();
let ui={page:'home',filter:'all',base:'any',taste:'any',query:'',sort:'fit',modal:null,servings:1,selectedIngredient:'',productSelectionManual:false,onlineStatus:'idle',onlineError:'',onlineSearchQuery:'',onlineSearchResults:[],onlineSearchLoading:false,onlineSynced:false};
const ONLINE=new Map();
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){toast('Nie udało się zapisać danych w tej przeglądarce');}}
function freshId(){return 'p_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);}
function getAlternativeKeys(k){return ({rum:['rum','white_rum','dark_rum','spiced_rum'],whiskey:['whiskey','bourbon','rye_whiskey','irish_whiskey'],lime_juice:['lime_juice','lime'],lemon_juice:['lemon_juice','lemon'],orange_juice:['orange_juice','orange'],honey:['honey'],prosecco:['prosecco']})[k]||[k];}
function availableAmount(ing){
  const options=getAlternativeKeys(ing.id);
  const items=state.stock.filter(s=>options.includes(s.key));
  if(!items.length)return {has:false,qty:0};
  const liquid=ing.unit==='ml';
  if(!liquid || items.some(s=>s.ml===null))return {has:true,qty:Infinity};
  const qty=items.reduce((sum,s)=>sum+((s.key==='lime'&&ing.id==='lime_juice')?Math.floor(s.ml/1)*25:(s.key==='lemon'&&ing.id==='lemon_juice')?Math.floor(s.ml/1)*30:s.ml),0);
  return {has:qty>0,qty};
}
function missingFor(recipe,servings=1){
  return recipe.ingredients.filter(ing=>!ing.optional).map(ing=>{
    const {has,qty}=availableAmount(ing);const wanted=ing.qty!=null&&ing.unit==='ml'?ing.qty*servings:0;
    if(!has)return {...ing,shortage:false};
    if(wanted>0&&qty<wanted)return {...ing,shortage:true,needed:wanted-qty};
    return null;
  }).filter(Boolean);
}
function readyFor(recipe,servings=1){return missingFor(recipe,servings).length===0;}
function allRecipes(){
  const seen=new Set(RECIPES.map(r=>normalize(r.name)));
  return [...RECIPES,...Array.from(ONLINE.values()).filter(r=>!seen.has(normalize(r.name)))];
}
function catalog(){const recipes=allRecipes();return recipes.map(r=>({...r,missing:missingFor(r)}));}
function purchaseRanking(){
  const scores=new Map();
  for(const r of catalog())if(r.missing.length===1){
    const ing=r.missing[0],k=ing.id;
    if(!scores.has(k))scores.set(k,{key:k,name:iName(k,ing.name),count:0,examples:[]});
    const p=scores.get(k);p.count++;if(p.examples.length<3)p.examples.push(r.name);
  }
  return Array.from(scores.values()).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'pl'));
}
function featured(){return catalog().sort((a,b)=>a.missing.length-b.missing.length || (b.ingredients.length-a.ingredients.length)).slice(0,6);}
function formatAmount(ing,servings=1){
  if(ing.qty==null)return ing.raw||'do smaku';
  const n=ing.qty*servings;
  return `${Number.isInteger(n)?n:String(+n.toFixed(1)).replace('.',',')} ${ing.unit||'ml'}`;
}
function palette(r){
  const mapping={gin:['#28434b','#a4ce96','#567d6c'],vodka:['#4e2e40','#e39ab3','#b77091'],white_rum:['#2b4845','#d7dca4','#91b8a0'],dark_rum:['#3e2d27','#d09a56','#b56742'],rum:['#3e2d27','#d1a969','#a87544'],tequila:['#3e4640','#edbb6e','#a3bc86'],bourbon:['#402d30','#db986b','#b5685f'],rye_whiskey:['#402d30','#d7a36d','#b97054'],whiskey:['#453432','#d5a574','#a97054'],irish_whiskey:['#453432','#d5a574','#a97054'],campari:['#432735','#ec897c','#b94f51'],aperol:['#46312b','#efa36d','#d77f42'],prosecco:['#3e4140','#e1c6a1','#9bb3b1'],amaretto:['#42302f','#d2a16e','#b9805c'],brandy:['#42302f','#e5aa7b','#bb7956'],none:['#24484c','#9be0be','#539ca0']};
  return mapping[r.base]||['#343b45','#d6b47b','#8da5a5'];
}
function cocktailArt(r){
  const [bg,liquid,accent]=palette(r),seed=normalize(r.id).length%5;
  const id='a'+normalize(r.id).replace(/[^a-z0-9]/g,'').slice(0,16);
  const family=r.glass==='Highball'||r.glass==='Mug'||r.glass==='Hurricane'?'high':r.glass==='Rocks'||r.glass==='Julep'?'rocks':r.glass==='Flute'||r.glass==='Wine'?'flute':'coupe';
  let vessel='';
  if(family==='high')vessel=`<path d="M111 57h128l-12 166q-4 15-16 15h-72q-12 0-16-15L111 57Z" fill="url(#glass-${id})" stroke="#ffffff" stroke-opacity=".62" stroke-width="3"/><path d="M121 105h108l-9 115q-1 7-10 7h-71q-8 0-9-7Z" fill="url(#drink-${id})" opacity=".93"/><path d="m137 126 28-11 17 28-27 12Zm45 34 24-17 17 25-28 18Z" fill="#fff" fill-opacity=".24"/><path d="M129 65h8l8 148" stroke="#fff" stroke-opacity=".44" stroke-width="4" stroke-linecap="round"/>`;
  else if(family==='rocks')vessel=`<path d="M100 98h150l-14 130q-2 13-13 13H127q-11 0-13-13L100 98Z" fill="url(#glass-${id})" stroke="#fff" stroke-opacity=".64" stroke-width="3"/><path d="M107 142h136l-10 83q-1 6-10 6H129q-8 0-9-6Z" fill="url(#drink-${id})" opacity=".94"/><path d="m138 140 28-9 9 27-28 10Zm50 35 26-11 10 29-27 10Z" fill="#fff" fill-opacity=".25"/><path d="m116 105 9 112" stroke="#fff" stroke-opacity=".4" stroke-width="4"/>`;
  else if(family==='flute')vessel=`<path d="M142 47h70l-8 137q-3 25-27 28-25-3-27-28L142 47Z" fill="url(#glass-${id})" stroke="#fff" stroke-opacity=".65" stroke-width="3"/><path d="M150 87h54l-6 97q-2 19-21 22-18-3-21-22Z" fill="url(#drink-${id})"/><path d="M177 212v29m-27 1h54" stroke="#fff" stroke-opacity=".75" stroke-width="5" stroke-linecap="round"/><circle cx="166" cy="125" r="3" fill="#fff" opacity=".6"/><circle cx="185" cy="163" r="4" fill="#fff" opacity=".56"/><circle cx="174" cy="185" r="2" fill="#fff" opacity=".64"/>`;
  else vessel=`<path d="M91 79h173l-83 113L91 79Z" fill="url(#glass-${id})" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linejoin="round"/><path d="M113 110h129l-61 78-68-78Z" fill="url(#drink-${id})" opacity=".97"/><path d="M181 193v49m-40 2h80" stroke="#fff" stroke-opacity=".8" stroke-width="5" stroke-linecap="round"/><path d="M110 84h115" stroke="#fff" stroke-opacity=".45" stroke-width="3"/>`;
  return `<svg class="cocktail-art" viewBox="0 0 355 280" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Ilustracja koktajlu"><defs><radialGradient id="bg-${id}" cx="70%" cy="43%" r="75%"><stop stop-color="${accent}" stop-opacity=".48"/><stop offset="1" stop-color="${bg}"/></radialGradient><linearGradient id="glass-${id}" x1="0" y1="0" x2="1" y2=".75"><stop stop-color="#ffffff" stop-opacity=".15"/><stop offset=".47" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#fff" stop-opacity=".19"/></linearGradient><linearGradient id="drink-${id}" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="${liquid}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="355" height="280" fill="url(#bg-${id})"/><circle cx="290" cy="62" r="88" fill="${liquid}" opacity=".08"/><circle cx="66" cy="237" r="83" fill="#fff" opacity=".035"/><ellipse cx="178" cy="258" rx="106" ry="10" fill="#080a0c" opacity=".23"/>${vessel}<circle cx="${234+seed*3}" cy="${family==='high'?72:family==='rocks'?120:90}" r="22" stroke="${liquid}" stroke-width="6" fill="none" opacity=".86"/><path d="M${234+seed*3} ${family==='high'?72:family==='rocks'?120:90}h20" stroke="${liquid}" stroke-width="2" opacity=".6"/></svg>`;
}
function safeUrl(url){try{const x=new URL(url);return x.protocol==='https:'&&['24cocktails.com','www.24cocktails.com'].includes(x.hostname)?x.href:'';}catch{return '';}}
function imageBlock(r,detail=false){
  const src=r.photo?safeUrl(r.photo):'';
  return `<div class="card-art ${detail?'dialog-visual':''}">${cocktailArt(r)}${src?`<img class="card-photo" src="${esc(src)}" alt="${esc(r.name)}" loading="lazy" onerror="this.remove()">`:''}</div>`;
}
function statusPill(r){
  if(r.missing.length===0)return `<span class="pill good">${ico('check','sm')} Masz wszystko</span>`;
  if(r.missing.length===1)return `<span class="pill warn">${ico('plus','sm')} Brakuje 1</span>`;
  return `<span class="pill neutral">${r.missing.length} brakujące</span>`;
}
function cardHtml(r){
  const favorite=state.favorites.includes(r.id),m=r.missing.length;
  return `<article class="recipe-card" data-action="open-recipe" data-id="${esc(r.id)}" tabindex="0" role="button" aria-label="Otwórz przepis ${esc(r.name)}">
     <div style="position:relative">${imageBlock(r)}<div class="card-chip">${statusPill(r)}</div><button class="favorite-btn ${favorite?'active':''}" data-action="toggle-favorite" data-id="${esc(r.id)}" title="${favorite?'Usuń z ulubionych':'Dodaj do ulubionych'}" aria-label="${favorite?'Usuń z ulubionych':'Dodaj do ulubionych'}">${ico('heart','sm')}</button></div>
     <div class="card-body"><h3>${esc(r.name)}</h3><p class="card-desc">${esc(r.description||`${r.ingredients.length} składników • ${r.method}`)}</p><div class="card-bottom"><span class="mini-meta">${ico('clock','sm')} ${r.minutes||4} min <i class="meta-pip"></i> ${esc(r.taste||'klasyk')}</span>${r.source==='24cocktails.com'?'<span class="pill gold">Online</span>':`<span class="mini-meta">${r.ingredients.filter(i=>!i.optional).length} skład.</span>`}</div></div></article>`;
}
function shellPage(){
 const titleMap={home:'Odkrywaj koktajle',cocktails:'Katalog koktajli',bar:'Twój barek',shopping:'Lista zakupów',favorites:'Twoje ulubione'};
 return `<div class="app-shell"><aside class="sidebar"><a href="#start" class="brand" data-action="navigate" data-page="home"><span class="brand-icon">${ico('glass','xl')}</span><span class="brand-copy"><strong>MY BAR</strong><span>TWÓJ PRYWATNY BARMAN</span></span></a><div class="side-caption">Twój koktajlowy świat</div><nav class="nav-stack" aria-label="Menu główne">${TABS.map(([page,label,ic])=>`<button class="nav-item ${ui.page===page?'active':''}" data-action="navigate" data-page="${page}">${ico(ic)}${label}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="mini-panel"><span class="eyebrow">${ico('sparkle','sm')} POMYSŁ NA DZIŚ</span><strong>Co wymieszać z tego, co masz?</strong><p>Sprawdź, jakie nowe przepisy czekają na odkrycie.</p><button class="btn small soft" data-action="sync-online">${ico('cloud','sm')} Odkryj online</button></div><button class="nav-item" data-action="open-settings">${ico('settings')} Ustawienia i kopia danych</button><div class="sidebar-footer">MY BAR • wersja 1.1</div></div></aside>
 <div class="main"><header class="topbar"><div class="topbar-l"><span class="crumb">MY BAR / ${esc(titleMap[ui.page])}</span><strong>${esc(titleMap[ui.page])}</strong></div><div class="topbar-r"><div class="online-indicator ${navigator.onLine?'':'off'}"><i class="dot"></i>${navigator.onLine?'Tryb online':'Tryb offline'}</div><button class="btn small ghost" data-action="open-add">${ico('plus','sm')} Dodaj do barku</button><button class="icon-btn" title="Ustawienia" aria-label="Ustawienia" data-action="open-settings">${ico('settings')}</button></div></header>
 <main class="content" id="main-content">${pageHtml()}</main>${footer()}</div></div>
 <nav class="mobile-nav" aria-label="Nawigacja dolna">${TABS.map(([page,label,ic])=>`<button class="mobile-tab ${ui.page===page?'active':''}" data-action="navigate" data-page="${page}">${ico(ic)}<span>${label}</span></button>`).join('')}</nav>`;
}
function footer(){return `<footer class="footer"><span>MY BAR 1.1 • Twoje zapasy są zapisywane w tej przeglądarce.</span><span>Przepisy online: <a href="https://24cocktails.com/developers.html" target="_blank" rel="noopener noreferrer">24cocktails.com</a> • Korzystaj odpowiedzialnie (18+).</span></footer>`;}
function demoBanner(){return state.demo?`<div class="demo-banner">${ico('info','sm')} <span>Wyświetlasz <b>przykładowy barek</b>. Możesz testować aplikację lub zacząć z własną listą.</span><button data-action="clear-demo">Wyczyść przykład</button></div>`:'';}
function pageHtml(){return ui.page==='home'?homePage():ui.page==='cocktails'?cocktailsPage():ui.page==='bar'?barPage():ui.page==='shopping'?shoppingPage():favoritesPage();}
function homePage(){
 const data=catalog();const ready=data.filter(r=>!r.missing.length).length;
 const almost=data.filter(r=>r.missing.length===1).length;
 const high=purchaseRanking()[0];
 const selected=featured();
 return `${demoBanner()}<section class="hero"><div class="hero-copy"><div class="eyebrow">${ico('sparkle','sm')} IDEALNY KOKTAJL JEST BLISKO</div><h1>Twój barek.<br><span>Nieskończone możliwości.</span></h1><p>Dodaj swoje alkohole i dodatki. Sprawdzimy, które koktajle przygotujesz od ręki i czego brakuje do następnych.</p><div class="hero-actions"><button class="btn primary" data-action="navigate" data-page="cocktails">${ico('glass','sm')} Zobacz koktajle ${ico('arrow','sm')}</button><button class="btn ghost" data-action="open-add">${ico('plus','sm')} Dodaj składnik</button></div></div><div class="hero-visual">${cocktailArt({id:'hero-negroni',base:'campari',glass:'Rocks'})}<div class="floating-note"><strong>${ready} gotowych przepisów</strong> z aktualnych zapasów</div></div></section>
 <section class="stat-grid" aria-label="Podsumowanie barku"><div class="stat"><div class="stat-icon">${ico('bottle','lg')}</div><div><b>${state.stock.length}</b><span>produktów w barku</span></div></div><div class="stat"><div class="stat-icon">${ico('check','lg')}</div><div><b>${ready}</b><span>gotowych koktajli</span></div></div><div class="stat"><div class="stat-icon">${ico('sparkle','lg')}</div><div><b>${almost}</b><span>brakuje 1 składnika</span></div></div></section>
 <section><div class="section-head"><div><div class="eyebrow">SKROJONE POD CIEBIE</div><h2>Co możesz przygotować?</h2><p class="subtle">Najpierw przepisy, do których masz najwięcej składników.</p></div><button class="btn small ghost" data-action="navigate" data-page="cocktails">Wszystkie przepisy ${ico('chevron','sm')}</button></div>
 ${selected.length?`<div class="card-grid">${selected.map(cardHtml).join('')}</div>`:emptyContent('Nie ma jeszcze przepisów','Dodaj pierwszy składnik, aby rozpocząć.','open-add','Dodaj składnik')}</section>
 ${high?`<div class="cta-panel"><div class="flex"><span class="icon-wrap">${ico('sparkle','lg')}</span><div><div class="eyebrow">JEDEN ZAKUP, WIĘCEJ MOŻLIWOŚCI</div><h3>Dokup ${esc(high.name)}</h3><p>Odblokujesz ${high.count} ${plural(high.count,'nowy koktajl','nowe koktajle','nowych koktajli')}, np. ${esc(high.examples.slice(0,2).join(' i '))}.</p></div></div><button class="btn soft" data-action="add-shopping" data-id="${esc(high.key)}">${ico('plus','sm')} Do zakupów</button></div>`:''}
 <div class="section-head"><div><div class="eyebrow">TWÓJ BAREK</div><h2>Składniki pod ręką</h2></div><button class="btn small ghost" data-action="navigate" data-page="bar">Zarządzaj ${ico('chevron','sm')}</button></div>
 ${state.stock.length?`<div class="inventory-strip">${state.stock.slice(0,12).map(s=>`<span class="ingredient-chip">${ico('check','sm')} ${esc(s.name)}</span>`).join('')}${state.stock.length>12?`<span class="ingredient-chip">+${state.stock.length-12} kolejnych</span>`:''}</div>`:emptyContent('Twój barek jest pusty','Dodaj to, co rzeczywiście stoi na Twojej półce.','open-add','Dodaj pierwszy składnik')}`;
}
function plural(n,one,few,many){return n===1?one:([2,3,4].includes(n%10)&&![12,13,14].includes(n%100)?few:many);}
function emptyContent(title,description,action='',button=''){return `<div class="empty"><span class="big-ico">${ico('glass','xl')}</span><h3>${esc(title)}</h3><p>${esc(description)}</p>${action?`<button class="btn primary" data-action="${esc(action)}">${ico('plus','sm')} ${esc(button)}</button>`:''}</div>`;}
function filteredRecipes(){
 let rows=catalog();const q=normalize(ui.query);
 if(q)rows=rows.filter(r=>normalize([r.name,r.description,r.taste,r.base,...r.ingredients.map(i=>iName(i.id,i.name))].join(' ')).includes(q));
 if(ui.filter==='ready')rows=rows.filter(r=>!r.missing.length);
 if(ui.filter==='almost')rows=rows.filter(r=>r.missing.length===1);
 if(ui.filter==='favorites')rows=rows.filter(r=>state.favorites.includes(r.id));
 if(ui.filter==='na')rows=rows.filter(r=>r.nonAlcoholic);
 if(ui.base!=='any')rows=rows.filter(r=>r.base===ui.base||(ui.base==='rum'&&['white_rum','dark_rum','rum'].includes(r.base))||(ui.base==='whiskey'&&['bourbon','rye_whiskey','whiskey','irish_whiskey'].includes(r.base)));
 if(ui.taste!=='any')rows=rows.filter(r=>r.taste===ui.taste);
 if(ui.sort==='name')rows.sort((a,b)=>a.name.localeCompare(b.name,'pl'));
 if(ui.sort==='fit')rows.sort((a,b)=>a.missing.length-b.missing.length||b.ingredients.length-a.ingredients.length||a.name.localeCompare(b.name,'pl'));
 if(ui.sort==='quick')rows.sort((a,b)=>(a.minutes||4)-(b.minutes||4)||a.missing.length-b.missing.length);
 return rows;
}
function cocktailsContent(){
 const rows=filteredRecipes();return `<div class="results-line"><span>Znaleziono <span class="count-chip">${rows.length}</span> przepisów ${ONLINE.size?`• ${ONLINE.size} pobranych online`:''}</span><span>Sortowanie: ${ui.sort==='fit'?'dopasowanie':ui.sort==='quick'?'czas':'nazwa'}</span></div>${rows.length?`<div class="card-grid">${rows.map(cardHtml).join('')}</div>`:emptyContent('Brak pasujących koktajli','Zmień filtry lub dodaj kolejne składniki do barku.')}`;
}
function cocktailsPage(){
 return `${demoBanner()}<div class="page-intro"><div><div class="eyebrow">ODKRYWAJ NOWE SMAKI</div><h1>Katalog koktajli</h1><p class="subtle">Sprawdzone klasyki, proporcje i dopasowanie do Twojego barku.</p></div><button class="btn primary" data-action="sync-online" ${ui.onlineStatus==='loading'?'disabled':''}>${ui.onlineStatus==='loading'?'<span class="loader"></span>':ico('cloud','sm')} ${ui.onlineStatus==='loading'?'Szukam...':'Dobierz z internetu'}</button></div>
 <div class="toolbar"><label class="field-wrap search-field">${ico('search')}<input id="recipe-search" type="search" placeholder="Koktajl lub składnik, np. gin, Negroni..." value="${esc(ui.query)}" autocomplete="off" aria-label="Szukaj koktajli"></label><select id="base-filter" class="select" aria-label="Alkohol bazowy"><option value="any">Każda baza</option>${[['gin','Gin'],['vodka','Wódka'],['rum','Rum'],['tequila','Tequila'],['whiskey','Whisky'],['aperol','Aperol'],['campari','Campari'],['prosecco','Prosecco'],['none','Bez alkoholu']].map(([id,name])=>`<option value="${id}" ${ui.base===id?'selected':''}>${name}</option>`).join('')}</select><select id="taste-filter" class="select" aria-label="Profil smaku"><option value="any">Każdy smak</option>${['orzeźwiający','kwaśny','gorzki','owocowy','mocny','wytrawny','kremowy','musujący','kwiatowy'].map(t=>`<option ${ui.taste===t?'selected':''}>${t}</option>`).join('')}</select><select id="sort-filter" class="select" aria-label="Sortowanie"><option value="fit" ${ui.sort==='fit'?'selected':''}>Najlepsze dopasowanie</option><option value="name" ${ui.sort==='name'?'selected':''}>Alfabetycznie</option><option value="quick" ${ui.sort==='quick'?'selected':''}>Najszybciej</option></select></div>
 <div class="filter-row">${[['all','Wszystkie'],['ready','Masz wszystko'],['almost','Brakuje 1'],['favorites','Ulubione'],['na','Bez alkoholu']].map(([id,label])=>`<button class="filter ${ui.filter===id?'active':''}" data-action="set-filter" data-id="${id}">${label}</button>`).join('')}</div>
 <div id="catalog-results">${cocktailsContent()}</div>
 <div class="cta-panel" style="margin-top:30px"><div class="flex"><span class="icon-wrap">${ico('search','lg')}</span><div><h3>Szukasz konkretnego koktajlu w internecie?</h3><p>Wpisz jego nazwę w wyszukiwarkę powyżej, a następnie użyj przycisku po prawej.</p></div></div><button class="btn soft" data-action="search-online" ${ui.onlineSearchLoading?'disabled':''}>${ui.onlineSearchLoading?'<span class="loader"></span>':ico('cloud','sm')} Szukaj online</button></div>
 ${ui.onlineError?`<div class="note-box" style="margin-bottom:15px">${ico('alert','sm')} ${esc(ui.onlineError)} Wbudowane przepisy nadal są dostępne.</div>`:''}
 ${ui.onlineSearchResults.length?`<div class="panel panel-pad"><div class="section-head" style="margin-top:0"><div><h3>Wyniki wyszukiwania online</h3><p class="subtle">${ui.onlineSearchResults.length} wyników dla „${esc(ui.onlineSearchQuery)}”. Kliknij, aby pobrać przepis.</p></div></div><div class="filter-row">${ui.onlineSearchResults.slice(0,25).map(x=>`<button class="suggestion" data-action="fetch-online" data-id="${esc(x.slug)}">${esc(x.name||x.slug)} ${ico('chevron','sm')}</button>`).join('')}</div></div>`:''}`;
}
function barPage(){
 const grouped=Object.keys(TYPES).map(type=>[type,state.stock.filter(x=>iType(x.key)===type)]).filter(([_,items])=>items.length);
 return `${demoBanner()}<div class="page-intro"><div><div class="eyebrow">TWOJE ZAPASY</div><h1>Mój barek</h1><p class="subtle">Dodaj butelki, miksery i świeże dodatki. Marki i warianty rozpoznajemy automatycznie, z możliwością poprawienia typu.</p></div><div class="flex wrap"><button class="btn ghost" data-action="export-data">${ico('download','sm')} Kopia danych</button><button class="btn primary" data-action="open-add">${ico('plus','sm')} Dodaj produkt</button></div></div>
 ${state.stock.length?`<div class="panel panel-pad"><div class="flex between wrap"><div><b style="font-size:18px">${state.stock.length} produktów</b><p class="subtle" style="margin:3px 0 0">Kliknij ołówek, aby zmienić nazwę lub stan butelki.</p></div><span class="pill good">${ico('shield','sm')} Zapis lokalny</span></div></div>${grouped.map(([type,items])=>`<h3 class="group-title">${TYPES[type]} <span class="muted tiny">(${items.length})</span></h3><div class="stock-grid">${items.map(stockCard).join('')}</div>`).join('')}`:emptyContent('Pusty barek','Zacznij od dodania ginu, rumu, wódki lub dowolnego alkoholu, który masz w domu.','open-add','Dodaj pierwszy produkt')}
 <div class="cta-panel"><div class="flex"><span class="icon-wrap">${ico('info','lg')}</span><div><h3>Nie musisz liczyć mililitrów</h3><p>Przy dodawaniu możesz wybrać „Jest w barku” zamiast dokładnego stanu. Rozliczanie ilości jest opcjonalne.</p></div></div><button class="btn ghost small" data-action="open-add">Dodaj składnik</button></div>`;
}
function stockCard(s){const k=esc(s.id);return `<div class="stock-card"><span class="stock-icon">${ico(iType(s.key)==='alcohol'?'bottle':'glass','lg')}</span><div class="stock-info"><strong>${esc(s.name)}</strong><span>${s.ml===null?'Jest w barku • bez liczenia':`${s.ml} ml dostępne`}${s.name!==iName(s.key)?' • '+esc(iName(s.key)):''}</span></div><button class="stock-action" title="Edytuj ${esc(s.name)}" aria-label="Edytuj ${esc(s.name)}" data-action="edit-stock" data-id="${k}">${ico('edit')}</button></div>`;}
function shoppingPage(){
 const ranked=purchaseRanking();const inCart=new Set(state.cart.map(x=>x.key));
 return `${demoBanner()}<div class="page-intro"><div><div class="eyebrow">ZAPLANUJ ZAKUPY</div><h1>Czego Ci brakuje?</h1><p class="subtle">Podpowiadamy, który produkt otworzy najwięcej nowych możliwości.</p></div><button class="btn ghost" data-action="copy-shopping">${ico('copy','sm')} Kopiuj listę</button></div>
 <div class="dual-layout"><section class="panel panel-pad"><div class="flex between"><h3>Twoja lista zakupów</h3><span class="pill">${state.cart.length} produktów</span></div>${state.cart.length?`${state.cart.map(item=>`<div class="shopping-row"><button class="shop-check ${item.bought?'checked':''}" data-action="toggle-bought" data-id="${esc(item.key)}" aria-label="${item.bought?'Odznacz':'Oznacz jako kupione'}">${item.bought?ico('check','sm'):''}</button><div class="shop-copy"><b>${esc(item.name||iName(item.key))}</b><span>${item.bought?'Kupione — dodaj do barku':'Do kupienia'}</span></div>${item.bought?`<button class="btn small soft" data-action="add-bought" data-id="${esc(item.key)}">${ico('plus','sm')} Do barku</button>`:''}<button class="stock-action" aria-label="Usuń z listy" data-action="remove-shopping" data-id="${esc(item.key)}">${ico('close','sm')}</button></div>`).join('')}<p class="form-note" style="margin-top:17px">Oznacz zakupiony produkt, a potem kliknij „Do barku”, aby zaktualizować zapasy.</p>`:emptyContent('Lista jest pusta','Dodawaj brakujące składniki z kart koktajli lub z podpowiedzi poniżej.')}
 <form id="custom-shopping-form" class="flex" style="margin-top:16px"><input class="form-input" name="shoppingName" placeholder="Dopisz produkt do listy..." required style="flex:1;min-width:0"><button class="btn primary" type="submit" title="Dodaj">${ico('plus','sm')}</button></form></section>
 <aside class="panel panel-pad"><div class="eyebrow">NAJLEPSZY NASTĘPNY ZAKUP</div>${ranked.length?`<h2 style="margin:8px 0 10px">${esc(ranked[0].name)}</h2><p class="side-note">Tylko jeden nowy składnik pozwoli odblokować aż <strong style="color:#b3e0c4">${ranked[0].count}</strong> ${plural(ranked[0].count,'koktajl','koktajle','koktajli')}.</p><p class="side-note">Przykłady: ${esc(ranked[0].examples.join(', '))}</p><button class="btn primary wide" data-action="add-shopping" data-id="${esc(ranked[0].key)}" ${inCart.has(ranked[0].key)?'disabled':''}>${ico('basket','sm')} ${inCart.has(ranked[0].key)?'Na liście':'Dodaj do zakupów'}</button>`:`<h3 style="margin:10px 0">Dobry moment na odkrywanie</h3><p class="side-note">Na razie nie ma przepisów, którym brakuje dokładnie jednego składnika. Dodaj swoje zapasy lub pobierz nowe przepisy online.</p>`}<div class="note-box" style="margin-top:20px">Rekomendacje opierają się na dostępnych recepturach — nie na cenach ani ofertach sklepów.</div></aside></div>
 <div class="section-head"><div><div class="eyebrow">WIĘCEJ PROPOZYCJI</div><h2>Co warto dokupić?</h2></div></div>${ranked.length?`<div class="buy-grid">${ranked.slice(0,8).map(p=>`<div class="buy-card"><div class="topline"><h3>${esc(p.name)}</h3><span class="pill gold">+${p.count}</span></div><p>${esc(p.examples.join(', '))}</p><button class="btn small ${inCart.has(p.key)?'ghost':'soft'}" data-action="add-shopping" data-id="${esc(p.key)}" ${inCart.has(p.key)?'disabled':''}>${inCart.has(p.key)?ico('check','sm'):ico('plus','sm')} ${inCart.has(p.key)?'Już na liście':'Do listy zakupów'}</button></div>`).join('')}</div>`:emptyContent('Brak rekomendacji','Uzupełnij barek lub pobierz przepisy online, żeby zobaczyć nowe możliwości.')}`;
}
function favoritesPage(){const f=catalog().filter(r=>state.favorites.includes(r.id));return `<div class="page-intro"><div><div class="eyebrow">TWOJA PRYWATNA KOLEKCJA</div><h1>Ulubione koktajle</h1><p class="subtle">Zapisane przepisy dostępne jednym kliknięciem.</p></div></div>${f.length?`<div class="card-grid">${f.map(cardHtml).join('')}</div>`:emptyContent('Jeszcze nie masz ulubionych','Kliknij serduszko przy koktajlu, żeby go tutaj zapisać.','', '')}<div class="cta-panel"><div class="flex"><span class="icon-wrap">${ico('bookmark','lg')}</span><div><h3>Twoje przepisy są zapisane w przeglądarce</h3><p>Wyeksportuj kopię danych w ustawieniach, aby przenieść zapasy i ulubione.</p></div></div><button class="btn soft" data-action="export-data">${ico('download','sm')} Eksport</button></div>`;}
function render(){document.getElementById('app').innerHTML=shellPage();renderModal();}
function refreshResults(){const el=document.getElementById('catalog-results');if(el)el.innerHTML=cocktailsContent();}
function refresh(){render();}
function navigate(page){ui.page=page;ui.modal=null;refresh();window.scrollTo({top:0,behavior:'instant'});}
function getRecipe(id){return RECIPES.find(r=>r.id===id)||ONLINE.get(id)||null;}
function renderModal(){
 const root=document.getElementById('modal-layer'),m=ui.modal;
 if(!m){root.innerHTML='';document.body.style.overflow='';return;}
 document.body.style.overflow='hidden';
 if(m.kind==='recipe'){
   const base=getRecipe(m.id);if(!base){ui.modal=null;return renderModal();}
   const missing=missingFor(base,ui.servings),r={...base,missing},missingKeys=new Set(missing.map(i=>i.id)),isFav=state.favorites.includes(base.id);
   root.innerHTML=`<div class="overlay" data-action="overlay"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title"><div class="dialog-head"><strong>Przepis na koktajl</strong><button class="icon-btn" aria-label="Zamknij" data-action="close-modal">${ico('close')}</button></div><div class="dialog-content">${imageBlock(base,true)}<div class="dialog-body"><div class="eyebrow">${base.nonAlcoholic?'BEZ ALKOHOLU':'KLASYCZNY KOKTAJL'} • ${esc(base.method)}</div><h2 id="detail-title">${esc(base.name)}</h2><p class="dialog-subtitle">${esc(base.description||'Znajdź idealne połączenie smaków.')}</p><div class="detail-meta"><span class="pill">${ico('clock','sm')} ${base.minutes||4} min</span><span class="pill">${esc(base.glass||'Kieliszek')}</span><span class="pill">${esc(base.taste||'Koktajl')}</span>${statusPill(r)}</div>
 <div class="detail-section"><h3>Składniki</h3><div class="servings" aria-label="Liczba porcji"><button data-action="servings-down" aria-label="Mniej porcji">−</button><span>${ui.servings} ${plural(ui.servings,'porcja','porcje','porcji')}</span><button data-action="servings-up" aria-label="Więcej porcji">+</button></div></div>
 ${base.ingredients.map(ing=>{const lacking=missingKeys.has(ing.id);return `<div class="ing-row"><span class="checkmark ${lacking?'missing':''}">${ico(lacking?'plus':'check','sm')}</span><div class="ing-label"><b>${esc(iName(ing.id,ing.name))}${ing.optional?' <span class="muted tiny">(opcjonalnie)</span>':''}</b><small>${lacking?'Brakuje w barku':ing.optional?'Dodatek opcjonalny':'Masz w barku'}</small></div><span class="amount">${esc(formatAmount(ing,ui.servings))}</span>${lacking?`<button class="stock-action" title="Dodaj do listy zakupów" aria-label="Do zakupów: ${esc(iName(ing.id,ing.name))}" data-action="add-shopping" data-id="${esc(ing.id)}">${ico('basket')}</button>`:''}</div>`}).join('')}
 <div class="detail-section"><h3>Przygotowanie</h3></div><ol class="steps">${(base.steps||[]).map(s=>`<li>${esc(s)}</li>`).join('')}</ol>
 ${missing.length?`<div class="note-box" style="margin-bottom:15px">Brakuje: <b>${missing.map(i=>esc(iName(i.id,i.name))).join(', ')}</b>. Możesz dodać je na listę zakupów.</div>`:''}
 <div class="detail-actions"><button class="btn ${isFav?'soft':'ghost'}" data-action="toggle-favorite" data-id="${esc(base.id)}">${ico('heart','sm')} ${isFav?'Zapisane':'Do ulubionych'}</button>${missing.length?`<button class="btn primary" data-action="add-recipe-shopping" data-id="${esc(base.id)}">${ico('basket','sm')} Dopisz brakujące (${missing.length})</button>`:`<button class="btn primary" data-action="make-drink" data-id="${esc(base.id)}">${ico('check','sm')} Przygotowałem</button>`}</div>
 <div class="source-line">Źródło: ${base.source==='24cocktails.com'&&safeUrl(base.sourceUrl)?`<a href="${esc(safeUrl(base.sourceUrl))}" target="_blank" rel="noopener noreferrer">24cocktails.com — zobacz oryginalną recepturę ${ico('external','sm')}</a>`:'autorski katalog startowy (klasyczny wariant receptury)'}. Ilości są orientacyjne; dopasuj smak do preferencji. ${base.source==='24cocktails.com'?'Ilustracja przepisu: 24cocktails.com.':''}</div>
 </div></div></div></div>`;
 }else if(m.kind==='add'||m.kind==='edit'){
   const original=m.kind==='edit'?state.stock.find(x=>x.id===m.id):null;
   if(m.kind==='edit'&&!original){ui.modal=null;return renderModal();}
   const prefill=m.prefill||'',selected=original?.key||prefill||'';
   root.innerHTML=`<div class="overlay center" data-action="overlay"><div class="dialog compact" role="dialog" aria-modal="true" aria-labelledby="add-title"><div class="dialog-head"><strong id="add-title">${original?'Edytuj produkt':'Dodaj do swojego barku'}</strong><button class="icon-btn" aria-label="Zamknij" data-action="close-modal">${ico('close')}</button></div><form id="stock-form" class="dialog-content" style="padding-top:4px"><label class="form-label" for="add-name">Nazwa alkoholu lub składnika</label><input class="form-input" id="add-name" name="name" placeholder="np. Hendrick’s Gin, Aperol, sok z limonki" value="${esc(original?.name||iName(selected,selected?'':''))}" maxlength="120" required autocomplete="off"><p class="form-note">Wpisz dokładną markę i wariant. Rozpoznaną kategorię możesz poprawić.</p><div id="product-match" class="product-match waiting" role="status" aria-live="polite"></div><label class="form-label" for="ingredient-type">Rozpoznany rodzaj produktu</label><select class="form-input product-select" id="ingredient-type" name="ingredientKey" required>${ingredientOptions(original?.key||selected)}</select><div class="suggestions" id="ingredient-suggestions">${ingredientSuggestions(original?.name||iName(selected,selected?'':''))}</div>
 <label class="switch-row"><input id="track-quantity" name="track" type="checkbox" ${original?.ml!==null&&original?.ml!==undefined?'checked':''}><span>Chcę śledzić dokładny stan butelki (w ml)</span></label><div id="quantity-wrap" style="${original?.ml!==null&&original?.ml!==undefined?'':'display:none'}"><label class="form-label" for="add-quantity">Ilość dostępna w ml</label><input class="form-input" id="add-quantity" name="quantity" type="number" min="0" max="100000" step="1" placeholder="np. 500" value="${original?.ml??''}"><p class="form-note">Śledzenie ilości najlepiej sprawdza się przy napojach. Owoce i dekoracje traktujemy jako dostępne.</p></div><div class="form-actions" style="justify-content:${original?'space-between':'flex-end'}">${original?`<button type="button" class="danger-link" data-action="delete-stock" data-id="${esc(original.id)}">${ico('trash','sm')} Usuń produkt</button>`:''}<div class="flex"><button type="button" class="btn ghost" data-action="close-modal">Anuluj</button><button type="submit" class="btn primary">${ico('check','sm')} ${original?'Zapisz zmiany':'Dodaj do barku'}</button></div></div></form></div></div>`;
   ui.selectedIngredient=original?.key||prefill||'';ui.productSelectionManual=!!original;updateProductIdentification();
 }else if(m.kind==='settings'){
   root.innerHTML=`<div class="overlay center" data-action="overlay"><div class="dialog compact" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div class="dialog-head"><strong id="settings-title">Ustawienia My Bar</strong><button class="icon-btn" aria-label="Zamknij" data-action="close-modal">${ico('close')}</button></div><div class="dialog-content"><h3>Twoje dane</h3><p class="side-note">Zapasy, ulubione i zakupy są przechowywane lokalnie w tej przeglądarce. Nie ma jeszcze synchronizacji między telefonem a komputerem.</p><div class="flex wrap"><button class="btn ghost" data-action="export-data">${ico('download','sm')} Eksportuj kopię</button><label class="btn ghost" for="import-file">${ico('upload','sm')} Importuj kopię</label><input id="import-file" type="file" accept="application/json,.json" hidden></div><hr style="border:0;border-top:1px solid #3a444d;margin:23px 0"><h3>Przepisy z internetu</h3><p class="side-note">Korzystamy z API 24cocktails.com. Po kliknięciu „Dobierz z internetu” wysyłamy wyłącznie nazwy posiadanych składników, bez informacji o ilościach. Dostawca wymaga wskazania źródła przepisu.</p><a class="link small" target="_blank" rel="noopener noreferrer" href="https://24cocktails.com/terms.html">Warunki korzystania z API ${ico('external','sm')}</a><hr style="border:0;border-top:1px solid #3a444d;margin:23px 0"><h3>Wyczyść bark</h3><p class="side-note">Możesz rozpocząć od nowa. Przed czyszczeniem warto zrobić kopię danych.</p><button class="btn ghost" data-action="open-reset">${ico('trash','sm')} Wyczyść wszystkie dane</button></div></div></div>`;
 }else if(m.kind==='reset'){
   root.innerHTML=`<div class="overlay center" data-action="overlay"><div class="dialog compact" role="alertdialog" aria-modal="true" aria-labelledby="reset-title"><div class="dialog-head"><strong id="reset-title">Wyczyścić dane?</strong><button class="icon-btn" data-action="close-modal" aria-label="Zamknij">${ico('close')}</button></div><div class="dialog-content"><p class="side-note">Usunięte zostaną zapasy, lista zakupów, ulubione i historia przygotowanych koktajli z tej przeglądarki.</p><div class="form-actions"><button class="btn ghost" data-action="close-modal">Anuluj</button><button class="btn primary" data-action="reset-all">Wyczyść dane</button></div></div></div></div>`;
 }
}
function ingredientSuggestions(q){
 const n=normalize(q);
 if(n.length<2)return '<span class="tiny muted">Wpisz minimum 2 znaki, aby zobaczyć propozycje.</span>';
 const brands=PRODUCT_MATCHES.filter(x=>x.norm.startsWith(n)||x.norm.includes(' '+n)).slice(0,6);
 const types=INGREDIENTS.filter(x=>normalize([x.name,x.en,...x.aliases].join(' ')).includes(n)).slice(0,5);
 return [...brands.map(x=>'<button type="button" class="suggestion brand-suggestion" data-action="choose-brand" data-name="'+esc(x.name)+'">'+esc(x.name)+' <span>· '+esc(iName(x.key))+'</span></button>'),
  ...types.map(x=>'<button type="button" class="suggestion" data-action="choose-ingredient" data-id="'+esc(x.id)+'">Rodzaj: '+esc(x.name)+'</button>')].join('')||
  '<span class="tiny muted">Nie ma marki w słowniku? Wybierz kategorię z listy powyżej.</span>';
}
function toast(message){const node=document.getElementById('toast');node.innerHTML=`<div class="toast-item" role="status">${esc(message)}</div>`;clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.innerHTML='',3300);}
function addToCart(key,name=''){
 if(!key)return false;
 const k=key;
 if(state.cart.some(x=>x.key===k))return false;
 state.cart.push({key:k,name:name||iName(k),bought:false});saveState();return true;
}
function saveStock(e){e.preventDefault();
 const form=e.target,name=form.elements.name.value.trim();if(!name){toast('Wpisz nazwę produktu');return;}
 const chosen=form.elements.ingredientKey.value;
 if(!chosen){toast('Wybierz rodzaj produktu lub wpisz dokładniejszy wariant');form.elements.ingredientKey.focus();return;}
 const key=chosen==='custom'?'custom:'+normalize(name).replace(/\s+/g,'_'):chosen;
 const track=form.elements.track.checked,amount=Number(form.elements.quantity.value);
 if(track&&(!form.elements.quantity.value.trim()||!Number.isFinite(amount)||amount<0)){toast('Podaj prawidłową ilość w ml');return;}
 const qty=track?Math.floor(amount):null;
 const item=state.stock.find(x=>x.id===ui.modal?.id);
 if(ui.modal?.kind==='edit'&&item){item.name=name;item.key=key;item.ml=qty;}
 else state.stock.push({id:freshId(),key,name,ml:qty});
 if(ui.productSelectionManual)state.brandOverrides[normalize(name)]=key;
 state.demo=false;state.cart=state.cart.filter(x=>x.key!==key);saveState();
 ui.modal=null;refresh();toast(item?'Produkt zaktualizowany':'Dodano do barku');
}
function subtractInventory(recipe,servings){
 for(const ing of recipe.ingredients){
   if(ing.optional||ing.unit!=='ml'||!Number.isFinite(ing.qty))continue;
   let remaining=ing.qty*servings;
   const opts=getAlternativeKeys(ing.id);
   for(const s of state.stock.filter(x=>opts.includes(x.key)&&x.ml!==null)){
      if(remaining<=0)break;
      if(['lime','lemon','orange'].includes(s.key)&&s.key!==ing.id)continue; // owoców nie rozliczamy w ml
      const take=Math.min(s.ml,remaining);s.ml=Math.max(0,s.ml-take);remaining-=take;
   }
 }
 state.history.push({id:recipe.id,name:recipe.name,servings,date:new Date().toISOString()});state.history=state.history.slice(-100);
 saveState();
}
function downloadJSON(){
 const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),...state},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='my-bar-kopia-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('Kopia danych przygotowana');
}
async function importJSON(file){
 if(!file)return;
 if(file.size>5e6){toast('Plik jest zbyt duży');return;}
 try{
   const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed.stock)||!Array.isArray(parsed.favorites))throw Error('format');
   state={stock:parsed.stock.filter(x=>x&&typeof x.key==='string'&&typeof x.name==='string').slice(0,500).map(x=>({id:String(x.id||freshId()),key:x.key,name:x.name.slice(0,120),ml:x.ml===null||x.ml===undefined?null:Number.isFinite(Number(x.ml))&&Number(x.ml)>=0?Number(x.ml):null})),favorites:parsed.favorites.filter(x=>typeof x==='string').slice(0,500),cart:Array.isArray(parsed.cart)?parsed.cart.filter(x=>x&&typeof x.key==='string').slice(0,200):[],history:Array.isArray(parsed.history)?parsed.history.slice(-100):[],brandOverrides:parsed.brandOverrides&&typeof parsed.brandOverrides==='object'&&!Array.isArray(parsed.brandOverrides)?Object.fromEntries(Object.entries(parsed.brandOverrides).filter(([n,k])=>n.length<=120&&typeof k==='string'&&(INDEX.has(k)||k.startsWith('custom:'))).slice(0,500)):{},demo:false};
   saveState();ui.modal=null;refresh();toast('Kopia danych została zaimportowana');
 }catch(e){toast('To nie jest poprawna kopia danych My Bar');}
}
function clipboard(text){
 if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text).then(()=>toast('Skopiowano do schowka')).catch(()=>fallbackCopy(text));
 fallbackCopy(text);
}
function fallbackCopy(text){const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.top='-2000px';document.body.appendChild(t);t.focus();t.select();try{document.execCommand('copy');toast('Skopiowano do schowka');}catch{toast('Nie można skopiować listy w tej przeglądarce');}t.remove();}
// Publiczne API 24cocktails.com: brak klucza, CORS, limit 120/min. Użytkownik inicjuje pobieranie.
async function apiJSON(path,params={}){
 const u=new URL(API+path);u.searchParams.set('lang','pl');Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,String(v)));
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),10000);
 try{const resp=await fetch(u.toString(),{signal:ctrl.signal,headers:{Accept:'application/json'}});if(!resp.ok)throw Error('HTTP '+resp.status);return await resp.json();}finally{clearTimeout(timer);}
}
function listFromResponse(x){
 if(Array.isArray(x))return x;
 if(!x||typeof x!=='object')return [];
 for(const k of ['results','recipes','cocktails','drinks','items','data','can_make','one_away']){
   const val=x[k];if(Array.isArray(val))return val;
   if(val&&typeof val==='object')for(const nk of ['results','recipes','items'])if(Array.isArray(val[nk]))return val[nk];
 }
 return [];
}
function summariesFromResponse(json){return listFromResponse(json).map(x=>{
 const row=x&&typeof x==='object'?x.recipe||x.cocktail||x:x;
 if(typeof row==='string')return {slug:row,name:row};
 return {slug:row?.slug||row?.id||row?.recipe_slug||'',name:row?.name||row?.title||row?.slug||'',raw:row};
 }).filter(x=>/^[a-z0-9][a-z0-9-]{0,120}$/i.test(x.slug));}
function getOnlineIngredient(row){
 const name=String(row.name||row.key||'Składnik');
 const candidate=row.key||row.name;
 const id=canonical(String(candidate).replace(/_/g,' '));
 const amount=String(row.amount||'');
 let qty=Number(row.ml);if(row.ml===null||row.ml===undefined||row.ml===''||!Number.isFinite(qty))qty=null;
 let unit='ml';
 if(qty===null){
   const match=amount.match(/^([\d.,]+)\s*(ml|cl|oz|szt|dash|tsp|tbsp)/i);
   if(match){qty=Number(match[1].replace(',','.'));const scale={cl:10,oz:29.57};const u=match[2].toLowerCase();if(scale[u])qty=+(qty*scale[u]).toFixed(1);else if(!['ml'].includes(u))unit=u;}
 }
 return {id,name,qty,unit,raw:amount,optional:!!row.optional};
}
function normalizeOnline(raw){
 if(!raw||typeof raw!=='object'||!Array.isArray(raw.ingredients))return null;
 const slug=String(raw.slug||raw.id||'');if(!/^[a-z0-9][a-z0-9-]{0,120}$/i.test(slug))return null;
 const r={id:'net:'+slug,name:String(raw.name||raw.title||slug),base:raw.base==='na'||raw.base==='none'?'none':canonical(raw.base||'none'),taste:String(raw.taste||'klasyk'),glass:String(raw.glass||'Kieliszek'),method:String(raw.method||'Przygotuj'),minutes:Math.max(1,Math.min(60,Number(raw.prep_minutes)||4)),description:String(raw.description||raw.subtitle||`Przepis z katalogu 24cocktails.com — ${raw.ingredients.length} składników.`),ingredients:raw.ingredients.map(getOnlineIngredient),steps:Array.isArray(raw.steps)?raw.steps.map(String).filter(Boolean).slice(0,20):[],photo:safeUrl(raw.photo),source:'24cocktails.com',sourceUrl:safeUrl(raw.url)||`https://24cocktails.com/cocktail/${encodeURIComponent(slug)}`,nonAlcoholic:raw.base==='na'};
 if(!r.ingredients.length)return null;
 if(!r.steps.length)r.steps=['Odmierz składniki zgodnie z recepturą.','Przygotuj koktajl wskazaną metodą i podaj w odpowiednim szkle.'];
 return r;
}
async function detailOnline(slug){
 const existing=ONLINE.get('net:'+slug);if(existing)return existing;
 const json=await apiJSON('/recipe/'+encodeURIComponent(slug));
 const row=normalizeOnline(json.recipe&&typeof json.recipe==='object'?json.recipe:json);
 if(row){ONLINE.set(row.id,row);return row;}throw Error('Invalid API recipe');
}
async function fetchSomeSummaries(rows,cap=16){
 const slugs=[...new Set(rows.map(x=>x.slug))].slice(0,cap);
 let count=0;
 for(let i=0;i<slugs.length;i+=5){
   const bunch=slugs.slice(i,i+5);
   const done=await Promise.allSettled(bunch.map(detailOnline));
   count+=done.filter(x=>x.status==='fulfilled').length;
 }
 return count;
}
async function syncOnline(){
 if(ui.onlineStatus==='loading')return;
 if(!navigator.onLine){toast('Brak połączenia z internetem');return;}
 if(!state.stock.length){toast('Najpierw dodaj składniki do barku');return;}
 ui.onlineStatus='loading';ui.onlineError='';refresh();
 const have=[...new Set(state.stock.map(x=>iEn(x.key)).filter(Boolean))].slice(0,35).join(',');
 try{
   const json=await apiJSON('/by-ingredients',{have});
   const ready=summariesFromResponse({can_make:json.can_make||json.ready||[]});
   const near=summariesFromResponse({one_away:json.one_away||json.almost||[]});
   const count=await fetchSomeSummaries([...ready.slice(0,13),...near.slice(0,13)],26);
   ui.onlineSynced=true;ui.onlineStatus='success';ui.onlineError='';refresh();
   toast(count?`Pobrano ${count} przepisów online`:'Brak nowych receptur dla tych składników');
 }catch(e){console.warn('API recipes',e);ui.onlineStatus='error';ui.onlineError='Nie udało się pobrać nowych przepisów z 24cocktails.com.';refresh();toast('Brak połączenia z katalogiem online');}
}
async function onlineSearch(){
 const q=ui.query.trim();if(q.length<2){toast('Wpisz nazwę koktajlu lub składnika (min. 2 znaki)');return;}
 if(ui.onlineSearchLoading)return;
 ui.onlineSearchLoading=true;ui.onlineError='';refresh();
 try{
   const json=await apiJSON('/search',{q,limit:25});
   const summaries=summariesFromResponse(json);
   ui.onlineSearchQuery=q;ui.onlineSearchResults=summaries;
   if(!summaries.length)toast('Nie znaleziono przepisów w bazie internetowej');
   else toast(`Znaleziono ${summaries.length} pozycji online`);
 }catch(e){console.warn('Search online',e);ui.onlineError='Wyszukiwarka internetowa chwilowo nie odpowiada.';toast('Nie udało się wyszukać online');}
 finally{ui.onlineSearchLoading=false;refresh();}
}
// Globalna delegacja zdarzeń: działania UI nie wymagają frameworka.
document.addEventListener('click',async e=>{
 const el=e.target.closest('[data-action]');if(!el)return;
 const action=el.dataset.action,id=el.dataset.id;
 if(action==='overlay'){if(e.target===el){ui.modal=null;renderModal();}return;}
 if(el.tagName==='A'&&action==='navigate')e.preventDefault();
 if(action==='navigate'){navigate(el.dataset.page);return;}
 if(action==='open-add'){ui.modal={kind:'add',prefill:id||''};renderModal();setTimeout(()=>document.getElementById('add-name')?.focus(),20);return;}
 if(action==='close-modal'){ui.modal=null;renderModal();return;}
 if(action==='open-recipe'){
    const r=getRecipe(id);if(!r)return;
    ui.modal={kind:'recipe',id};ui.servings=1;renderModal();return;
 }
 if(action==='toggle-favorite'){
   if(state.favorites.includes(id))state.favorites=state.favorites.filter(x=>x!==id);else state.favorites.push(id);
   saveState();refresh();if(ui.modal?.kind==='recipe')renderModal();return;
 }
 if(action==='set-filter'){ui.filter=id;refresh();return;}
 if(action==='servings-up'){ui.servings=Math.min(20,ui.servings+1);renderModal();return;}
 if(action==='servings-down'){ui.servings=Math.max(1,ui.servings-1);renderModal();return;}
 if(action==='edit-stock'){ui.modal={kind:'edit',id};renderModal();return;}
 if(action==='delete-stock'){state.stock=state.stock.filter(x=>x.id!==id);state.demo=false;saveState();ui.modal=null;refresh();toast('Usunięto produkt');return;}
 if(action==='choose-ingredient'){
  const n=document.getElementById('add-name'),sel=document.getElementById('ingredient-type');
  if(n&&!n.value.trim())n.value=iName(id);
  if(sel)sel.value=id;
  ui.selectedIngredient=id;ui.productSelectionManual=true;updateProductIdentification();
  if(n){document.getElementById('ingredient-suggestions').innerHTML=ingredientSuggestions(n.value);n.focus();}
  return;
 }
 if(action==='choose-brand'){
  const n=document.getElementById('add-name');if(!n)return;
  n.value=el.dataset.name||'';ui.productSelectionManual=false;ui.selectedIngredient='';
  document.getElementById('ingredient-suggestions').innerHTML=ingredientSuggestions(n.value);
  updateProductIdentification();n.focus();return;
 }
 if(action==='clear-demo'){state=blankState();saveState();refresh();toast('Teraz możesz dodawać własne zapasy');return;}
 if(action==='open-settings'){ui.modal={kind:'settings'};renderModal();return;}
 if(action==='open-reset'){ui.modal={kind:'reset'};renderModal();return;}
 if(action==='reset-all'){state=blankState();saveState();ui.modal=null;ui.page='home';refresh();toast('Dane zostały wyczyszczone');return;}
 if(action==='export-data'){downloadJSON();return;}
 if(action==='add-shopping'){
   const result=addToCart(id);refresh();toast(result?'Dodano na listę zakupów':'Produkt jest już na liście');return;
 }
 if(action==='remove-shopping'){state.cart=state.cart.filter(x=>x.key!==id);saveState();refresh();toast('Usunięto z listy');return;}
 if(action==='toggle-bought'){const x=state.cart.find(x=>x.key===id);if(x){x.bought=!x.bought;saveState();refresh();}return;}
 if(action==='add-bought'){ui.modal={kind:'add',prefill:id};renderModal();return;}
 if(action==='copy-shopping'){clipboard(state.cart.length?state.cart.map(x=>`${x.bought?'[x]':'[ ]'} ${x.name||iName(x.key)}`).join('\n'):'Lista zakupów jest pusta');return;}
 if(action==='add-recipe-shopping'){
   const r=getRecipe(id);if(!r)return;const missing=missingFor(r,ui.servings);let added=0;
   for(const ing of missing)if(addToCart(ing.id,ing.name||iName(ing.id)))added++;
   refresh();toast(added?`Dodano ${added} brakujących składników`:'Wszystkie brakujące są już na liście');return;
 }
 if(action==='make-drink'){
   const r=getRecipe(id);if(!r)return;if(missingFor(r,ui.servings).length){toast('Brakuje składników — dodaj je do barku');renderModal();return;}
   subtractInventory(r,ui.servings);ui.modal=null;refresh();toast('Smacznego! Zaktualizowano stan butelek.');return;
 }
 if(action==='sync-online'){await syncOnline();return;}
 if(action==='search-online'){await onlineSearch();return;}
 if(action==='fetch-online'){
   el.disabled=true;el.innerHTML=`<span class="loader"></span> Pobieram...`;
   try{const r=await detailOnline(id);ui.modal={kind:'recipe',id:r.id};ui.servings=1;refresh();}catch(err){el.disabled=false;toast('Nie udało się pobrać tego przepisu');}
   return;
 }
});
document.addEventListener('submit',e=>{
 if(e.target.id==='stock-form'){saveStock(e);return;}
 if(e.target.id==='custom-shopping-form'){
   e.preventDefault();const name=e.target.elements.shoppingName.value.trim();if(!name)return;
   const key=canonical(name),result=addToCart(key,name);refresh();toast(result?'Dodano na listę':'Jest już na liście');
 }
});
document.addEventListener('input',e=>{
 if(e.target.id==='recipe-search'){
   ui.query=e.target.value;refreshResults();return;
 }
 if(e.target.id==='add-name'){
  ui.selectedIngredient='';ui.productSelectionManual=false;
  const dest=document.getElementById('ingredient-suggestions');if(dest)dest.innerHTML=ingredientSuggestions(e.target.value);
  updateProductIdentification();return;
 }
});
document.addEventListener('change',e=>{
 if(e.target.id==='ingredient-type'){ui.productSelectionManual=true;ui.selectedIngredient=e.target.value;updateProductIdentification();}
 if(e.target.id==='base-filter'){ui.base=e.target.value;refreshResults();}
 if(e.target.id==='taste-filter'){ui.taste=e.target.value;refreshResults();}
 if(e.target.id==='sort-filter'){ui.sort=e.target.value;refreshResults();}
 if(e.target.id==='track-quantity'){document.getElementById('quantity-wrap').style.display=e.target.checked?'':'none';}
 if(e.target.id==='import-file'){importJSON(e.target.files?.[0]);}
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&ui.modal){ui.modal=null;renderModal();}
 if(e.key==='Enter'&&e.target.closest('.recipe-card')&&e.target.classList.contains('recipe-card')){e.preventDefault();const el=e.target;ui.modal={kind:'recipe',id:el.dataset.id};ui.servings=1;renderModal();}
});
window.addEventListener('online',()=>{if(!ui.modal)refresh();});
window.addEventListener('offline',()=>{if(!ui.modal)refresh();});
render();
if('serviceWorker' in navigator && ['https:','http:'].includes(location.protocol) && (location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname))){
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('PWA service worker',err)));
}
