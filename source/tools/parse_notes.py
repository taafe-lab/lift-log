"""Parse the owner's cleaned notes into starting data for the app.

Output: src/baseline.json with
  last[slot][exercise]  -> list per set row of [kg, reps] (most recent entry), None if unknown
  pb[exercise]          -> [kg, reps] heaviest set (ties broken by reps)
  score[exercise]       -> strength score of the best set from the most recent entries
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from notes_data import NOTES  # noqa: E402


def parse_line(line):
    """'100kg 10, 9, 90kg 8' -> [(100, 10), (100, 9), (90, 8)]"""
    if line is None:
        return None
    entries = []
    kg = None
    drop = line.startswith("DROP")
    if drop:
        line = line[4:].strip()
    for tok in [t.strip() for t in line.split(",") if t.strip()]:
        m = re.fullmatch(r"(?:(BW|\?|[\d.]+)\s*(?:kg)?\s+)?(\d+)", tok)
        if not m:
            raise ValueError(f"Can't parse token {tok!r} in {line!r}")
        w, reps = m.group(1), int(m.group(2))
        if w is not None:
            kg = 0.0 if w == "BW" else (None if w == "?" else float(w))
        entries.append((kg, reps))
    return {"drop": drop, "entries": entries}


def score(kg, reps):
    if kg is None:
        return 0
    return kg * (1 + reps / 30) if kg > 0 else reps


def better(a, b):
    """Is set a better than set b (heavier, or same weight more reps)?"""
    if b is None:
        return True
    if a[0] != b[0]:
        return a[0] > b[0]
    return a[1] > b[1]


def num(x):
    if x is None:
        return None
    return int(x) if float(x).is_integer() else x


last, pb, base_score, sessions = {}, {}, {}, {}
report = []
for slot, options in NOTES.items():
    last[slot] = {}
    for ex, set_lines in options.items():
        rows, work, drops = [], [], []
        for line in set_lines:
            parsed = parse_line(line)
            if parsed is None or not parsed["entries"]:
                rows.append(None)
                drops.append([None, None])
                continue
            kg, reps = parsed["entries"][-1]
            rows.append([num(kg), reps])
            (drops if parsed["drop"] else work).append([num(kg), reps])
            if not parsed["drop"]:
                sessions[ex] = max(sessions.get(ex, 0), len(parsed["entries"]))
                for e in parsed["entries"]:
                    if e[0] is not None and better(e, pb.get(ex)):
                        pb[ex] = e
                # baseline score: best of the most recent working sets
                s = score(kg, reps)
                base_score[ex] = max(base_score.get(ex, 0), s)
        last[slot][ex] = {"w": work, "d": drops} if drops else {"w": work}
        fmt = " · ".join(
            "?" if r is None else (f"{'BW' if r[0] == 0 else ('?' if r[0] is None else r[0])}×{r[1]}")
            for r in rows
        )
        report.append(f"{slot:32} {ex:30} last: {fmt}")

out = {
    "last": last,
    "pb": {k: [num(v[0]), v[1]] for k, v in pb.items()},
    "score": {k: round(v, 2) for k, v in base_score.items()},
    "sessions": sessions,
}
dest = Path(__file__).parent.parent / "src" / "baseline.json"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps(out, separators=(",", ":")))

print("\n".join(report))
print()
for k, v in sorted(out["pb"].items()):
    w = "BW" if v[0] == 0 else v[0]
    print(f"PB {k:30} {w} x {v[1]}   score {out['score'].get(k)}  sessions {sessions.get(k)}")
print("\nwrote", dest, dest.stat().st_size, "bytes")
