/* My Bar 1.3 — dodatkowe katalogi alkoholi. Odpowiedzi to wskazówki,
 * nie zweryfikowana klasyfikacja. Bez kluczy API i bez transferu zapasów. */
'use strict';
function alcoholQueryVariants(query){
 const original=normalize(query);
 const fixed=original.replace(/\bsanta theresa\b/g,'santa teresa')
   .replace(/\bcompaniero\b/g,'companero').replace(/\s+/g,' ').trim();
 const reduced=fixed.replace(/\b(rhum|rum|ron|liqueur|liquor|likier|licor|orange|pomaranczowy)\b/g,' ')
   .replace(/\s+\d+(?:\s+\d+)?(?:\s*ml|\s*l)?$/,'').replace(/\s+/g,' ').trim();
 return [...new Set([fixed,reduced,original].filter(x=>x.length>=4))].slice(0,3);
}
async function alcoholGetJson(url,signal){
 const res=await fetch(url.toString(),{mode:'cors',signal,headers:{Accept:'application/json'}});
 if(!res.ok)throw Error('HTTP '+res.status);
 return res.json();
}
async function alcoholLimit(request,ms){
 let timer;
 try{return await Promise.race([request,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('API timeout')),ms)})]);}
 finally{clearTimeout(timer);}
}
function decodeDrinkDB(json,query){
 const list=Array.isArray(json?.drinks)?json.drinks:Array.isArray(json?.results)?json.results:Array.isArray(json?.data)?json.data:[];
 const out=[],seen=new Set();
 for(const row of list.slice(0,35)){
  if(!row||typeof row!=='object')continue;
  const name=productText(row.title||row.name||row.product_name||row.drink_name||'',130);
  const cat=productText((row.category&&typeof row.category==='object'?row.category.name:row.category)||row.type||row.drink_type||'',130);
  const desc=productText(row.description||row.subcategory||row.style||'',150);
  if(!name||!Number.isFinite(productLocalScore(query,name)))continue;
  if(/\b(cocktails?|mocktails?|shots?|recipes?)\b/.test(normalize(cat)))continue;
  const type=classifyExternalProduct(name,cat+' '+desc),token=normalize(name);
  if(!type.key||!INDEX.has(type.key)||seen.has(token)||['rum','gin','vodka','whiskey','tequila'].includes(token))continue;
  seen.add(token);
  out.push({id:'ddb:'+productText(row.id||row.slug||token,70),name,key:type.key,
    source:'DrinkDB',confidence:type.confidence,rank:productLocalScore(query,name)});
 }
 return out.sort((a,b)=>a.rank-b.rank).slice(0,8);
}
async function searchDrinkDB(query,signal){
 const url=new URL('https://www.drinkdb.site/api.php');
 Object.entries({action:'search',q:query,limit:'20'}).forEach(([k,v])=>url.searchParams.set(k,v));
 return decodeDrinkDB(await alcoholGetJson(url,signal),query);
}
async function searchOFFAlicious(query,signal){
 const url=new URL('https://search.openfoodfacts.org/search');
 url.searchParams.set('q',query.replace(/[+&|!(){}\[\]^"~*?:\\/]/g,' ').trim());
 url.searchParams.set('page_size','18');
 url.searchParams.set('fields','code,product_name,product_name_pl,product_name_en,brands,categories,categories_tags,categories_tags_en,generic_name');
 url.searchParams.set('langs','pl,en');
 return decodeOnlineProducts(await alcoholGetJson(url,signal),query);
}
async function searchOFFLegacy(query,signal){
 const url=new URL('https://world.openfoodfacts.org/cgi/search.pl');
 Object.entries({search_terms:query,search_simple:'1',action:'process',json:'1',page_size:'18',
 fields:'code,product_name,product_name_pl,product_name_en,brands,categories,categories_tags,categories_tags_en,generic_name'}).forEach(([k,v])=>url.searchParams.set(k,v));
 return decodeOnlineProducts(await alcoholGetJson(url,signal),query);
}
function mergeAlcoholSources(parts,query){
 const byName=new Map();
 for(const items of parts)for(const item of items){
  if(!item?.name||!item.key||!INDEX.has(item.key))continue;
  const n=normalize(item.name),score=productLocalScore(query,item.name);
  if(!n||!Number.isFinite(score))continue;
  const old=byName.get(n);
  if(!old||score<old.rank)byName.set(n,{...item,id:String(item.id||'remote:'+n),rank:score});
 }
 return [...byName.values()].sort((a,b)=>a.rank-b.rank||
   (a.confidence==='catalog'?-1:1)-(b.confidence==='catalog'?-1:1)||
   a.name.localeCompare(b.name,'pl')).slice(0,12);
}
async function lookupAlcoholCatalogs(query,signal){
 const variants=alcoholQueryVariants(query);
 const primary=variants[0]||query;
 const results=await Promise.allSettled([
   alcoholLimit(searchDrinkDB(primary,signal),4200),
   alcoholLimit(searchOFFAlicious(primary,signal),4200)
 ]);
 const parts=[],errors=[];let successes=0;
 for(const r of results)if(r.status==='fulfilled'){parts.push(r.value);successes++;}else errors.push(r.reason);
 let items=mergeAlcoholSources(parts,query);
 if(items.length<4&&!signal.aborted){
   const alternate=variants.length>1?variants[1]:primary;
   const fallback=await Promise.allSettled([
     alcoholLimit(searchOFFLegacy(alternate,signal),3700),
     alcoholLimit(searchWikidataBeverages(alternate,signal),3700)
   ]);
   for(const r of fallback)if(r.status==='fulfilled'){parts.push(r.value);successes++;}else errors.push(r.reason);
   items=mergeAlcoholSources(parts,query);
 }
 return {items,successes,errorCount:errors.length};
}
