/* My Bar 1.2 — zaawansowana wyszukiwarka produktów.
 * Podpowiedzi lokalne działają od razu i offline. Online: opcjonalna wyszukiwarka
 * Open Food Facts Search-a-licious, bez klucza. Zapytania są ograniczane i cache'owane.
 * Zewnętrzne metadane są traktowane jako sugestia, nie pewnik. */
'use strict';
const PRODUCT_SEARCH={
  query:'',items:[],status:'idle',cache:new Map(),lastAt:0,timer:null,abort:null,requestId:0,selected:null
};
function productText(x,limit=160){return String(x??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().slice(0,limit);}
function editDistanceLimited(a,b,max=2){
  if(Math.abs(a.length-b.length)>max)return max+1;
  let prev=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const row=[i];
    for(let j=1;j<=b.length;j++)row.push(Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1)));
    if(Math.min(...row)>max)return max+1;
    prev=row;
  }
  return prev[b.length];
}
function productLocalScore(query,name){
 const n=normalize(name),q=normalize(query);
 if(!q||!n)return Infinity;
 if(n===q)return 0;
 if(n.startsWith(q+' '))return 5;
 if(n.startsWith(q))return 8;
 if(n.includes(' '+q+' '))return 16;
 if(n.includes(' '+q))return 19;
 if(n.includes(q))return 25;
 if(q.length>=4){
   const terms=n.split(' ');
   const first=terms.slice(0,2).join(' ');
   if(editDistanceLimited(q,first,2)<=2)return 34+editDistanceLimited(q,first,2);
   for(const term of terms)if(term.length>=4&&editDistanceLimited(q,term,2)<=2)return 41+editDistanceLimited(q,term,2);
 }
 return Infinity;
}
function localProductCandidates(query){
 const q=normalize(query);if(q.length<2)return [];
 const rows=[],used=new Set();
 const priority={'botucal reserva exclusiva':-17,'botucal planas':-16,'botucal mantuano':-15,'diplomatico reserva exclusiva':-9,'diplomatico planas':-8};
 const push=(name,key,source,rank)=>{
   const token=normalize(name);
   if(!key||!token||used.has(token+'|'+key))return;
   used.add(token+'|'+key);
   rows.push({name,key,source,rank:rank+(priority[token]||0)});
 };
 for(const item of PRODUCT_BRANDS){
   const score=productLocalScore(q,item.name);
   if(Number.isFinite(score))push(item.name,item.key,'Katalog My Bar',score);
 }
 for(const item of state.stock){
   const score=productLocalScore(q,item.name);
   if(Number.isFinite(score))push(item.name,item.key,'Twój barek',score-3);
 }
 for(const item of INGREDIENTS){
   const names=[item.name,item.en,...(item.aliases||[])];
   const scored=names.map(name=>productLocalScore(q,name));
   const best=Math.min(...scored);
   if(Number.isFinite(best))push(item.name,item.id,'Rodzaj składnika',best+22);
 }
 return rows.sort((a,b)=>a.rank-b.rank||a.name.length-b.name.length||a.name.localeCompare(b.name,'pl')).slice(0,12);
}
function classifyExternalProduct(name,categories=''){
 const n=normalize(name),c=normalize(categories),combined=n+' '+c;
 const local=identifyProduct(name);
 if(local.key&&!local.key.startsWith('custom:')&&['brand','remembered'].includes(local.status))return {key:local.key,confidence:'catalog'};
 const check=re=>re.test(combined);
 if(check(/\b(ready to drink|premix|pre mix|mixed cocktails|gotow.+ drink)\b/))return {key:'ready_cocktail',confidence:'type'};
 if(check(/\b(vermouth|wermut|vermut)\b/)){
   if(check(/\b(rosso|rouge|sweet|red|czerwony|slodki)\b/))return {key:'sweet_vermouth',confidence:'type'};
   if(check(/\b(bianco|blanc|white|bialy)\b/))return {key:'white_vermouth',confidence:'type'};
   if(check(/\b(dry|extra dry|wytrawny)\b/))return {key:'dry_vermouth',confidence:'type'};
   return {key:'',confidence:'ambiguous'};
 }
 if(check(/\b(rum|rums|ron|rhum)\b/)){
   if(check(/\b(spiced|spice|korzenny)\b/))return {key:'spiced_rum',confidence:'type'};
   if(check(/\b(white|blanco|blanc|silver|light|bialy|plata)\b/))return {key:'white_rum',confidence:'type'};
   if(check(/\b(aged|dark|matured|old|reserve|reserva|anejo|anejo|gold|ciemny|starzony|brun)\b/))return {key:'dark_rum',confidence:'type'};
   return {key:'rum',confidence:'generic'};
 }
 if(check(/\b(tequila)\b/)){
   if(check(/\b(reposado)\b/))return {key:'tequila_reposado',confidence:'type'};
   if(check(/\b(anejo|extra anejo)\b/))return {key:'tequila_anejo',confidence:'type'};
   if(check(/\b(gold|oro)\b/))return {key:'tequila_gold',confidence:'type'};
   return {key:'tequila',confidence:'generic'};
 }
 if(check(/\b(whisky|whiskey|whiskies|whiskys)\b/)){
   if(check(/\b(liqueur|likier)\b/))return {key:'whiskey_liqueur',confidence:'type'};
   if(check(/\b(rye|zytnia)\b/))return {key:'rye_whiskey',confidence:'type'};
   if(check(/\b(bourbon)\b/))return {key:'bourbon',confidence:'type'};
   if(check(/\b(irish|irlandzka)\b/))return {key:'irish_whiskey',confidence:'type'};
   return {key:'whiskey',confidence:'generic'};
 }
 if(check(/\b(gin|gins)\b/))return {key:check(/\b(pink|flavo(?:u)?red)\b/)?'flavored_gin':'gin',confidence:'type'};
 if(check(/\b(vodka|wodka)\b/))return {key:check(/\b(flavou?red|citron|vanilla|lemon|raspberry|smakowa)\b/)?'flavored_vodka':'vodka',confidence:'type'};
 if(check(/\b(mezcal|mescal)\b/))return {key:'mezcal',confidence:'type'};
 if(check(/\b(pisco)\b/))return {key:'pisco',confidence:'type'};
 if(check(/\b(cachaca)\b/))return {key:'cachaca',confidence:'type'};
 if(check(/\b(beer|beers|piwo)\b/))return {key:'beer',confidence:'generic'};
 if(check(/\b(cream liqueur|irish cream|likier smietankowy)\b/))return {key:'cream_liqueur',confidence:'type'};
 if(check(/\b(coconut liqueur|likier kokosowy)\b/))return {key:'coconut_liqueur',confidence:'type'};
 if(check(/\b(coffee liqueur|likier kawowy)\b/))return {key:'coffee_liqueur',confidence:'type'};
 if(check(/\b(orange liqueur|triple sec|curacao)\b/))return {key:'triple_sec',confidence:'type'};
 if(check(/\b(limoncello)\b/))return {key:'limoncello',confidence:'type'};
 if(check(/\b(amaretto)\b/))return {key:'amaretto',confidence:'type'};
 if(check(/\b(prosecco|champagne|cava|sparkling wine|wino musujace)\b/))return {key:'prosecco',confidence:'generic'};
 if(check(/\b(tonic|tonik)\b/))return {key:'tonic',confidence:'generic'};
 if(check(/\b(ginger ale)\b/))return {key:'ginger_ale',confidence:'type'};
 if(check(/\b(ginger beer)\b/))return {key:'ginger_beer',confidence:'type'};
 if(check(/\b(cola)\b/))return {key:'cola',confidence:'type'};
 if(local.key&&!local.key.startsWith('custom:'))return {key:local.key,confidence:'generic'};
 return {key:'',confidence:'unknown'};
}
function decodeOnlineProducts(body,query){
 const hits=Array.isArray(body?.hits)?body.hits:Array.isArray(body?.products)?body.products:[];
 const rows=[],seen=new Set(),q=normalize(query);
 for(const h of hits.slice(0,35)){
   const p=h?._source||h?.source||h?.product||h?.fields||h;
   if(!p||typeof p!=='object')continue;
   const one=x=>Array.isArray(x)?x[0]:x;
   const brand=productText(one(p.brands)||'',90).split(',')[0].trim();
   const base=productText(one(p.product_name_pl)||one(p.product_name_en)||one(p.product_name)||one(p.generic_name)||'',120);
   let name=base||brand;
   if(brand&&name&&!normalize(name).includes(normalize(brand))&&normalize(brand)!==normalize(name))name=brand+' '+name;
   if(!name||name.length<3)continue;
   // Nie wyświetlamy przypadkowych, niepasujących do zapytania produktów.
   const score=productLocalScore(query,name);
   if(!Number.isFinite(score)&&!normalize(brand).includes(q))continue;
   const categories=[p.categories,one(p.categories_tags),one(p.categories_tags_en),p.categories_en].filter(Boolean).join(' ');
   const matched=classifyExternalProduct(name,categories);
   const token=normalize(name);
   if(seen.has(token))continue;seen.add(token);
   const id=productText(one(p.code)||h?.id||token,60);
   rows.push({id,name,key:matched.key,confidence:matched.confidence,source:'Open Food Facts',rank:Number.isFinite(score)?score:50,barcode:/^\d{8,14}$/.test(id)?id:null});
 }
 return rows.sort((a,b)=>(a.key?0:1)-(b.key?0:1)||a.rank-b.rank||a.name.localeCompare(b.name,'pl')).slice(0,10);
}
function currentOnlineCandidates(query){
 return normalize(query)===normalize(PRODUCT_SEARCH.query)&&PRODUCT_SEARCH.status==='ready'?PRODUCT_SEARCH.items:[];
}
function productSuggestionMarkup(query){
 const n=normalize(query);
 if(n.length<2)return '<div class="product-suggest-empty">Zacznij wpisywać nazwę alkoholu. Pokażemy konkretne marki i warianty.</div>';
 const offline=localProductCandidates(query).slice(0,8),online=currentOnlineCandidates(query);
 const localNames=new Set(offline.map(x=>normalize(x.name)));
 const extra=online.filter(x=>!localNames.has(normalize(x.name))).slice(0,5);
 const lines=[];
 if(offline.length){
   lines.push('<div class="product-suggest-head">Pasujące produkty</div>');
   lines.push(...offline.map(x=>'<button type="button" class="product-option" data-action="choose-brand" data-name="'+esc(x.name)+'"><span><b>'+esc(x.name)+'</b><small>'+esc(iName(x.key))+'</small></span><em>'+esc(x.source)+'</em></button>'));
 }
 if(extra.length){
   lines.push('<div class="product-suggest-head">Znalezione w internecie</div>');
   lines.push(...extra.map(x=>'<button type="button" class="product-option" data-action="choose-online-product" data-id="'+esc(x.id)+'"><span><b>'+esc(x.name)+'</b><small>'+esc(x.key?iName(x.key):'Typ do potwierdzenia')+'</small></span><em>Open Food Facts</em></button>'));
 }
 if(PRODUCT_SEARCH.status==='loading'&&PRODUCT_SEARCH.query===n)lines.push('<div class="product-suggest-info">Szukam dodatkowych produktów w internecie…</div>');
 if(!offline.length&&!extra.length&&PRODUCT_SEARCH.status!=='loading')lines.push('<div class="product-suggest-empty">Brak lokalnych dopasowań. Możesz sprawdzić katalog internetowy lub wybrać rodzaj ręcznie.</div>');
 if(PRODUCT_SEARCH.status==='error'&&PRODUCT_SEARCH.query===n)lines.push('<div class="product-suggest-info warn">Wyszukiwarka zewnętrzna jest niedostępna. Lokalny katalog nadal działa.</div>');
 if(n.length>=4&&navigator.onLine){
   lines.push('<button type="button" class="product-search-more" data-action="search-products-online">Sprawdź więcej produktów online '+ico('search','sm')+'</button>');
 }
 return lines.join('');
}
function renderProductSuggestions(){
 const input=document.getElementById('add-name'),target=document.getElementById('ingredient-suggestions');
 if(input&&target)target.innerHTML=productSuggestionMarkup(input.value);
}
function resetProductOnline(){
 clearTimeout(PRODUCT_SEARCH.timer);
 if(PRODUCT_SEARCH.abort){PRODUCT_SEARCH.abort.abort();PRODUCT_SEARCH.abort=null;}
 PRODUCT_SEARCH.requestId++;
 PRODUCT_SEARCH.status='idle';PRODUCT_SEARCH.query='';PRODUCT_SEARCH.items=[];
}
function scheduleProductOnlineSearch(query,{force=false}={}){
 const q=normalize(query);
 clearTimeout(PRODUCT_SEARCH.timer);
 if(q.length<4||!navigator.onLine){resetProductOnline();return;}
 if(!force&&localProductCandidates(query).length>=5){
   PRODUCT_SEARCH.query=q;PRODUCT_SEARCH.status='idle';PRODUCT_SEARCH.items=[];return;
 }
 if(PRODUCT_SEARCH.cache.has(q)){
   PRODUCT_SEARCH.query=q;PRODUCT_SEARCH.items=PRODUCT_SEARCH.cache.get(q);PRODUCT_SEARCH.status='ready';
   renderProductSuggestions();return;
 }
 if(!force&&PRODUCT_SEARCH.query===q&&['loading','ready'].includes(PRODUCT_SEARCH.status))return;
 PRODUCT_SEARCH.query=q;PRODUCT_SEARCH.status='pending';PRODUCT_SEARCH.items=[];
 // Nie wysyłamy żądania na każde naciśnięcie klawisza.
 const delay=force?0:1000;
 PRODUCT_SEARCH.timer=setTimeout(()=>runProductOnlineSearch(q),delay);
}
async function runProductOnlineSearch(q){
 if(!q||q.length<4)return;
 const now=Date.now();
 if(now-PRODUCT_SEARCH.lastAt<6500){
   PRODUCT_SEARCH.status='waiting';renderProductSuggestions();
   PRODUCT_SEARCH.timer=setTimeout(()=>runProductOnlineSearch(q),6500-(now-PRODUCT_SEARCH.lastAt));
   return;
 }
 if(PRODUCT_SEARCH.abort)PRODUCT_SEARCH.abort.abort();
 const ctrl=new AbortController();PRODUCT_SEARCH.abort=ctrl;
 const seq=++PRODUCT_SEARCH.requestId;
 PRODUCT_SEARCH.lastAt=Date.now();PRODUCT_SEARCH.query=q;PRODUCT_SEARCH.status='loading';renderProductSuggestions();
 const url=new URL('https://search.openfoodfacts.org/search');
 url.searchParams.set('q',q.replace(/[+&|!(){}\[\]^"~*?:\\/]/g,' ').trim());
 url.searchParams.set('page_size','16');
 url.searchParams.set('fields','code,product_name,product_name_pl,product_name_en,brands,categories,categories_tags,categories_tags_en,generic_name');
 url.searchParams.set('langs','pl,en');
 const timer=setTimeout(()=>ctrl.abort(),8500);
 try{
   const response=await fetch(url.toString(),{mode:'cors',headers:{Accept:'application/json'},signal:ctrl.signal});
   if(!response.ok)throw Error('HTTP '+response.status);
   const data=await response.json();
   if(seq!==PRODUCT_SEARCH.requestId||normalize(document.getElementById('add-name')?.value)!==q)return;
   const items=decodeOnlineProducts(data,q);
   PRODUCT_SEARCH.cache.set(q,items);
   if(PRODUCT_SEARCH.cache.size>30)PRODUCT_SEARCH.cache.delete(PRODUCT_SEARCH.cache.keys().next().value);
   PRODUCT_SEARCH.items=items;PRODUCT_SEARCH.status='ready';
 }catch(error){
   if(seq!==PRODUCT_SEARCH.requestId||error.name==='AbortError'&&normalize(document.getElementById('add-name')?.value)!==q)return;
   PRODUCT_SEARCH.items=[];PRODUCT_SEARCH.status='error';
   console.warn('My Bar — katalog produktów online:',error);
 }finally{
   clearTimeout(timer);
   if(PRODUCT_SEARCH.abort===ctrl)PRODUCT_SEARCH.abort=null;
   if(seq===PRODUCT_SEARCH.requestId)renderProductSuggestions();
 }
}
function selectedOnlineProduct(id){return PRODUCT_SEARCH.items.find(x=>x.id===id)||null;}
