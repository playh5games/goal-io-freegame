const cacheName = "GmG-Goal io-1.0" + "-20250809T171650";

const contentToCache = [
    "Build/gmg_goal_io.loader.js",
    "Build/gmg_goal_io.framework.js.gz",
    "Build/gmg_goal_io.data.gz",
    "Build/gmg_goal_io.wasm.gz",
    "TemplateData/style.css"

];

const catalogUrl = "StreamingAssets/data/DefaultPackage/BuildinCatalog.json";

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);

 try {
      const res = await fetch(catalogUrl);
      const catalog = await res.json();

      // Trích xuất danh sách file bundle
      const wrappers = catalog.Wrappers || [];
      const bundleFiles = wrappers.map(w => 
        `/StreamingAssets/data/DefaultPackage/${w.FileName}`
      );

      //console.log('[SW] Pre-caching bundle files:', bundleFiles);
      await cache.addAll(bundleFiles);
    } catch (err) {
      console.error('[SW] Failed to preload bundles from catalog:', err);
    }


    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.map(key => {
      if (key !== cacheName) {
        console.log('[SW] Removing old cache:', key);
        return caches.delete(key);
      }
    }))
  ));
});

