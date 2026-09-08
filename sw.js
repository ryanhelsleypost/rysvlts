/* RYSVLTS service worker — network-first for the app shell so updates land immediately */
const CACHE = 'rysvlts-v1-2026-09-07-I';
const SHELL = ['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{})); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('message', e=>{ if(e.data==='skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e=>{
  const req=e.request, url=new URL(req.url);
  if(req.method!=='GET') return;
  if(url.origin!==location.origin) return; // firebase, fonts, etc. pass straight through
  const isDoc = req.mode==='navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  if(isDoc){
    // NETWORK-FIRST: always try for the freshest HTML; fall back to cache offline
    e.respondWith(
      fetch(req).then(res=>{ const copy=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)).catch(()=>{}); return res; })
                .catch(()=> caches.match('./index.html').then(h=> h || caches.match('./')))
    );
    return;
  }
  // other same-origin assets: cache-first (fast, they're versioned by build)
  e.respondWith(
    caches.match(req).then(hit=> hit || fetch(req).then(res=>{ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{}); return res; }).catch(()=>hit))
  );
});
