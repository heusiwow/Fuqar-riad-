/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-81e8ac41'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-maskable-512x512.png",
    "revision": "084e50cbb68f8ac2101647f85e6b176c"
  }, {
    "url": "pwa-512x512.png",
    "revision": "b934a46541d102da05130a4c1984334d"
  }, {
    "url": "pwa-192x192.png",
    "revision": "5312dbbbff8fad9a368952d1dace1df6"
  }, {
    "url": "index.html",
    "revision": "feb7c9ddb919cb59350d16b918c467ed"
  }, {
    "url": "icon.svg",
    "revision": "6696314d9d5e668242aa1750755fd323"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "0c9eb8c62b1ff7915b17ec72414b402a"
  }, {
    "url": "assets/workbox-window.prod.es5-Bd17z0YL.js",
    "revision": null
  }, {
    "url": "assets/step_tricep_pushdown_1795384187535-C5bJUUfw.jpg",
    "revision": null
  }, {
    "url": "assets/step_seated_cable_row_1795384188981-CLNzSvlv.jpg",
    "revision": null
  }, {
    "url": "assets/step_romanian_deadlift_1795384188301-eS4UdvNJ.jpg",
    "revision": null
  }, {
    "url": "assets/step_overhead_press_1795384188573-DZcHHWaM.jpg",
    "revision": null
  }, {
    "url": "assets/step_leg_press_1795384187287-LiySHXMB.jpg",
    "revision": null
  }, {
    "url": "assets/step_lateral_raise_1795384188820-B9ajnczV.jpg",
    "revision": null
  }, {
    "url": "assets/step_lat_pulldown_1795384188743-D7ZzNDHh.jpg",
    "revision": null
  }, {
    "url": "assets/step_incline_dumbbell_press_1795384187243-BYmS7aQx.jpg",
    "revision": null
  }, {
    "url": "assets/step_conventional_deadlift_1795384189106-BY1qi-cY.jpg",
    "revision": null
  }, {
    "url": "assets/step_bicep_curl_1795384189254-DAHWE6cP.jpg",
    "revision": null
  }, {
    "url": "assets/step_barbell_squat_1795384188660-D70AdbpJ.jpg",
    "revision": null
  }, {
    "url": "assets/step_barbell_row_1795384188059-C6hQ6ZlG.jpg",
    "revision": null
  }, {
    "url": "assets/index-k080tfwD.css",
    "revision": null
  }, {
    "url": "assets/index-DBTH_-Tp.js",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_____-__-__-__-__-__-____com.github.android_d9e9831b.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_____-__-__-__-__-__-____com.github.android_ced75d5b.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_____-__-__-__-__-__-____com.github.android_54d7c092.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_____-__-__-__-__-__-____com.github.android_179582a4.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_____-__-__-__-__-__-____com.apexfitness.app_63d175d6.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_____-__-__-__-__-__-____com.android.chrome_860b2033.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_____-__-__-__-__-__-____com.android.chrome_3b0a2a7c.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/1795382374541_efaff05f.mp4",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "0c9eb8c62b1ff7915b17ec72414b402a"
  }, {
    "url": "icon.svg",
    "revision": "6696314d9d5e668242aa1750755fd323"
  }, {
    "url": "pwa-192x192.png",
    "revision": "5312dbbbff8fad9a368952d1dace1df6"
  }, {
    "url": "pwa-512x512.png",
    "revision": "b934a46541d102da05130a4c1984334d"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "084e50cbb68f8ac2101647f85e6b176c"
  }, {
    "url": "assets/aistudio/1795382374541_efaff05f.mp4",
    "revision": "5ebf34edf9464818b8c4d61f43895168"
  }, {
    "url": "manifest.webmanifest",
    "revision": "484e713548f54e0add97c78dacee8d4d"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    denylist: [/^\/api\//, /^\/downloads\//, /\.apk$/i]
  }));
  workbox.registerRoute(/\/assets\/.*\.(?:mp4|webm)$/i, new workbox.CacheFirst({
    "cacheName": "apex-exercise-videos-v1",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 60,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    }), new workbox.RangeRequestsPlugin()]
  }), 'GET');
  workbox.registerRoute(/\/assets\/.*\.(?:png|jpg|jpeg|webp|svg)$/i, new workbox.CacheFirst({
    "cacheName": "apex-exercise-images-v1",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 120,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.StaleWhileRevalidate({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 20,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
