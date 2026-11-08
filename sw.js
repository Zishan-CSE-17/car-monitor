const C="vehiclepulse-v33",F=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"],
BASE=new URL("./",self.location).pathname,
// Only the app shell itself is treated as "the page" (also with ?query such as ?source=pwa).
isShell=u=>{const p=new URL(u).pathname;return p===BASE||p===BASE+"index.html"},
// A redirected response (redirected:true) cannot be served to a navigation request, so rebuild it as a plain one.
clean=async x=>x.redirected?new Response(await x.blob(),{status:x.status,statusText:x.statusText,headers:x.headers}):x;
// Pre-cache each file on its own (bypassing the HTTP cache) so one missing icon cannot make the whole install fail.
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>c.add(new Request(u,{cache:"reload"})).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET"||!r.url.startsWith("http"))return;
// Pages: always try the network first, but only keep good (2xx) responses; fall back to the cached app when offline or when the server returns an error.
if(r.mode==="navigate"){if(!isShell(r.url))return;
e.respondWith(fetch(r.url,{cache:"no-cache"}).then(async x=>{if(!x.ok)throw 0;const y=await clean(x),c=y.clone();e.waitUntil(caches.open(C).then(k=>k.put("index.html",c)));return y}).catch(()=>caches.match("index.html").then(m=>m||caches.match("./")).then(m=>m||Response.error())));return}
// Other files: same-origin only (cross-origin requests are left to the browser, so opaque responses never fill the cache).
// Serve from cache instantly and refresh in the background, bypassing the HTTP cache so the refresh is real.
if(new URL(r.url).origin!==self.location.origin)return;
e.respondWith(caches.match(r).then(m=>{const n=fetch(r,{cache:"no-cache"}).then(x=>{if(x&&x.ok&&x.type==="basic"){const c=x.clone();e.waitUntil(caches.open(C).then(k=>k.put(r,c)))}return x}).catch(()=>m||Response.error());if(m)e.waitUntil(n);return m||n}))});
