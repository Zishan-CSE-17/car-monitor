const C="vehiclepulse-v32",F=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET"||!r.url.startsWith("http"))return;
// Pages: always try the network first, but only keep good (2xx) responses; fall back to the cached app when offline or when the server returns an error.
if(r.mode==="navigate"){e.respondWith(fetch(r.url,{cache:"no-cache"}).then(x=>{if(!x.ok)throw 0;const c=x.clone();caches.open(C).then(k=>k.put("index.html",c));return x}).catch(()=>caches.match("index.html").then(m=>m||caches.match("./")).then(m=>m||Response.error())));return}
// Other files: serve from cache instantly, refresh in the background.
e.respondWith(caches.match(r).then(m=>{const n=fetch(r).then(x=>{if(x&&(x.ok||x.type==="opaque")){const c=x.clone();caches.open(C).then(k=>k.put(r,c))}return x}).catch(()=>m||Response.error());if(m)e.waitUntil(n);return m||n}))});
