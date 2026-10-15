"""Screenshot a local HTML file with Chromium. Usage: shot.py file.html out.png [width] [height] [scale]"""
import sys
from playwright.sync_api import sync_playwright

src, out = sys.argv[1], sys.argv[2]
w = int(sys.argv[3]) if len(sys.argv) > 3 else 900
h = int(sys.argv[4]) if len(sys.argv) > 4 else 960
scale = float(sys.argv[5]) if len(sys.argv) > 5 else 2
with sync_playwright() as p:
    b = p.chromium.launch(args=["--allow-file-access-from-files"])
    pg = b.new_page(viewport={"width": w, "height": h}, device_scale_factor=scale)
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
    pg.goto("file://" + src)
    pg.wait_for_timeout(300)
    pg.screenshot(path=out, full_page=True)
    b.close()
for e in errors:
    print(e)
print("saved", out)
