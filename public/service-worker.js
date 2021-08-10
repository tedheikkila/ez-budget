// data goes here when there is no Internet connection
const CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

// array of all urls that our PWA should cache
const urlsToCache = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.json",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// inits when the user installs app on their machine as a standalone PWA
self.addEventListener("install", function(event) {
  // perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// tells the service worker to listen for any events where a app call is made
self.addEventListener("fetch", function(event) {
  // all fetch routes have /api/ prefix
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {

        // attempt to fetch normally (internet/data)
        return fetch(event.request)
          .then(response => {
            // if response was good, store in cache route name and the data
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })

          // runs if the fetch fails (no internet)
          .catch(err => {
            // network request failed, try to get it from the cache
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  // block handles all home page calls
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          // return the cached home page for all requests for html pages
          return caches.match("/");
        }
      });
    })
  );
});