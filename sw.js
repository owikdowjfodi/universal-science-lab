const version = "98f1b829b062b3b8";
const buildFiles = ["KaTeX_AMS-Regular-BQhdFMY1.woff2","KaTeX_AMS-Regular-DMm9YOAa.woff","KaTeX_AMS-Regular-DRggAlZN.ttf","KaTeX_Caligraphic-Bold-ATXxdsX0.ttf","KaTeX_Caligraphic-Bold-BEiXGLvX.woff","KaTeX_Caligraphic-Bold-Dq_IR9rO.woff2","KaTeX_Caligraphic-Regular-CTRA-rTL.woff","KaTeX_Caligraphic-Regular-Di6jR-x-.woff2","KaTeX_Caligraphic-Regular-wX97UBjC.ttf","KaTeX_Fraktur-Bold-BdnERNNW.ttf","KaTeX_Fraktur-Bold-BsDP51OF.woff","KaTeX_Fraktur-Bold-CL6g_b3V.woff2","KaTeX_Fraktur-Regular-CB_wures.ttf","KaTeX_Fraktur-Regular-CTYiF6lA.woff2","KaTeX_Fraktur-Regular-Dxdc4cR9.woff","KaTeX_Main-Bold-Cx986IdX.woff2","KaTeX_Main-Bold-Jm3AIy58.woff","KaTeX_Main-Bold-waoOVXN0.ttf","KaTeX_Main-BoldItalic-DxDJ3AOS.woff2","KaTeX_Main-BoldItalic-DzxPMmG6.ttf","KaTeX_Main-BoldItalic-SpSLRI95.woff","KaTeX_Main-Italic-3WenGoN9.ttf","KaTeX_Main-Italic-BMLOBm91.woff","KaTeX_Main-Italic-NWA7e6Wa.woff2","KaTeX_Main-Regular-B22Nviop.woff2","KaTeX_Main-Regular-Dr94JaBh.woff","KaTeX_Main-Regular-ypZvNtVU.ttf","KaTeX_Math-BoldItalic-B3XSjfu4.ttf","KaTeX_Math-BoldItalic-CZnvNsCZ.woff2","KaTeX_Math-BoldItalic-iY-2wyZ7.woff","KaTeX_Math-Italic-DA0__PXp.woff","KaTeX_Math-Italic-flOr_0UB.ttf","KaTeX_Math-Italic-t53AETM-.woff2","KaTeX_SansSerif-Bold-CFMepnvq.ttf","KaTeX_SansSerif-Bold-D1sUS0GD.woff2","KaTeX_SansSerif-Bold-DbIhKOiC.woff","KaTeX_SansSerif-Italic-C3H0VqGB.woff2","KaTeX_SansSerif-Italic-DN2j7dab.woff","KaTeX_SansSerif-Italic-YYjJ1zSn.ttf","KaTeX_SansSerif-Regular-BNo7hRIc.ttf","KaTeX_SansSerif-Regular-CS6fqUqJ.woff","KaTeX_SansSerif-Regular-DDBCnlJ7.woff2","KaTeX_Script-Regular-C5JkGWo-.ttf","KaTeX_Script-Regular-D3wIWfF6.woff2","KaTeX_Script-Regular-D5yQViql.woff","KaTeX_Size1-Regular-C195tn64.woff","KaTeX_Size1-Regular-Dbsnue_I.ttf","KaTeX_Size1-Regular-mCD8mA8B.woff2","KaTeX_Size2-Regular-B7gKUWhC.ttf","KaTeX_Size2-Regular-Dy4dx90m.woff2","KaTeX_Size2-Regular-oD1tc_U0.woff","KaTeX_Size3-Regular-CTq5MqoE.woff","KaTeX_Size3-Regular-DgpXs0kz.ttf","KaTeX_Size4-Regular-BF-4gkZK.woff","KaTeX_Size4-Regular-DWFBv043.ttf","KaTeX_Size4-Regular-Dl5lxZxV.woff2","KaTeX_Typewriter-Regular-C0xS9mPB.woff","KaTeX_Typewriter-Regular-CO6r4hn1.woff2","KaTeX_Typewriter-Regular-D3Ib7_Hf.ttf","THIRD-PARTY-NOTICES.txt","ThreeScene-79zyzL73.js","icon-192.png","icon-512.png","index-CKfKU30V.css","index-CPm5PXXS.js","index.html","manifest.webmanifest","run.worker-Rni2uqs3.js"];
const scope = self.registration.scope;
const prefix = 'universal-science-lab:' + scope + ':';
const cacheName = prefix + version;
const urls = buildFiles.map(path => new URL(path, scope).href);
const allowedUrls = new Set(urls);
const root = new URL('index.html', scope).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const opened = await caches.open(cacheName);
    try {
      for (const url of urls) {
        const response = await fetch(new Request(url, { cache: 'reload' }));
        if (!response.ok || response.redirected) throw Error('Could not precache ' + url);
        await opened.put(url, response);
      }
    } catch (error) {
      await caches.delete(cacheName);
      throw error;
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE') {
    event.waitUntil(self.skipWaiting());
  }
  if (event.data?.type === 'CACHE_STATUS' && event.ports[0]) {
    event.waitUntil((async () => {
      try {
        const cache = await caches.open(cacheName);
        const entries = await cache.keys();
        const found = new Set(entries.map(request => request.url));
        event.ports[0].postMessage({ ready: urls.every(url => found.has(url)), version });
      } catch {
        event.ports[0].postMessage({ ready: false });
      }
    })());
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(scope)) return;
  const url = new URL(request.url);
  if (request.mode === 'navigate') {
    if (url.pathname !== new URL(scope).pathname && url.pathname !== new URL(root).pathname) return;
    event.respondWith((async () => {
      const cached = await (await caches.open(cacheName)).match(root);
      return cached || fetch(request);
    })());
    return;
  }
  if (!allowedUrls.has(request.url) && !url.pathname.startsWith(new URL('assets/', scope).pathname)) return;
  event.respondWith((async () => {
    const current = await (await caches.open(cacheName)).match(request);
    if (current) return current;
    // A tab open during an update may still request an older hashed chunk.
    for (const previous of (await caches.keys()).filter(name => name !== cacheName && name.startsWith(prefix))) {
      const response = await (await caches.open(previous)).match(request);
      if (response) return response;
    }
    return fetch(request);
  })());
});

