"""Make a three-screen preview image for the owner: home, a workout mid-session, progress (example data)."""
import json
import subprocess
import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from phone import OUT, Phone, serve, sync_playwright  # noqa: E402
from synth import make  # noqa: E402

srv = serve()
with sync_playwright() as p:
    ph = Phone(p, scale=2).open("#/")
    pg = ph.page
    pg.evaluate("document.getElementById('toast').classList.remove('show')")
    ph.shot("p1_home")
    ph.open("#/w/pushA")
    card = '[data-slot="pushA.inclinePress"]'
    pg.click(f'{card} .srow[data-i="0"] .tick')
    pg.fill(f'{card} .srow[data-i="1"] .kg', "102.5")
    pg.fill(f'{card} .srow[data-i="1"] .reps', "9")
    pg.click(f'{card} .srow[data-i="1"] .tick')
    pg.evaluate("S.timer.end = Date.now() + 74000; tickTimer();")
    pg.evaluate("document.getElementById('toast').classList.remove('show')")
    pg.evaluate("window.scrollTo(0, 150)")
    pg.wait_for_timeout(300)
    ph.shot("p2_workout")
    ph.close()
    ph = Phone(p, scale=2).open("#/progress", state=json.dumps(make()))
    ph.page.wait_for_timeout(300)
    ph.shot("p3_progress")
    ph.close()
srv.shutdown()
out = OUT / "preview.png"
subprocess.run(["montage", str(OUT / "p1_home.png"), str(OUT / "p2_workout.png"), str(OUT / "p3_progress.png"),
                "-tile", "3x1", "-geometry", "660x1434+18+0", "-background", "#E4E7EE", str(out)], check=True)
subprocess.run(["convert", str(out), "-bordercolor", "#E4E7EE", "-border", "0x18", "-quality", "88", str(OUT / "lift-log-preview.jpg")], check=True)
print(OUT / "lift-log-preview.jpg")
