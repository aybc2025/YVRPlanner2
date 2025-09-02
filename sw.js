const CACHE = 'trip-planner-v1';
const ASSETS = [
'./', './index.html','./styles.css','./app.js','./db.js','./dnd.js','./import_export.js','./manifest.webmanifest',
'./icons/icon-192.png','./icons/icon-512.png'
];
self.addEventListener('install', (e)=>{
e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', (e)=>{
e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE?caches.delete(k):null))));
});
self.addEventListener('fetch', (e)=>{
e.respondWith(
caches.match(e.request).then(resp=> resp || fetch(e.request).then(net=>{
const copy = net.clone();
if(e.request.method==='GET' && e.request.url.startsWith(self.location.origin)){
caches.open(CACHE).then(c=>c.put(e.request, copy));
}
return net;
}).catch(()=> caches.match('./index.html')))
);
});
