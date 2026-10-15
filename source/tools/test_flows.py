"""End-to-end checks of the main flows in an iPhone-sized browser."""
import json
import sys
import time

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from phone import Phone, serve, sync_playwright  # noqa: E402

results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (f"  [{detail}]" if detail and not cond else ""))


srv = serve()
with sync_playwright() as p:
    ph = Phone(p).open("#/w/pushA")
    pg = ph.page
    pg.evaluate("document.getElementById('toast').classList.remove('show')")

    card = '[data-slot="pushA.inclinePress"]'
    # 1. tick set 1 with empty inputs -> uses last time's numbers
    pg.click(f'{card} .srow[data-i="0"] .tick')
    pg.wait_for_timeout(150)
    st = ph.state()
    row = st["drafts"]["pushA"]["rows"]["pushA.inclinePress"][0]
    check("tick with empty inputs uses last time's numbers", row == {"kg": "100", "reps": "10", "done": True}, row)
    check("rest timer starts after a tick", pg.is_visible("#timer.show") and st["timer"] and st["timer"]["dur"] == 90)
    t1 = pg.inner_text("#tmTime")
    pg.click('[data-a="tmAdd"]')
    t2 = pg.inner_text("#tmTime")
    check("+15 s adds time", int(t2.split(":")[0]) * 60 + int(t2.split(":")[1]) > int(t1.split(":")[0]) * 60 + int(t1.split(":")[1]) + 10, f"{t1} -> {t2}")
    ph.shot("10_after_tick")

    # 2. type a heavier set -> PB
    pg.fill(f'{card} .srow[data-i="1"] .kg', "102.5")
    pg.fill(f'{card} .srow[data-i="1"] .reps', "9")
    pg.click(f'{card} .srow[data-i="1"] .tick')
    pg.wait_for_timeout(150)
    check("PB badge shows on a set that beats the PB", pg.is_visible(f'{card} .srow[data-i="1"].pbrow'))
    check("PB toast appears", "New PB" in pg.inner_text("#toast"), pg.inner_text("#toast"))
    check("header progress counts ticked sets", pg.inner_text("#wkCount") == "2 of 21 sets", pg.inner_text("#wkCount"))
    ph.shot("11_pb")

    # 3. add a set
    pg.click(f'{card} [data-a="addSet"]')
    n_rows = pg.locator(f'{card} .srow:not(.hdr)').count()
    check("+ Set adds a row", n_rows == 4, n_rows)
    check("plan keeps the extra set", ph.state()["plan"]["slots"]["pushA.inclinePress"]["sets"] == ["w"] * 4)
    check("new set placeholder copies last set", pg.get_attribute(f'{card} .srow[data-i="3"] .kg', "placeholder") == "100")

    # 4. edit mode -> remove set 4 with confirm + undo
    pg.click('[data-a="edit"]')
    ph.shot("12_edit_mode")
    pg.click(f'{card} .srow[data-i="3"] .rm')
    check("removing a set asks first", pg.is_visible("#sheet.open") and "Remove set 4" in pg.inner_text("#sheet"))
    ph.shot("13_confirm_remove")
    pg.click('[data-a="confirmOk"]')
    pg.wait_for_timeout(100)
    check("set removed after confirming", ph.state()["plan"]["slots"]["pushA.inclinePress"]["sets"] == ["w"] * 3)
    check("undo offered", "Undo" in pg.inner_text("#toast"))
    pg.click('#toast [data-a="undo"]')
    pg.wait_for_timeout(100)
    check("undo brings the set back", ph.state()["plan"]["slots"]["pushA.inclinePress"]["sets"] == ["w"] * 4)
    # cancel path
    pg.click(f'{card} .srow[data-i="3"] .rm')
    pg.click('#sheet [data-a="sheetClose"].btn')
    check("cancel keeps the set", ph.state()["plan"]["slots"]["pushA.inclinePress"]["sets"] == ["w"] * 4)
    pg.click('[data-a="edit"]')  # leave edit mode
    check("ticked sets survive edit mode", ph.state()["drafts"]["pushA"]["rows"]["pushA.inclinePress"][1]["done"])

    # 5. switching option with ticked sets asks first
    pg.click(f'{card} .opt[data-o="1"]')
    check("switching option with ticked sets asks first", pg.is_visible("#sheet.open") and "Switch to Machine" in pg.inner_text("#sheet"))
    pg.click('#sheet [data-a="sheetClose"].btn')
    check("option unchanged after cancel", ph.state()["sel"].get("pushA.inclinePress", 0) == 0)

    # 6. switch option on an untouched exercise -> placeholders change
    fly = '[data-slot="pushA.inclineFly"]'
    pg.click(f'{fly} .opt[data-o="1"]')
    check("dumbbell option shows its own last numbers", pg.get_attribute(f'{fly} .srow[data-i="0"] .kg', "placeholder") == "27.5")
    check("dumbbell option shows its own PB", "27.5 kg × 12" in pg.inner_text(f"{fly} .pb"))

    # 7. notes save
    pg.fill(f'{card} .note', "30° incline on the Smith. Felt strong")
    pg.wait_for_timeout(400)
    check("notes are saved", ph.state()["notes"]["pushA.inclinePress"].endswith("Felt strong"))

    # 8. abs section
    pg.click('[data-a="absToggle"]')
    pg.wait_for_timeout(200)
    check("abs open on push day", pg.locator('[data-slot^="abs."]').count() == 4)
    pg.click('[data-slot="abs.cableCrunch"] .srow[data-i="0"] .tick')
    ph.shot("14_abs")

    # 9. reload mid-workout keeps everything
    pg.reload(); pg.wait_for_timeout(200)
    check("ticks survive a reload", pg.is_visible(f'{card} .srow[data-i="1"].done'))
    check("typed values survive a reload", pg.input_value(f'{card} .srow[data-i="1"] .kg') == "102.5")
    check("timer survives a reload", pg.is_visible("#timer.show"))

    # 10. finish
    pg.click('[data-a="tmSkip"]')
    pg.click('[data-a="finish"]')
    check("finish asks first and lists the PB", "New PB" in pg.inner_text("#sheet"), pg.inner_text("#sheet"))
    ph.shot("15_finish_sheet")
    pg.click('[data-a="finishOk"]')
    pg.wait_for_timeout(250)
    st = ph.state()
    check("workout saved to history", len(st["history"]) == 1 and st["history"][0]["w"] == "pushA")
    items = {it["s"]: it for it in st["history"][0]["items"]}
    check("history has the ticked sets", [s["kg"] for s in items["pushA.inclinePress"]["sets"]] == [100, 102.5], items.get("pushA.inclinePress"))
    check("abs saved too", "abs.cableCrunch" in items)
    check("draft cleared", "pushA" not in st["drafts"])
    check("back on home", pg.url.endswith("#/"))
    check("next up moves to Pull A", "Pull A" in pg.inner_text(".hero-title"))
    tot = pg.inner_text(".totals")
    check("push total counts finished sets (abs excluded)", "Push A 2 of 22" in tot and "of 50" in tot, tot)
    ph.shot("16_home_after")

    # 11. PB now from history; last time shows the new date
    pg.goto(ph.url + "#/w/pushA"); pg.wait_for_timeout(150)
    check("PB updates from history", "102.5 kg × 9" in pg.inner_text(f"{card} .pb"), pg.inner_text(f"{card} .pb"))
    check("last time shows today's sets", "100×10" in pg.inner_text(f"{card} .last") and "Today" not in pg.inner_text(f"{card} .last"))
    check("4th set (added) still in plan", pg.locator(f'{card} .srow:not(.hdr)').count() == 4)

    # 12. superset: palms-up tick doesn't start the timer; palms-down does
    pg.goto(ph.url + "#/w/pullB"); pg.wait_for_timeout(150)
    pg.evaluate("document.getElementById('toast').classList.remove('show')")
    pg.click('[data-slot="pullB.wristCurl"] .srow[data-i="0"] .tick')
    check("superset first exercise: no rest timer", not ph.state()["timer"])
    pg.click('[data-slot="pullB.reverseWristCurl"] .srow[data-i="0"] .tick')
    check("superset second exercise: rest timer starts", bool(ph.state()["timer"]))
    pg.click('[data-a="tmSkip"]')
    ph.shot("17_superset")
    pg.locator(".superset").scroll_into_view_if_needed()
    ph.shot("17b_superset_view")

    # 13. drop set row on Push B laterals
    pg.goto(ph.url + "#/w/pushB"); pg.wait_for_timeout(150)
    lat = '[data-slot="pushB.seatedDbLateral"]'
    check("drop set row present", pg.locator(f"{lat} .srow.drop").count() == 1)
    check("drop row placeholder reps 10", pg.get_attribute(f'{lat} .srow.drop .reps', "placeholder") == "10")
    pg.click(f'{lat} .srow.drop .tick')
    check("drop set needs a weight", "Add the weight" in pg.inner_text("#toast"))
    pg.fill(f'{lat} .srow.drop .kg', "10")
    pg.click(f'{lat} .srow.drop .tick')
    check("drop set ticks once weight is in", ph.state()["drafts"]["pushB"]["rows"]["pushB.seatedDbLateral"][4]["done"])
    dips = '[data-slot="pushB.dips"]'
    check("bodyweight placeholder shows BW", pg.get_attribute(f'{dips} .srow[data-i="0"] .kg', "placeholder") == "BW")
    pg.click(f'{dips} .srow[data-i="0"] .tick')
    check("bodyweight set saves as BW", ph.state()["drafts"]["pushB"]["rows"]["pushB.dips"][0]["kg"] == "BW")
    pg.click('[data-a="tmSkip"]')
    ph.shot("18_pushB")

    # 14. stale draft gets saved automatically
    st = ph.state()
    st["drafts"]["pushB"]["upd"] = int(time.time() * 1000) - 9 * 3600 * 1000
    ph.open("#/", state=json.dumps(st)); pg.wait_for_timeout(700)
    st = ph.state()
    check("unfinished workout from 9 hours ago is saved", any(h["w"] == "pushB" for h in st["history"]) and "pushB" not in st["drafts"])
    check("told about it", "unfinished Push B" in pg.inner_text("#toast"), pg.inner_text("#toast"))

    # 15. breakdown sheet
    pg.click('[data-a="breakdown"]')
    pg.wait_for_timeout(150)
    ph.shot("19_breakdown")
    check("breakdown lists chest", "Chest" in pg.inner_text("#sheet"))
    pg.click('#sheet .btn[data-a="sheetClose"]')

    # 16. anatomy sheet
    pg.goto(ph.url + "#/w/pullA"); pg.wait_for_timeout(150)
    pg.click('[data-slot="pullA.widePulldown"] .ex-fig')
    pg.wait_for_timeout(150)
    check("anatomy sheet names muscles", "Lats" in pg.inner_text("#sheet"))
    ph.shot("20_anatomy_sheet")
    pg.click('#sheet .btn[data-a="sheetClose"]')

    # 17. rest time picker
    pg.click('[data-slot="pullA.widePulldown"] [data-a="rest"]')
    pg.click('#sheet [data-v="120"]')
    check("rest time changes per exercise", ph.state()["plan"]["slots"]["pullA.widePulldown"]["rest"] == 120)

    # 18. add exercise in edit mode
    pg.click('[data-a="edit"]')
    pg.click('[data-a="addEx"]')
    pg.fill('#fName', "Straight-arm pulldown")
    pg.click('#sheet [data-m="lats"]')
    pg.click('#sheet [data-m="triceps"]'); pg.click('#sheet [data-m="triceps"]')
    ph.shot("21_add_exercise")
    pg.click('[data-a="fSave"]')
    pg.wait_for_timeout(150)
    st = ph.state()
    new_sid = st["plan"]["workouts"]["pullA"][-1]
    check("new exercise added to Pull A", st["plan"]["slots"][new_sid]["name"] == "Straight-arm pulldown")
    ex_key = st["plan"]["slots"][new_sid]["opts"][0]["ex"]
    check("muscles saved (main + supporting)", st["plan"]["ex"][ex_key]["p"] == ["lats"] and st["plan"]["ex"][ex_key]["s"] == ["triceps"])

    # 19. edit details: rename + add option
    pg.click(f'[data-slot="{new_sid}"] [data-a="editEx"]')
    pg.fill('#fName', "Straight-arm pull-down")
    pg.click('[data-a="fOptAdd"]')
    pg.fill('#sheet [data-f="opt"][data-k="0"]', "Rope")
    pg.fill('#sheet [data-f="opt"][data-k="1"]', "Bar")
    pg.click('[data-a="fSave"]')
    st = ph.state()
    check("rename + options saved", st["plan"]["slots"][new_sid]["name"] == "Straight-arm pull-down" and [o["label"] for o in st["plan"]["slots"][new_sid]["opts"]] == ["Rope", "Bar"])
    # move it up
    pg.click(f'[data-slot="{new_sid}"] [data-a="moveUp"]')
    st = ph.state()
    check("move up works", st["plan"]["workouts"]["pullA"][-2] == new_sid)
    # remove it
    pg.click(f'[data-slot="{new_sid}"] [data-a="editEx"]')
    pg.click('[data-a="fRemove"]')
    pg.click('[data-a="confirmOk"]')
    check("exercise removed", new_sid not in ph.state()["plan"]["workouts"]["pullA"])
    pg.click('#toast [data-a="undo"]')
    check("exercise restored by undo", new_sid in ph.state()["plan"]["workouts"]["pullA"])
    pg.click('[data-a="edit"]')

    # 20. settings + export download fallback + import
    pg.goto(ph.url + "#/settings"); pg.wait_for_timeout(150)
    ph.shot("22_settings")
    with pg.expect_download() as dl:
        pg.click('[data-a="export"]')
    path = dl.value.path()
    backup = json.loads(open(path).read())
    check("backup file is valid", backup["app"] == "lift-log" and len(backup["state"]["history"]) == 2)
    check("backup date recorded", ph.state()["backupAt"] > 0)
    # wipe and restore
    ph.set_storage(clear=True)
    ph.open("#/"); pg.wait_for_timeout(200)
    check("fresh after wipe", len(ph.state()["history"]) == 0)
    pg.goto(ph.url + "#/settings"); pg.wait_for_timeout(150)
    pg.set_input_files("#importFile", path)
    pg.wait_for_timeout(200)
    check("restore asks first", "Restore the backup" in pg.inner_text("#sheet"))
    pg.click('[data-a="confirmOk"]')
    pg.wait_for_timeout(150)
    check("restore brings history back", len(ph.state()["history"]) == 2)

    # 21. delete a workout from history with undo
    pg.goto(ph.url + "#/progress"); pg.wait_for_timeout(200)
    pg.click('.hist-row >> nth=0')
    pg.click('[data-a="delHist"]')
    pg.click('[data-a="confirmOk"]')
    check("workout deleted", len(ph.state()["history"]) == 1)
    pg.click('#toast [data-a="undo"]')
    check("undo restores deleted workout", len(ph.state()["history"]) == 2)

    print("\n" + "\n".join(ph.errors) if ph.errors else "\nno console errors")
    ph.close()
srv.shutdown()
failed = [r for r in results if not r[1]]
print(f"\n{len(results) - len(failed)}/{len(results)} checks passed")
