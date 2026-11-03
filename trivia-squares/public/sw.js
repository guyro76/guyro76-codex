/* Trivia Squares service worker.
 * - Pages: network first, so every deploy is seen immediately; the last good copy opens offline.
 * - Hashed build files, fonts and artwork: cache first (they never change under the same URL).
 * - Never touches cross-origin requests (Supabase, auth) or non-GET requests. */
const VERSION='ts-v1';
const PAGES=VERSION+'-pages';
const ASSETS=VERSION+'-assets';
const SHELL=['/','/privacy','/terms'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(PAGES).then(c=>c.addAll(SHELL)).catch(()=>{}).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>!k.startsWith(VERSION)).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});

const isAsset=url=>url.pathname.startsWith('/_next/static/')||url.pathname.startsWith('/art/')||url.pathname.startsWith('/fonts/')||/\.(png|svg|webp|woff2)$/.test(url.pathname);

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(PAGES).then(c=>c.put(url.pathname==='/'?'/':req,copy)).catch(()=>{})}
      return res;
    }).catch(()=>caches.match(req,{ignoreSearch:true}).then(hit=>hit||caches.match('/'))));
    return;
  }
  if(isAsset(url)){
    event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(ASSETS).then(c=>c.put(req,copy)).catch(()=>{})}
      return res;
    })));
  }
});
