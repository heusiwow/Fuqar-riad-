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
    "revision": "f864d99295cf76136f1ed884fd708fef"
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
    "url": "assets/step_wrist_curl_1795706470043-CDsJ_JFO.jpg",
    "revision": null
  }, {
    "url": "assets/step_tricep_pushdown_1795384187535-C5bJUUfw.jpg",
    "revision": null
  }, {
    "url": "assets/step_tricep_kickback_1795695813908-BnAWkx3b.jpg",
    "revision": null
  }, {
    "url": "assets/step_supported_row_1795706472033-ChxxcRkb.jpg",
    "revision": null
  }, {
    "url": "assets/step_split_squat_1795706327418-ehGcCrjG.jpg",
    "revision": null
  }, {
    "url": "assets/step_smith_squat_1795706405792-CUJFC0FW.jpg",
    "revision": null
  }, {
    "url": "assets/step_smith_ohp_1795706475274-Cle5u6X5.jpg",
    "revision": null
  }, {
    "url": "assets/step_smith_calf_1795695822664-CdhUWbIJ.jpg",
    "revision": null
  }, {
    "url": "assets/step_smith_bench_press_1795622250921-xKixJUUM.jpg",
    "revision": null
  }, {
    "url": "assets/step_seated_db_press_1795622325979-BLmaShJG.jpg",
    "revision": null
  }, {
    "url": "assets/step_seated_calf_1795706474299-C8Lq59b0.jpg",
    "revision": null
  }, {
    "url": "assets/step_seated_cable_row_1795706331201-CgqFTqlQ.jpg",
    "revision": null
  }, {
    "url": "assets/step_romanian_deadlift_1795622205467-Oek6aZ0m.jpg",
    "revision": null
  }, {
    "url": "assets/step_reverse_wrist_curl_1795695955379-Cw-lSmOs.jpg",
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
    "url": "assets/step_preacher_curl_1795706318437-CL8bKRb8.jpg",
    "revision": null
  }, {
    "url": "assets/step_plank_hold_1795706473774-CHV9cid-.jpg",
    "revision": null
  }, {
    "url": "assets/step_pendlay_row_1795622259009-8zcxWfyq.jpg",
    "revision": null
  }, {
    "url": "assets/step_pec_deck_1795617325182-DD5Vi8e2.jpg",
    "revision": null
  }, {
    "url": "assets/step_pallof_press_1795695936454-D9btsZHd.jpg",
    "revision": null
  }, {
    "url": "assets/step_overhead_tricep_1795706513736-2l3dvwKr.jpg",
    "revision": null
  }, {
    "url": "assets/step_overhead_press_1795622200788-BEDqHPxQ.jpg",
    "revision": null
  }, {
    "url": "assets/step_overhead_ez_tricep_1795706317632-DMdp_fPV.jpg",
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
    "url": "assets/step_lateral_raise_1795706321799-RGXuaBJP.jpg",
    "revision": null
  }, {
    "url": "assets/step_lat_pulldown_1795622199207-BUVmGAzW.jpg",
    "revision": null
  }, {
    "url": "assets/step_incline_dumbbell_press_1795384187243-BYmS7aQx.jpg",
    "revision": null
  }, {
    "url": "assets/step_incline_curl_1795646672569-BMEoYC7e.jpg",
    "revision": null
  }, {
    "url": "assets/step_incline_barbell_press_1795622285064-iZR1zHsF.jpg",
    "revision": null
  }, {
    "url": "assets/step_hip_thrust_1795617486495-5rIHAtZV.jpg",
    "revision": null
  }, {
    "url": "assets/step_hammer_curl_1795646674444-VCF9u9eS.jpg",
    "revision": null
  }, {
    "url": "assets/step_goblet_squat_1795695938678-eqKTlu9B.jpg",
    "revision": null
  }, {
    "url": "assets/step_glute_kickback_1795695847249-DrVSgDhT.jpg",
    "revision": null
  }, {
    "url": "assets/step_front_squat_1795695820092-CoQiqb2q.jpg",
    "revision": null
  }, {
    "url": "assets/step_face_pull_1795706323547-D4jj_I7k.jpg",
    "revision": null
  }, {
    "url": "assets/step_ez_skullcrusher_1795706315581-BUQZzhBm.jpg",
    "revision": null
  }, {
    "url": "assets/step_dumbbell_row_1795617484991-B6fZT_AA.jpg",
    "revision": null
  }, {
    "url": "assets/step_dumbbell_rdl_1795695847295-CIHxMPq7.jpg",
    "revision": null
  }, {
    "url": "assets/step_dumbbell_bench_press_1795622286033-bjRssZEO.jpg",
    "revision": null
  }, {
    "url": "assets/step_deadlift_1795706477177-088tf3CP.jpg",
    "revision": null
  }, {
    "url": "assets/step_chin_ups_1795622285647-B370eeuc.jpg",
    "revision": null
  }, {
    "url": "assets/step_chest_machine_1795706477153-N_xiVvVa.jpg",
    "revision": null
  }, {
    "url": "assets/step_chest_dips_1795706470839--DCE22c7.jpg",
    "revision": null
  }, {
    "url": "assets/step_calf_raise_1795617488452-YWwhka46.jpg",
    "revision": null
  }, {
    "url": "assets/step_cable_lateral_raise_1795706314794-P9wrnA4D.jpg",
    "revision": null
  }, {
    "url": "assets/step_cable_fly_1795617483962-CppTzTG1.jpg",
    "revision": null
  }, {
    "url": "assets/step_cable_crunch_1795706325936-k-xk2tr2.jpg",
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
    "url": "assets/step_bench_dips_1795695814431-DbiKYZI6.jpg",
    "revision": null
  }, {
    "url": "assets/step_barbell_squat_1795622203169-DiqJNdpm.jpg",
    "revision": null
  }, {
    "url": "assets/step_barbell_row_1795384188059-C6hQ6ZlG.jpg",
    "revision": null
  }, {
    "url": "assets/step_band_row_1795706333846-QdSYHV2W.jpg",
    "revision": null
  }, {
    "url": "assets/step_band_chest_press_1795622285558-CB7doKjh.jpg",
    "revision": null
  }, {
    "url": "assets/index-xB2XeatJ.css",
    "revision": null
  }, {
    "url": "assets/index-m2vZj1Gw.js",
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
