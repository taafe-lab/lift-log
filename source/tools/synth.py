"""Make a realistic three-month training history for testing the progress screens."""
import json
import random
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def fresh_state():
    """Ask the real app code for its fresh state, so the test data matches exactly."""
    js = "\n".join([
        (ROOT / "src" / "program.js").read_text(),
        "const BASE = " + (ROOT / "src" / "baseline.json").read_text() + ";",
        (ROOT / "src" / "app.js").read_text().split("/* ---------------- state ---------------- */")[1].split("function migrate")[0],
        "process.stdout.write(JSON.stringify(freshState()));",
    ])
    out = subprocess.run(["node", "-e", "const document={};" + js], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def make(months=3, seed=7, end=datetime(2026, 10, 14, 19, 0)):
    random.seed(seed)
    base = json.loads((ROOT / "src" / "baseline.json").read_text())
    st = fresh_state()
    order = ["pushA", "pullA", "legsA", "pushB", "pullB", "legsB"]
    day = end - timedelta(days=30 * months)
    i = 0
    history = []
    while day < end:
        wid = order[i % 6]
        frac = (day - (end - timedelta(days=30 * months))).days / (30 * months)
        items = []
        slots = st["plan"]["workouts"][wid] + (st["plan"]["abs"] if wid[:4] in ("push", "pull") and random.random() < 0.6 else [])
        for sid in slots:
            sl = st["plan"]["slots"][sid]
            ex = sl["opts"][0]["ex"]
            last = base["last"].get(sid, {}).get(ex)
            if not last:
                continue
            sets = []
            for k, (kg, reps) in enumerate(last["w"]):
                if kg is None:
                    continue
                trend = 1 + frac * random.uniform(0.0, 0.07) - (0.03 if wid == "legsB" and frac > 0.66 else 0)
                new_kg = round(kg * trend / 2.5) * 2.5 if kg > 0 else 0
                new_reps = max(4, reps + random.choice([-1, 0, 0, 1]))
                sets.append({"kg": new_kg, "reps": new_reps})
            if sets:
                items.append({"s": sid, "e": ex, "sets": sets})
        start = int(day.timestamp() * 1000)
        history.append({"id": f"t{i}", "w": wid, "start": start, "end": start + random.randint(55, 85) * 60000, "items": items})
        i += 1
        day += timedelta(days=random.choice([1, 1, 2]), hours=random.choice([0, 1, -1]))
    st["history"] = history
    st["backupAt"] = int((end - timedelta(days=20)).timestamp() * 1000)
    return st


if __name__ == "__main__":
    s = make()
    print(len(s["history"]), "sessions from", datetime.fromtimestamp(s["history"][0]["end"] / 1000), "to", datetime.fromtimestamp(s["history"][-1]["end"] / 1000))
