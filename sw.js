const C="vehiclepulse-v25",F=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;
if(r.mode==="navigate"){e.respondWith(fetch(r.url,{cache:"no-cache"}).then(x=>{const c=x.clone();caches.open(C).then(k=>k.put("index.html",c));return x}).catch(()=>caches.match("index.html")));return}
e.respondWith(caches.match(r).then(m=>{const n=fetch(r).then(x=>{if(x&&(x.ok||x.type==="opaque")){const c=x.clone();caches.open(C).then(k=>k.put(r,c))}return x}).catch(()=>m);return m||n}))});
