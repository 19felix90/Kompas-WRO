/* App assets only. OSM map tiles and Google images are never cached by this worker. */
const SHELL='kompas-wro-shell-0.2.1';
const FILES=['./','./index.html','./styles.css','./app.js','./data/starter.js','./manifest.webmanifest','./assets/icon.svg','./assets/apple-touch-icon.png','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('kompas-wro-shell-')&&key!==SHELL).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin)return;
  // Prefer fresh app code to prevent old installed versions staying stuck in cache.
  event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(SHELL).then(cache=>cache.put(request,copy)).catch(()=>{});}return response;}).catch(()=>caches.match(request,{ignoreSearch:true}).then(hit=>hit||Response.error())));
});
