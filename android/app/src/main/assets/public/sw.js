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
    "revision": "e8ad1fa93f7da7cea4651944b2f9faef"
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
    "url": "assets/step_split_squat_1795617368909-7my995O0.jpg",
    "revision": null
  }, {
    "url": "assets/step_smith_overhead_press_1795622328689-DU4S0_Su.jpg",
    "revision": null
  }, {
    "url": "assets/step_smith_bench_press_1795622250921-xKixJUUM.jpg",
    "revision": null
  }, {
    "url": "assets/step_seated_db_press_1795622325979-BLmaShJG.jpg",
    "revision": null
  }, {
    "url": "assets/step_seated_cable_row_1795622199411-Cc3pyrkW.jpg",
    "revision": null
  }, {
    "url": "assets/step_romanian_deadlift_1795622205467-Oek6aZ0m.jpg",
    "revision": null
  }, {
    "url": "assets/step_rear_delt_fly_1795622330677-L9DJUbu4.jpg",
    "revision": null
  }, {
    "url": "assets/step_push_ups_1795617484602-DjTmGjRu.jpg",
    "revision": null
  }, {
    "url": "assets/step_pull_ups_1795617328308-DqLZBtdS.jpg",
    "revision": null
  }, {
    "url": "assets/step_preacher_curl_1795617331069-CdX9rJhl.jpg",
    "revision": null
  }, {
    "url": "assets/step_plank_hold_1795617545642-yG60gmnS.jpg",
    "revision": null
  }, {
    "url": "assets/step_pendlay_row_1795622259009-8zcxWfyq.jpg",
    "revision": null
  }, {
    "url": "assets/step_pec_deck_1795617325182-DD5Vi8e2.jpg",
    "revision": null
  }, {
    "url": "assets/step_overhead_tricep_1795617330019-DdQN7oRU.jpg",
    "revision": null
  }, {
    "url": "assets/step_overhead_press_1795622200788-BEDqHPxQ.jpg",
    "revision": null
  }, {
    "url": "assets/step_machine_lateral_raise_1795622329650-Be8C3QaF.jpg",
    "revision": null
  }, {
    "url": "assets/step_leg_raise_1795617427609-CQe_K1T4.jpg",
    "revision": null
  }, {
    "url": "assets/step_leg_press_1795622204292-oJTj0Slz.jpg",
    "revision": null
  }, {
    "url": "assets/step_leg_extension_1795617331618-DNtVIIkN.jpg",
    "revision": null
  }, {
    "url": "assets/step_leg_curl_1795617487952-Cdcp0W1e.jpg",
    "revision": null
  }, {
    "url": "assets/step_lateral_raise_1795622200900-DU7rPxDd.jpg",
    "revision": null
  }, {
    "url": "assets/step_lat_pulldown_1795622199207-BUVmGAzW.jpg",
    "revision": null
  }, {
    "url": "assets/step_incline_dumbbell_press_1795384187243-BYmS7aQx.jpg",
    "revision": null
  }, {
    "url": "assets/step_incline_barbell_press_1795622285064-iZR1zHsF.jpg",
    "revision": null
  }, {
    "url": "assets/step_hip_thrust_1795617486495-5rIHAtZV.jpg",
    "revision": null
  }, {
    "url": "assets/step_face_pull_1795617330693-kmjhqXUJ.jpg",
    "revision": null
  }, {
    "url": "assets/step_dumbbell_row_1795617484991-B6fZT_AA.jpg",
    "revision": null
  }, {
    "url": "assets/step_dumbbell_bench_press_1795622286033-bjRssZEO.jpg",
    "revision": null
  }, {
    "url": "assets/step_conventional_deadlift_1795622205502-DVKCTOeB.jpg",
    "revision": null
  }, {
    "url": "assets/step_chin_ups_1795622285647-B370eeuc.jpg",
    "revision": null
  }, {
    "url": "assets/step_chest_supported_row_1795622256434-CEF-kYTE.jpg",
    "revision": null
  }, {
    "url": "assets/step_chest_press_machine_1795622251831-BfxqkhQI.jpg",
    "revision": null
  }, {
    "url": "assets/step_chest_dips_1795617327691-D77LYsD0.jpg",
    "revision": null
  }, {
    "url": "assets/step_calf_raise_1795617488452-YWwhka46.jpg",
    "revision": null
  }, {
    "url": "assets/step_cable_lateral_raise_1795622328057-DEPCf8v_.jpg",
    "revision": null
  }, {
    "url": "assets/step_cable_fly_1795617483962-CppTzTG1.jpg",
    "revision": null
  }, {
    "url": "assets/step_cable_crunch_1795617489599-DKo0vN2M.jpg",
    "revision": null
  }, {
    "url": "assets/step_cable_bicep_curl_1795622333890-v7pZLIjr.jpg",
    "revision": null
  }, {
    "url": "assets/step_bicep_curl_1795622201415-BGQGwvow.jpg",
    "revision": null
  }, {
    "url": "assets/step_bench_press_1795617482435-B7VED0Wa.jpg",
    "revision": null
  }, {
    "url": "assets/step_barbell_squat_1795622203169-DiqJNdpm.jpg",
    "revision": null
  }, {
    "url": "assets/step_barbell_row_1795384188059-C6hQ6ZlG.jpg",
    "revision": null
  }, {
    "url": "assets/step_band_row_1795622285747-1ZJqgwHa.jpg",
    "revision": null
  }, {
    "url": "assets/step_band_chest_press_1795622285558-CB7doKjh.jpg",
    "revision": null
  }, {
    "url": "assets/index-CsJNQQOm.css",
    "revision": null
  }, {
    "url": "assets/index-Cs7XQ67-.js",
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
    "url": "assets/aistudio/Screenshot_____-__-__-__-__-__-____com.android.chrome_e4fbc6a6.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_____-__-__-__-__-__-____com.android.chrome_d1cffce3.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_____-__-__-__-__-__-____com.android.chrome_9960b04d.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_____-__-__-__-__-__-____com.android.chrome_860b2033.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_____-__-__-__-__-__-____com.android.chrome_3b0a2a7c.jpg",
    "revision": null
  }, {
    "url": "assets/aistudio/Screenshot_____-__-__-__-__-__-____com.android.chrome_37e0a693.jpg",
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
