"""Check the app installs for offline use and picks up new versions."""
import subprocess
import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from phone import DIST, Phone, serve, sync_playwright  # noqa: E402

ok = True


def check(name, cond, detail=""):
    global ok
    ok &= bool(cond)
    print(("PASS " if cond else "FAIL ") + name + (f"  [{detail}]" if detail and not cond else ""))


subprocess.run([sys.executable, str(__import__("pathlib").Path(__file__).resolve().parent / "build.py")], check=True, capture_output=True)
srv = serve()
with sync_playwright() as p:
    ph = Phone(p, sw=True).open("#/")
    pg = ph.page
    pg.wait_for_function("navigator.serviceWorker.controller !== null", timeout=10000)
    pg.wait_for_timeout(500)
    check("first visit installs the offline copy", "works offline" in pg.inner_text("#toast"), pg.inner_text("#toast"))

    ph.ctx.set_offline(True)
    pg.reload()
    pg.wait_for_timeout(400)
    check("opens with no internet", "Next up" in pg.inner_text("#view"))
    pg.goto(ph.url + "#/w/legsA")
    pg.wait_for_timeout(300)
    check("workout page works offline", "Machine squat" in pg.inner_text("#view"))
    pg.click('[data-slot="legsA.sldl"] .srow[data-i="0"] .tick')
    check("logging works offline", ph.state()["drafts"]["legsA"]["rows"]["legsA.sldl"][0]["done"])
    icon = pg.evaluate("fetch('apple-touch-icon.png').then(r => r.status)")
    check("icon served offline", icon == 200, icon)

    # publish a new version while the phone is offline, then come back online
    html = (DIST / "index.html").read_text()
    (DIST / "index.html").write_text(html.replace("<title>Lift Log</title>", "<title>Lift Log</title><meta name='test-version' content='2'>"))
    sw = (DIST / "sw.js").read_text()
    (DIST / "sw.js").write_text(sw.replace("const VERSION = '", "const VERSION = 'v2-"))
    ph.ctx.set_offline(False)
    pg.goto(ph.url + "#/")
    pg.wait_for_timeout(2500)
    check("tells you a new version is ready", "new version" in pg.inner_text("#toast"), pg.inner_text("#toast"))
    if pg.is_visible('#toast [data-a="toastAction"]'):
        pg.click('#toast [data-a="toastAction"]')
        pg.wait_for_timeout(800)
    check("reload picks up the new version", pg.evaluate("!!document.querySelector('meta[name=test-version]')"))
    check("data kept through the update", ph.state()["drafts"]["legsA"]["rows"]["legsA.sldl"][0]["done"])
    print("\n".join(ph.errors) or "no console errors")
    ph.close()
srv.shutdown()
subprocess.run([sys.executable, str(__import__("pathlib").Path(__file__).resolve().parent / "build.py")], check=True, capture_output=True)
print("ALL PASS" if ok else "SOME FAILED")
