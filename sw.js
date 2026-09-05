/* In Rotation service worker */
const CACHE = 'rysvlts-v1-2026-09-05-E';
const SHELL = ['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{})); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if(e.request.method!=='GET') return;
  // never cache cross-origin (firebase, fonts handled by browser) or no-store update checks
  if(url.origin!==location.origin || url.search.includes('u=') || url.search.includes('v=')){ return; }
  e.respondWith(
    caches.match(e.request).then(hit=> hit || fetch(e.request).then(res=>{
      const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{}); return res;
    }).catch(()=>hit))
  );
});
