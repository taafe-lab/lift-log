"""Build the app into the repository root, which GitHub Pages serves.

Writes index.html (CSS, JS and data inlined), sw.js, manifest.webmanifest and the icons.
Only those files are touched; source/ and the docs are left alone.

    python3 source/tools/build.py
"""
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw

SOURCE = Path(__file__).resolve().parent.parent      # source/
SRC = SOURCE / "src"
OUT = SOURCE.parent                                  # repository root
APP_VERSION = "1.0"                                  # shown in Settings; bump for notable releases

css = (SRC / "app.css").read_text()
js = "\n".join([
    (SRC / "program.js").read_text(),
    (SRC / "anatomy.js").read_text(),
    "const BASE = " + (SRC / "baseline.json").read_text() + ";",
    (SRC / "app.js").read_text().replace("__VERSION__", APP_VERSION),
])

html = f"""<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Lift Log">
<meta name="theme-color" content="#1C2338">
<meta name="format-detection" content="telephone=no">
<title>Lift Log</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<style>
{css}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<linearGradient id="aHot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF5D60"/><stop offset="1" stop-color="#D9272B"/></linearGradient>
</defs></svg>
<div id="view"></div>
<nav class="tabbar" aria-label="Main">
  <a href="#/" data-page="home"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11"/></svg>Train</a>
  <a href="#/progress" data-page="progress"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v18h18M7 15l4-4 3 3 5-6"/></svg>Progress</a>
  <a href="#/settings" data-page="settings"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>Settings</a>
</nav>
<div id="timer" aria-live="polite"></div>
<div id="toast" role="status" aria-live="polite"></div>
<div id="sheet"></div>
<input type="file" id="importFile" class="sr" tabindex="-1">
<script>
{js}
</script>
</body>
</html>
"""


def make_icon(size):
    s = 1024
    img = Image.new("RGB", (s, s), "#1C2338")
    d = ImageDraw.Draw(img)
    # three bars rising left to right: push, pull, legs
    bars = [("#F26B1D", 0.46), ("#2F6BFF", 0.62), ("#0FA968", 0.78)]
    bw, gap = 176, 64
    total = 3 * bw + 2 * gap
    x0 = (s - total) // 2
    base = 790
    for i, (col, h) in enumerate(bars):
        x = x0 + i * (bw + gap)
        top = base - int(h * 760)
        d.rounded_rectangle([x, top, x + bw, base], radius=bw // 2, fill=col)
    d.rounded_rectangle([x0 - 10, base + 56, x0 + total + 10, base + 96], radius=20, fill="#FFFFFF")
    return img.resize((size, size), Image.LANCZOS)


(OUT / "index.html").write_text(html)
make_icon(180).save(OUT / "apple-touch-icon.png")
make_icon(192).save(OUT / "icon-192.png")
make_icon(512).save(OUT / "icon-512.png")

manifest = {
    "name": "Lift Log",
    "short_name": "Lift Log",
    "description": "Push, pull and legs training log",
    "start_url": "./",
    "scope": "./",
    "display": "standalone",
    "orientation": "portrait",
    "background_color": "#1C2338",
    "theme_color": "#1C2338",
    "icons": [
        {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ],
}
(OUT / "manifest.webmanifest").write_text(json.dumps(manifest, indent=2))

# The offline worker's VERSION is a hash of the built files: any change to the app gives a new
# VERSION, which is what makes phones offer "A new version of the app is ready".
BUILT = ["apple-touch-icon.png", "icon-192.png", "icon-512.png", "index.html", "manifest.webmanifest"]
digest = hashlib.sha256()
for name in BUILT:
    digest.update((OUT / name).read_bytes())
version = digest.hexdigest()[:12]

sw = f"""/* Lift Log offline support. Bumping VERSION makes phones fetch the new app. */
const VERSION = '{version}';
const CACHE = 'lift-log-' + VERSION;
const ASSETS = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS.map(url => new Request(url, {{ cache: 'reload' }}))))
      .then(() => self.skipWaiting())
  );
}});

self.addEventListener('activate', event => {{
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('lift-log-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
}});

self.addEventListener('fetch', event => {{
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {{
    event.respondWith(caches.match('./index.html').then(hit => hit || fetch(req)));
    return;
  }}
  event.respondWith(
    caches.match(req, {{ ignoreSearch: true }}).then(hit => hit || fetch(req).then(res => {{
      if (res.ok) {{ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }}
      return res;
    }}))
  );
}});
"""
(OUT / "sw.js").write_text(sw)

for name in BUILT + ["sw.js"]:
    print(f"{name:24} {(OUT / name).stat().st_size:>8} bytes")
print("version", version)
