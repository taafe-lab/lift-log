'use strict';
/* global ANATOMY, BASE, MUSCLES, EXERCISE_DEFAULTS, WORKOUT_DEFAULTS, PROGRAM_DEFAULTS, groupOf, groupName */

const APP_VERSION = '__VERSION__';
const KEY = 'liftlog.v1';
const DAY = 864e5;
const CATS = ['push', 'pull', 'legs'];
const CAT_NAME = { push: 'Push', pull: 'Pull', legs: 'Legs', abs: 'Abs' };
const REST_CHOICES = [45, 60, 75, 90, 120, 150, 180, 240];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const sum = arr => arr.reduce((a, b) => a + b, 0);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------------- icons ---------------- */
const ICONS = {
  chevL: '<path d="M15 18l-6-6 6-6"/>',
  chevR: '<path d="M9 18l6-6-6-6"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 6h3v1.5A3.5 3.5 0 0 1 16.5 11M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11"/>',
  clock: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.5l2.5 2M9.5 2.5h5"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  down: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
  save: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  restore: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11"/>',
  chart: '<path d="M3 3v18h18M7 15l4-4 3 3 5-6"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  trendUp: '<path d="M7 17L17 7M9 7h8v8"/>',
  trendDown: '<path d="M7 7l10 10M17 9v8H9"/>',
  shield: '<path d="M12 3l8 3.5v5.5c0 4.6-3.3 7.9-8 9-4.7-1.1-8-4.4-8-9V6.5L12 3z"/><path d="M9 12l2 2 4-4"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
};
const ic = (n, cls = '') => `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

/* ---------------- dates & numbers ---------------- */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtN = n => String(Math.round(n * 100) / 100);
const fmtKg = kg => (kg == null ? '?' : kg === 0 ? 'BW' : fmtN(kg));
const fmtSet = s => (s.kg === 0 ? `BW × ${s.reps}` : `${fmtKg(s.kg)} kg × ${s.reps}`);
const fmtShort = s => `${fmtKg(s.kg)}×${s.reps ?? '?'}`;
function fmtDate(ts) {
  const d = new Date(ts);
  const y = d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '';
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}${y}`;
}
function dayDiff(ts) {
  const a = new Date(ts); a.setHours(0, 0, 0, 0);
  const b = new Date(); b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / DAY);
}
function fmtRel(ts) {
  const n = dayDiff(ts);
  return n <= 0 ? 'Today' : n === 1 ? 'Yesterday' : n < 7 ? `${n} days ago` : fmtDate(ts);
}
const relLower = ts => { const r = fmtRel(ts); return /^(Today|Yesterday)$/.test(r) ? r.toLowerCase() : r; };
const pad2 = n => String(n).padStart(2, '0');
const fmtTime = ts => { const d = new Date(ts); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
function fmtDur(ms) {
  const m = Math.max(1, Math.round(ms / 6e4));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${pad2(m % 60)} min`;
}
const fmtClock = sec => { sec = Math.max(0, Math.ceil(sec)); return `${Math.floor(sec / 60)}:${pad2(sec % 60)}`; };
function parseKg(v) {
  v = String(v ?? '').trim().toLowerCase().replace(',', '.');
  if (v === '') return null;
  if (v === 'bw' || v === 'b') return 0;
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}
function parseReps(v) {
  const n = parseInt(String(v ?? '').trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
const score = s => (s.kg > 0 ? s.kg * (1 + s.reps / 30) : s.reps);
const better = (a, b) => !b || a.kg > b.kg || (a.kg === b.kg && a.reps > b.reps);
const monthKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; };
function monthLabel(k, long) {
  if (k === 'start') return 'Start';
  const [y, m] = k.split('-').map(Number);
  const yr = y !== new Date().getFullYear() ? ` ${String(y).slice(2)}` : '';
  return (long ? MONTHS_LONG : MONTHS)[m - 1] + (long && yr ? ' ' + y : yr);
}

/* ---------------- state ---------------- */
let S;
const U = { edit: false, filter: 'all', absOpen: {}, saveErr: false, form: null, lastRoute: '', chartTable: false };

function freshState() {
  const plan = { workouts: {}, slots: {}, ex: {}, abs: [] };
  for (const [k, [name, cat, p, s, counts]] of Object.entries(EXERCISE_DEFAULTS)) {
    plan.ex[k] = { name, cat, p: p ? p.split(' ') : [], s: s ? s.split(' ') : [], counts: counts !== false };
  }
  const notes = {};
  for (const [wid, slots] of Object.entries(PROGRAM_DEFAULTS)) {
    const ids = [];
    for (const [key, name, ex, sets, note, ss] of slots) {
      const id = `${wid}.${key}`;
      const opts = Array.isArray(ex) ? ex.map(([label, k]) => ({ label, ex: k })) : [{ label: '', ex }];
      const [n, drop] = String(sets).split('+');
      const types = Array(Number(n)).fill('w');
      if (drop) types.push('d');
      plan.slots[id] = { name, opts, sets: types, rest: 90, ss: ss || null };
      if (note) notes[id] = note;
      ids.push(id);
    }
    if (wid === 'abs') plan.abs = ids; else plan.workouts[wid] = ids;
  }
  return {
    v: 1, created: Date.now(), plan, workouts: WORKOUT_DEFAULTS.map(w => ({ ...w })), notes, sel: {},
    history: [], drafts: {}, settings: { rest: 90, sound: true, awake: false }, backupAt: 0, timer: null,
  };
}

function migrate(s) {
  const f = freshState();
  s.settings = { ...f.settings, ...(s.settings || {}) };
  for (const k of ['notes', 'sel', 'drafts']) if (!s[k] || typeof s[k] !== 'object') s[k] = {};
  if (!Array.isArray(s.history)) s.history = [];
  if (!Array.isArray(s.workouts)) s.workouts = f.workouts;
  for (const [k, e] of Object.entries(f.plan.ex)) if (!s.plan.ex[k]) s.plan.ex[k] = e;
  for (const w of s.workouts) if (!s.plan.workouts[w.id]) s.plan.workouts[w.id] = [];
  if (!Array.isArray(s.plan.abs)) s.plan.abs = f.plan.abs;
  s.history.sort((a, b) => a.end - b.end);
  return s;
}

function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }
  if (raw) {
    try { return migrate(JSON.parse(raw)); } catch (e) {
      console.error('Saved data unreadable', e);
      try { localStorage.setItem(`${KEY}.unreadable-${Date.now()}`, raw); } catch (e2) { /* ignore */ }
      U.loadProblem = true;
    }
  }
  return freshState();
}

let saveTimer = 0;
function save(now) {
  clearTimeout(saveTimer);
  if (now) writeNow(); else saveTimer = setTimeout(writeNow, 250);
}
function writeNow() {
  clearTimeout(saveTimer); saveTimer = 0;
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
    U.saveErr = false;
  } catch (e) {
    if (!U.saveErr) { U.saveErr = true; toast("Couldn't save. Your phone may be out of storage."); }
  }
}
const snapshot = () => JSON.stringify(S);
function restore(snap) {
  S = migrate(JSON.parse(snap));
  historyChanged(); save(true); closeSheet(); render(true); drawTimer();
}

/* cache for values worked out from history */
let hv = 0;
const cache = new Map();
function memo(key, fn) {
  const k = `${hv}|${key}`;
  if (!cache.has(k)) { if (cache.size > 3000) cache.clear(); cache.set(k, fn()); }
  return cache.get(k);
}
function historyChanged() { hv++; cache.clear(); }

/* ---------------- plan helpers ---------------- */
const W = id => S.workouts.find(w => w.id === id);
const slot = id => S.plan.slots[id];
const exOf = k => S.plan.ex[k] || { name: k, cat: 'push', p: [], s: [], counts: false };
const isAbsSlot = id => id.startsWith('abs.');
const mainSlots = wid => S.plan.workouts[wid] || [];
const allSlots = wid => (W(wid).abs ? [...mainSlots(wid), ...S.plan.abs] : mainSlots(wid));
const listOf = (wid, sid) => (isAbsSlot(sid) ? S.plan.abs : mainSlots(wid));
function selIdx(sid) { const i = S.sel[sid] || 0; return i < slot(sid).opts.length ? i : 0; }
const selEx = sid => slot(sid).opts[selIdx(sid)].ex;
const slotCat = (wid, sid) => (isAbsSlot(sid) ? 'abs' : W(wid).cat);
const counts = ex => { const e = S.plan.ex[ex]; return !!e && e.counts && e.cat !== 'abs'; };
const workingCount = sid => slot(sid).sets.filter(t => t === 'w').length;

/* ---------------- history lookups ---------------- */
const fromBase = b => ({ w: b.w.map(([kg, reps]) => ({ kg, reps })), d: (b.d || []).map(([kg, reps]) => ({ kg, reps })), at: null });
function lastFor(sid, ex) {
  return memo(`last|${sid}|${ex}`, () => {
    const H = S.history;
    for (let i = H.length - 1; i >= 0; i--) {
      const it = H[i].items.find(x => x.s === sid && x.e === ex);
      if (it) return { w: it.sets.filter(x => !x.d), d: it.sets.filter(x => x.d), at: H[i].end, from: H[i].w };
    }
    const b = BASE.last[sid] && BASE.last[sid][ex];
    if (b) return { ...fromBase(b), from: sid.split('.')[0] };
    for (let i = H.length - 1; i >= 0; i--) {
      const it = H[i].items.find(x => x.e === ex);
      if (it) return { w: it.sets.filter(x => !x.d), d: it.sets.filter(x => x.d), at: H[i].end, from: H[i].w, other: true };
    }
    for (const [s2, m] of Object.entries(BASE.last)) if (m[ex]) return { ...fromBase(m[ex]), from: s2.split('.')[0], other: true };
    return null;
  });
}
function pbFor(ex) {
  return memo(`pb|${ex}`, () => {
    let best = null;
    const b = BASE.pb[ex];
    if (b) best = { kg: b[0], reps: b[1], at: null };
    for (const h of S.history) for (const it of h.items) {
      if (it.e !== ex) continue;
      for (const st of it.sets) if (!st.d && better(st, best)) best = { kg: st.kg, reps: st.reps, at: h.end };
    }
    return best;
  });
}
function latestSession(wid) {
  const H = S.history;
  for (let i = H.length - 1; i >= 0; i--) if (H[i].w === wid) return H[i];
  return null;
}

/* ---------------- drafts (the workout in progress) ---------------- */
const emptyRow = () => ({ kg: '', reps: '', done: false });
function getDraft(wid, create) {
  let d = S.drafts[wid];
  if (!d && create) d = S.drafts[wid] = { start: Date.now(), upd: Date.now(), rows: {} };
  return d || null;
}
function rowsFor(wid, sid) {
  const d = S.drafts[wid];
  const saved = (d && d.rows[sid]) || [];
  return slot(sid).sets.map((t, i) => (saved[i] ? { ...emptyRow(), ...saved[i] } : emptyRow()));
}
function putRows(wid, sid, rows) {
  const d = getDraft(wid, true);
  d.rows[sid] = rows;
  d.upd = Date.now();
}
const rowTouched = r => r && (r.done || r.kg !== '' || r.reps !== '');
function hasActivity(wid) {
  const d = S.drafts[wid];
  return !!d && Object.values(d.rows).some(rows => rows.some(rowTouched));
}
function placeholders(sid, ex) {
  const last = lastFor(sid, ex);
  let wi = 0, di = 0;
  return slot(sid).sets.map(t => {
    const src = last ? (t === 'd' ? last.d : last.w) : null;
    const i = t === 'd' ? di++ : wi++;
    const s = src && src.length ? src[Math.min(i, src.length - 1)] : null;
    return { kg: s && s.kg != null ? fmtKg(s.kg) : '', reps: s && s.reps != null ? String(s.reps) : '' };
  });
}
function rowValue(r, ph) {
  return { kg: parseKg(r.kg !== '' ? r.kg : ph.kg), reps: parseReps(r.reps !== '' ? r.reps : ph.reps) };
}
function isPBRow(ex, r, ph) {
  const pb = pbFor(ex);
  if (!pb || !r.done) return false;
  const v = rowValue(r, ph);
  return v.kg != null && v.reps != null && better(v, pb);
}
function sessionFromDraft(wid) {
  const items = [];
  let ticked = 0, filled = 0;
  const d = S.drafts[wid];
  const sids = [...allSlots(wid)];
  if (d) for (const k of Object.keys(d.rows)) if (!sids.includes(k) && slot(k)) sids.push(k);
  for (const sid of sids) {
    const ex = selEx(sid), types = slot(sid).sets, rows = rowsFor(wid, sid), ph = placeholders(sid, ex), sets = [];
    rows.forEach((r, i) => {
      if (!r.done && r.reps === '') return;
      const v = rowValue(r, ph[i]);
      if (v.kg == null || v.reps == null) return;
      if (r.done) ticked++; else filled++;
      sets.push(types[i] === 'd' ? { kg: v.kg, reps: v.reps, d: 1 } : { kg: v.kg, reps: v.reps });
    });
    if (sets.length) items.push({ s: sid, e: ex, sets });
  }
  return { items, ticked, filled };
}
function sessionPBs(items) {
  const out = [];
  for (const it of items) {
    const prev = pbFor(it.e);
    if (!prev) continue;
    let best = null;
    for (const st of it.sets) if (!st.d && better(st, best)) best = st;
    if (best && better(best, prev)) out.push({ ex: it.e, set: best, prev });
  }
  return out;
}
function workoutProgress(wid) {
  let done = 0, total = 0;
  for (const sid of mainSlots(wid)) {
    const rows = rowsFor(wid, sid);
    slot(sid).sets.forEach((t, i) => { if (t !== 'w') return; total++; if (rows[i].done) done++; });
  }
  return { done, total };
}
/* An unfinished workout left for 8+ hours is saved automatically, so nothing is lost */
function settleStaleDrafts() {
  const msgs = [];
  for (const [wid, d] of Object.entries(S.drafts)) {
    if (!W(wid)) { delete S.drafts[wid]; continue; }
    if (Date.now() - d.upd < 8 * 36e5) continue;
    const sess = sessionFromDraft(wid);
    if (sess.items.length) {
      S.history.push({ id: uid(), w: wid, start: d.start, end: d.upd, items: sess.items });
      msgs.push(`Saved your unfinished ${W(wid).name} from ${fmtDate(d.upd)}`);
    }
    delete S.drafts[wid];
  }
  if (msgs.length) {
    S.history.sort((a, b) => a.end - b.end);
    historyChanged(); save(true);
    setTimeout(() => toast(msgs.join('. ')), 400);
  }
  return msgs.length > 0;
}

/* ---------------- set totals ---------------- */
function countedDone(h) {
  let n = 0;
  for (const it of h.items) if (counts(it.e)) for (const st of it.sets) if (!st.d) n++;
  return n;
}
function countedPlanned(wid) {
  let n = 0;
  for (const sid of mainSlots(wid)) if (counts(selEx(sid))) n += workingCount(sid);
  return n;
}
function totals() {
  return CATS.map(cat => {
    const parts = S.workouts.filter(w => w.cat === cat).map(w => {
      const h = latestSession(w.id);
      return { w, h, done: h ? countedDone(h) : 0, planned: countedPlanned(w.id) };
    });
    return { cat, parts, done: sum(parts.map(p => p.done)), planned: sum(parts.map(p => p.planned)) };
  });
}
function breakdown() {
  const done = {}, planned = {};
  let any = false;
  const add = (map, ex, n) => { if (!n) return; for (const g of new Set(exOf(ex).p.map(groupOf))) map[g] = (map[g] || 0) + n; };
  for (const w of S.workouts) {
    const h = latestSession(w.id);
    if (h) {
      any = true;
      for (const it of h.items) if (counts(it.e)) add(done, it.e, it.sets.filter(s => !s.d).length);
    }
    for (const sid of mainSlots(w.id)) { const ex = selEx(sid); if (counts(ex)) add(planned, ex, workingCount(sid)); }
  }
  return { any, done, planned };
}

/* ---------------- progress ---------------- */
function progress() {
  return memo('progress', () => {
    const byEx = {};
    const months = new Set();
    for (const h of S.history) {
      const mk = monthKey(h.end);
      months.add(mk);
      for (const it of h.items) for (const st of it.sets) {
        if (st.d) continue;
        const m = (byEx[it.e] = byEx[it.e] || {});
        if (!m[mk] || score(st) > score(m[mk])) m[mk] = st;
      }
    }
    const mlist = [...months].sort().slice(-12);
    const lifts = [];
    for (const ex of new Set([...Object.keys(byEx), ...Object.keys(BASE.score)])) {
      if (!S.plan.ex[ex]) continue;
      const pts = [];
      if (BASE.score[ex] != null) pts.push({ k: 'start', v: BASE.score[ex] });
      const m = byEx[ex] || {};
      for (const mk of Object.keys(m).sort()) pts.push({ k: mk, v: score(m[mk]), set: m[mk] });
      const a = pts[pts.length - 1], b = pts[pts.length - 2];
      lifts.push({ ex, pts, change: a && b && b.v > 0 ? (a.v / b.v - 1) * 100 : null, logged: Object.keys(m).length > 0 });
    }
    const series = {};
    for (const cat of CATS) {
      const vals = [{ k: 'start', v: 0 }];
      for (const mk of mlist) {
        const arr = [];
        for (const [ex, m] of Object.entries(byEx)) {
          if (!m[mk] || !counts(ex) || exOf(ex).cat !== cat) continue;
          let base = BASE.score[ex];
          if (base == null) {
            const first = Object.keys(m).sort()[0];
            if (first === mk) continue;
            base = score(m[first]);
          }
          if (base > 0) arr.push((score(m[mk]) / base - 1) * 100);
        }
        vals.push({ k: mk, v: arr.length ? sum(arr) / arr.length : null, n: arr.length });
      }
      series[cat] = vals;
    }
    return { months: mlist, lifts, series, byEx };
  });
}

/* ---------------- next workout ---------------- */
function nextUp() {
  const live = Object.keys(S.drafts).filter(hasActivity).sort((a, b) => S.drafts[b].upd - S.drafts[a].upd);
  if (live.length) return { w: W(live[0]), live: true };
  const H = S.history;
  if (!H.length) return { w: S.workouts[0], live: false };
  const i = S.workouts.findIndex(w => w.id === H[H.length - 1].w);
  return { w: S.workouts[(i + 1) % S.workouts.length], live: false };
}
function workoutMuscles(wid) {
  const p = new Set(), s = new Set();
  for (const sid of mainSlots(wid)) { const e = exOf(selEx(sid)); e.p.forEach(m => p.add(m)); e.s.forEach(m => s.add(m)); }
  return { p: [...p], s: [...s].filter(m => !p.has(m)) };
}

/* ---------------- routing & rendering ---------------- */
function route() {
  const h = location.hash.replace(/^#/, '');
  const m = h.match(/^\/w\/([\w-]+)/);
  if (m && W(m[1])) return { page: 'workout', wid: m[1], key: h };
  if (h.startsWith('/progress')) return { page: 'progress', key: h };
  if (h.startsWith('/settings')) return { page: 'settings', key: h };
  return { page: 'home', key: '/' };
}

function render(keepScroll) {
  const r = route();
  const y = window.scrollY;
  const view = $('#view');
  view.innerHTML = r.page === 'workout' ? renderWorkout(r.wid)
    : r.page === 'progress' ? renderProgress()
    : r.page === 'settings' ? renderSettings()
    : renderHome();
  document.body.classList.toggle('on-workout', r.page === 'workout');
  $$('.tabbar a').forEach(a => a.classList.toggle('on', a.dataset.page === r.page));
  const sameRoute = U.lastRoute === r.key;
  U.lastRoute = r.key;
  if (keepScroll && sameRoute) window.scrollTo(0, y); else window.scrollTo(0, 0);
  $$('.note', view).forEach(autoGrow);
  if (r.page === 'progress') initChart();
  onScroll();
  updateWake();
}

function band(cls, inner) { return `<header class="band ${cls}"><div class="wrap">${inner}</div></header>`; }

/* ---- home ---- */
function renderHome() {
  const now = new Date();
  const nu = nextUp();
  const w = nu.w;
  const mus = workoutMuscles(w.id);
  const last = latestSession(w.id);
  let sub;
  if (nu.live) { const p = workoutProgress(w.id); sub = `${p.done} of ${p.total} sets done`; }
  else sub = last ? `Last done ${relLower(last.end)}` : 'Your numbers from your notes are loaded';
  let h = `<header class="band hero c-${w.cat}"><div class="wrap">
    <div class="hero-head"><b>Lift Log</b><span>${DAYS_LONG[now.getDay()]} ${now.getDate()} ${MONTHS_LONG[now.getMonth()]}</span></div>
    <div class="hero-body">
      <div>
        <p class="hero-kicker">${nu.live ? 'In progress' : 'Next up'}</p>
        <h1 class="hero-title">${esc(w.name)}</h1>
        <p class="hero-sub">${esc(sub)}</p>
        <a class="hero-btn" href="#/w/${w.id}">${nu.live ? 'Continue' : 'Start workout'}</a>
      </div>
      <div class="hero-fig">${ANATOMY.pair(mus.p, mus.s)}</div>
    </div></div></header><main class="wrap">`;

  if (backupDue()) {
    h += `<div class="section alert">${ic('shield')}<p>${S.backupAt ? `Last backup ${relLower(S.backupAt)}.` : "You haven't saved a backup yet."} Save one to iCloud Drive so your training is safe.</p><button data-a="export">Back up</button></div>`;
  }

  h += `<section class="section"><div class="sec-head"><h2 class="sec-title">Workouts</h2></div><div class="wgrid">`;
  const order = ['pushA', 'pushB', 'pullA', 'pullB', 'legsA', 'legsB'].map(W).filter(Boolean);
  for (const x of S.workouts) if (!order.includes(x)) order.push(x);
  for (const x of order) {
    const lh = latestSession(x.id);
    const live = hasActivity(x.id);
    const isNext = x.id === w.id;
    const meta = live ? `${workoutProgress(x.id).done} sets done` : lh ? fmtRel(lh.end) : 'Not done yet';
    const n = mainSlots(x.id).length;
    h += `<a class="wtile c-${x.cat}${isNext ? ' next' : ''}" href="#/w/${x.id}">
      <span class="wt-name">${esc(x.name)}</span><span class="wt-meta">${esc(meta)}</span>
      <span class="wt-sets">${n} exercise${n === 1 ? '' : 's'}${x.abs ? ' + abs' : ''}</span>
      ${live ? '<span class="badge">In progress</span>' : isNext ? '<span class="badge">Next</span>' : ''}</a>`;
  }
  h += `</div></section>`;

  const T = totals();
  h += `<section class="section"><div class="sec-head"><h2 class="sec-title">Working sets</h2><button class="sec-link" data-a="breakdown">By muscle</button></div>
    <div class="card totals">`;
  for (const t of T) {
    const max = Math.max(t.planned, t.done, 1);
    h += `<div class="tot c-${t.cat}">
      <div class="tot-label"><i></i>${CAT_NAME[t.cat]}</div>
      <div class="tot-bar" role="img" aria-label="${t.done} of ${t.planned} sets">${t.parts.map((p, i) => `<span class="${i ? 'b' : ''}" style="width:${(p.done / max) * 100}%"></span>`).join('')}</div>
      <div class="tot-num"><b>${t.done}</b><span>of ${t.planned}</span></div>
      <div class="tot-ab">${t.parts.map(p => `<span>${esc(p.w.name)} <b>${p.done}</b> of ${p.planned}</span>`).join('')}</div>
    </div>`;
  }
  h += `</div><p class="foot-note">Sets ticked in your latest A and B sessions. Calves, shrugs, wrist curls and abs aren't counted.</p></section>`;
  h += `</main>`;
  return h;
}
function backupDue() {
  if (!S.history.length) return false;
  const since = S.history.filter(x => x.end > (S.backupAt || 0)).length;
  if (!since) return false;
  return S.backupAt ? Date.now() - S.backupAt > 14 * DAY : S.history.length >= 2;
}

/* ---- workout ---- */
function renderWorkout(wid) {
  const w = W(wid);
  const p = workoutProgress(wid);
  const d = S.drafts[wid];
  const last = latestSession(wid);
  let h = `<div class="topbar c-${w.cat}" id="topbar"><div class="wrap">
      <a class="tb-btn" href="#/">${ic('chevL')}Workouts</a>
      <span class="tb-title">${esc(w.name)}</span>
      <button class="tb-btn pill" data-a="edit">${U.edit ? 'Done' : 'Edit'}</button>
    </div></div>`;
  h += `<header class="band wk-band c-${w.cat}"><div class="wrap">
      <h1 class="band-title">${esc(w.name)}</h1>
      <p class="band-sub">${U.edit ? 'Editing: add, remove or reorder sets and exercises.' : last ? `Last done ${esc(fmtDate(last.end))}` : 'First time logging this one in the app'}</p>
      <div class="wk-progress"><div class="bar"><i id="wkBar" style="width:${p.total ? (p.done / p.total) * 100 : 0}%"></i></div>
      <p><span id="wkCount">${p.done} of ${p.total} sets</span><span>${d ? `Started ${fmtTime(d.start)}` : ''}</span></p></div>
    </div></header><main class="wrap">`;
  h += renderSlotList(wid, mainSlots(wid), w.cat);
  if (U.edit) h += `<button class="btn add-ex" data-a="addEx">${ic('plus')}Add an exercise</button>`;
  if (w.abs) {
    const open = U.absOpen[wid] ?? S.plan.abs.some(sid => rowsFor(wid, sid).some(rowTouched));
    h += `<button class="card abs-toggle${open ? ' open' : ''}" data-a="absToggle" aria-expanded="${open}">
      <span class="dot"></span><span class="t"><b>Abs</b><span>Optional. Not counted in your set totals.</span></span>${ic('chevD')}</button>`;
    if (open) h += renderSlotList(wid, S.plan.abs, 'abs');
  }
  if (!U.edit) h += `<button class="btn primary finish c-${w.cat}" data-a="finish">${ic('check')}Finish ${esc(w.name)}</button>`;
  else h += `<button class="btn primary finish c-${w.cat}" data-a="edit">Done editing</button>`;
  h += `</main>`;
  return h;
}

function renderSlotList(wid, sids, cat) {
  let out = '';
  let i = 0;
  while (i < sids.length) {
    const ss = slot(sids[i]).ss;
    if (ss && !U.edit) {
      let j = i;
      while (j < sids.length && slot(sids[j]).ss === ss) j++;
      if (j - i > 1) {
        out += `<div class="superset c-${cat}"><p class="ss-label">${ic('link')}Superset: one set of each, then rest</p>${sids.slice(i, j).map(s => renderCard(wid, s, cat)).join('')}</div>`;
        i = j;
        continue;
      }
    }
    out += renderCard(wid, sids[i], cat);
    i++;
  }
  return out;
}

function lastLabel(last) {
  const where = last.other && W(last.from) ? ` in ${W(last.from).name}` : '';
  return last.at ? `Last time${where}, ${fmtDate(last.at)}` : `Last time${where}, from your notes`;
}

function renderCard(wid, sid, cat) {
  const sl = slot(sid);
  const ex = selEx(sid);
  const e = exOf(ex);
  const rows = rowsFor(wid, sid);
  const ph = placeholders(sid, ex);
  const pb = pbFor(ex);
  const last = lastFor(sid, ex);
  const allDone = rows.length > 0 && rows.every(r => r.done);
  let h = `<article class="card ex c-${cat}" data-slot="${sid}">`;
  if (U.edit) {
    const list = listOf(wid, sid);
    const pos = list.indexOf(sid);
    h += `<div class="edit-bar">
      <button class="chip-btn" data-a="moveUp"${pos <= 0 ? ' disabled' : ''}>${ic('up')}Up</button>
      <button class="chip-btn" data-a="moveDown"${pos >= list.length - 1 ? ' disabled' : ''}>${ic('down')}Down</button>
      <button class="chip-btn" data-a="editEx" style="margin-left:auto">${ic('edit')}Edit details</button></div>`;
  }
  h += `<div class="ex-top"><button class="ex-fig" data-a="anat" aria-label="Muscles worked by ${esc(sl.name)}">${ANATOMY.thumb(e.p, e.s)}</button><div>`;
  h += `<h3 class="ex-name">${allDone ? `<span class="done-mark">${ic('check')}</span>` : ''}<span>${esc(sl.name)}</span></h3>`;
  if (sl.opts.length > 1) {
    h += `<div class="opts">${sl.opts.map((o, i) => `<button class="opt${i === selIdx(sid) ? ' on' : ''}" data-a="opt" data-o="${i}" aria-pressed="${i === selIdx(sid)}">${esc(o.label)}</button>`).join('')}</div>`;
  }
  h += `<div class="targets">`;
  h += pb ? `<span class="pb">${ic('trophy')}PB <b>${fmtSet(pb)}</b></span>` : `<span class="pb none">${ic('trophy')}No PB yet</span>`;
  if (last && (last.w.length || last.d.length)) {
    h += `<div class="last">${esc(lastLabel(last))}<div class="last-sets">${last.w.map(s => `<span>${fmtShort(s)}</span>`).join('')}${last.d.map(s => `<span class="d">Drop ${s.kg == null ? '' : fmtKg(s.kg) + '×'}${s.reps ?? '?'}</span>`).join('')}</div></div>`;
  }
  h += `</div></div></div><div class="sets"><div class="srow hdr"><span>Set</span><span>kg</span><span>Reps</span><span></span></div>`;
  let n = 0;
  rows.forEach((r, i) => {
    const isDrop = sl.sets[i] === 'd';
    if (!isDrop) n++;
    const pbRow = !isDrop && isPBRow(ex, r, ph[i]);
    const label = isDrop ? 'drop set' : `set ${n}`;
    h += `<div class="srow${r.done ? ' done' : ''}${isDrop ? ' drop' : ''}${pbRow ? ' pbrow' : ''}" data-i="${i}">
      <span class="sn">${pbRow ? ic('trophy') : isDrop ? 'Drop' : n}</span>
      <input class="kg" type="text" inputmode="decimal" autocomplete="off" aria-label="${label} weight in kg" placeholder="${esc(ph[i].kg || 'kg')}" value="${esc(r.kg)}">
      <input class="reps" type="text" inputmode="numeric" autocomplete="off" aria-label="${label} reps" placeholder="${esc(ph[i].reps || 'reps')}" value="${esc(r.reps)}">
      ${U.edit ? `<button class="rm" data-a="rmSet" aria-label="Remove ${label}">${ic('minus')}</button>`
               : `<button class="tick" data-a="tick" aria-label="${r.done ? 'Untick' : 'Tick off'} ${label}">${ic('check')}</button>`}
    </div>`;
  });
  h += `</div><div class="ex-foot">
      <button class="chip-btn" data-a="addSet">${ic('plus')}Set</button>
      <button class="chip-btn plain" data-a="addDrop">${ic('plus')}Drop set</button>
      <button class="chip-btn rest" data-a="rest" aria-label="Rest time ${fmtClock(sl.rest)}">${ic('clock')}${fmtClock(sl.rest)}</button>
    </div>
    <textarea class="note" rows="1" placeholder="Training notes" aria-label="Notes for ${esc(sl.name)}">${esc(S.notes[sid] || '')}</textarea>
  </article>`;
  return h;
}

function rerenderCard(wid, sid) {
  const el = $(`[data-slot="${sid}"]`);
  if (!el) return render(true);
  const tmp = document.createElement('div');
  tmp.innerHTML = renderCard(wid, sid, slotCat(wid, sid));
  const fresh = tmp.firstElementChild;
  el.replaceWith(fresh);
  $$('.note', fresh).forEach(autoGrow);
}
function updateWkProgress(wid) {
  const p = workoutProgress(wid);
  const bar = $('#wkBar'), c = $('#wkCount');
  if (bar) bar.style.width = `${p.total ? (p.done / p.total) * 100 : 0}%`;
  if (c) c.textContent = `${p.done} of ${p.total} sets`;
}

/* ---- progress ---- */
function renderProgress() {
  const P = progress();
  let h = band('navy', `<h1 class="band-title">Progress</h1>
    <p class="band-sub">How your strength has moved month by month, compared with where you started.</p>
    ${P.months.length ? chartHTML(P) : `<div class="empty-chart">Your first month appears here after your first workout. Your starting point is the latest numbers from your notes.</div>`}`);
  h += `<main class="wrap">`;
  if (P.months.length && U.chartTable) h += chartTable(P);
  if (P.months.length) h += `<button class="sec-link" data-a="chartTable" style="margin-top:8px">${U.chartTable ? 'Hide the table' : 'Show as a table'}</button>`;

  const f = U.filter;
  const lifts = P.lifts.filter(l => f === 'all' || exOf(l.ex).cat === f).sort((a, b) =>
    (b.logged - a.logged) || ['push', 'pull', 'legs', 'abs'].indexOf(exOf(a.ex).cat) - ['push', 'pull', 'legs', 'abs'].indexOf(exOf(b.ex).cat) || exOf(a.ex).name.localeCompare(exOf(b.ex).name));
  h += `<section class="section"><div class="sec-head"><h2 class="sec-title">Lifts</h2><span class="muted small">vs the month before</span></div>
    <div class="seg" role="tablist">${['all', 'push', 'pull', 'legs', 'abs'].map(k => `<button class="${f === k ? 'on' : ''}" data-a="filter" data-v="${k}">${k === 'all' ? 'All' : CAT_NAME[k]}</button>`).join('')}</div>
    <div class="card lift-list">`;
  if (!lifts.length) h += `<p class="muted" style="padding:16px">Nothing here yet.</p>`;
  for (const l of lifts) {
    const e = exOf(l.ex);
    const last = l.pts[l.pts.length - 1];
    const sub = !l.logged ? 'Not logged in the app yet' : last && last.set ? `Best in ${monthLabel(last.k, true)}: ${fmtSet(last.set)}` : '';
    h += `<button class="lift c-${e.cat}" data-a="lift" data-ex="${l.ex}"><span class="lift-name">${esc(e.name)}<small>${esc(sub)}</small></span>
      ${l.pts.length > 1 ? spark(l.pts.map(p => p.v)) : '<span></span>'}${deltaBadge(l.change)}</button>`;
  }
  h += `</div></section>`;

  h += `<section class="section"><div class="sec-head"><h2 class="sec-title">Recent workouts</h2></div><div class="card">`;
  const recent = S.history.slice(-20).reverse();
  if (!recent.length) h += `<p class="muted" style="padding:16px">Finished workouts show up here.</p>`;
  for (const s of recent) {
    const w = W(s.w) || { name: 'Workout', cat: 'push' };
    const n = sum(s.items.map(i => i.sets.length));
    h += `<button class="hist-row c-${w.cat}" data-a="hist" data-id="${s.id}"><i></i><div><b>${esc(w.name)}</b><span>${fmtDate(s.end)}, ${n} sets, ${fmtDur(s.end - s.start)}</span></div>${ic('chevR')}</button>`;
  }
  h += `</div></section></main>`;
  return h;
}
function deltaBadge(ch) {
  if (ch == null) return `<span class="delta flat">New</span>`;
  const r = Math.round(ch * 10) / 10;
  if (Math.abs(r) < 0.5) return `<span class="delta flat">${ic('minus')}0%</span>`;
  return r > 0 ? `<span class="delta up">${ic('trendUp')}${r}%</span>` : `<span class="delta down">${ic('trendDown')}${Math.abs(r)}%</span>`;
}
function spark(vals) {
  const w = 70, hgt = 28, pd = 4;
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const span = hi - lo || 1;
  const pts = vals.map((v, i) => [pd + (i * (w - 2 * pd)) / (vals.length - 1), hi === lo ? hgt / 2 : pd + (1 - (v - lo) / span) * (hgt - 2 * pd)]);
  const [lx, ly] = pts[pts.length - 1];
  return `<svg class="spark" viewBox="0 0 ${w} ${hgt}" aria-hidden="true"><polyline points="${pts.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ')}"/><circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="4"/></svg>`;
}
const CHART = { w: 340, h: 196, l: 36, r: 300, t: 12, b: 162 };
function chartHTML(P) {
  const keys = ['start', ...P.months];
  const vals = [];
  for (const c of CATS) for (const p of P.series[c]) if (p.v != null) vals.push(p.v);
  let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
  const raw = Math.max(hi - lo, 4) / 4;
  const step = [1, 2, 2.5, 5, 10, 20, 25, 50, 100].find(s => s >= raw) || 100;
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  if (hi === lo) hi = lo + step;
  const x = i => (keys.length === 1 ? CHART.l : CHART.l + (i * (CHART.r - CHART.l)) / (keys.length - 1));
  const y = v => CHART.t + ((hi - v) / (hi - lo)) * (CHART.b - CHART.t);
  let g = '';
  for (let v = lo; v <= hi + 1e-9; v += step) {
    g += `<line class="${Math.abs(v) < 1e-9 ? 'zero' : 'grid'}" x1="${CHART.l}" x2="${CHART.r}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/>`;
    g += `<text class="axis" x="${CHART.l - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${v > 0 ? '+' : ''}${fmtN(v)}%</text>`;
  }
  const every = Math.ceil(keys.length / 6);
  keys.forEach((k, i) => {
    if (i % every && i !== keys.length - 1) return;
    g += `<text class="axis" x="${x(i).toFixed(1)}" y="${CHART.b + 20}" text-anchor="middle">${monthLabel(k)}</text>`;
  });
  const ends = [];
  for (const c of CATS) {
    const pts = P.series[c].map((p, i) => (p.v == null ? null : [x(i), y(p.v), p.v])).filter(Boolean);
    if (!pts.length) continue;
    if (pts.length > 1) g += `<polyline class="ln" stroke="var(--chart-${c})" points="${pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}"/>`;
    const lp = pts[pts.length - 1];
    g += `<circle class="dot" fill="var(--chart-${c})" cx="${lp[0].toFixed(1)}" cy="${lp[1].toFixed(1)}" r="4.5"/>`;
    if (pts.length > 1) ends.push({ c, x: lp[0], y: lp[1], v: lp[2] });
  }
  ends.sort((a, b) => a.y - b.y);
  const collide = ends.some((e, i) => i && e.y - ends[i - 1].y < 14);
  if (!collide) for (const e of ends) g += `<text class="lbl" x="${(e.x + 9).toFixed(1)}" y="${(e.y + 4).toFixed(1)}">${e.v >= 0 ? '+' : ''}${e.v.toFixed(1)}%</text>`;
  g += `<line class="cross" id="chartCross" x1="0" x2="0" y1="${CHART.t}" y2="${CHART.b}" style="display:none"/>`;
  g += `<rect id="chartHit" x="${CHART.l - 14}" y="0" width="${CHART.r - CHART.l + 28}" height="${CHART.b + 26}" fill="transparent"/>`;
  U.chart = { keys, xs: keys.map((k, i) => x(i)), series: P.series };
  const legend = CATS.map(c => {
    const s = P.series[c];
    const lastV = [...s].reverse().find(p => p.v != null && p.k !== 'start');
    return `<span><i style="background:var(--chart-${c})"></i>${CAT_NAME[c]} <b>${lastV ? `${lastV.v >= 0 ? '+' : ''}${lastV.v.toFixed(1)}%` : '–'}</b></span>`;
  }).join('');
  return `<div class="chart-wrap"><svg class="chart" viewBox="0 0 ${CHART.w} ${CHART.h}" role="img" aria-label="Strength change by month for push, pull and legs">${g}</svg>
    <div class="chart-tip" id="chartTip"></div></div><div class="chart-legend">${legend}</div>`;
}
function chartTable(P) {
  const keys = ['start', ...P.months];
  return `<div class="card" style="padding:4px 16px;margin-top:14px"><table class="tbl"><thead><tr><th>Month</th>${CATS.map(c => `<th>${CAT_NAME[c]}</th>`).join('')}</tr></thead><tbody>
    ${keys.map((k, i) => `<tr><td>${monthLabel(k, true)}</td>${CATS.map(c => { const v = P.series[c][i].v; return `<td>${v == null ? '–' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}</td>`; }).join('')}</tr>`).join('')}
    </tbody></table></div>`;
}
function initChart() {
  const hit = $('#chartHit');
  if (!hit || !U.chart) return;
  const svg = hit.ownerSVGElement, tip = $('#chartTip'), cross = $('#chartCross');
  const show = ev => {
    const r = svg.getBoundingClientRect();
    const px = ((ev.clientX - r.left) / r.width) * CHART.w;
    let best = 0;
    U.chart.xs.forEach((xx, i) => { if (Math.abs(xx - px) < Math.abs(U.chart.xs[best] - px)) best = i; });
    const xx = U.chart.xs[best];
    cross.setAttribute('x1', xx); cross.setAttribute('x2', xx); cross.style.display = '';
    const k = U.chart.keys[best];
    tip.innerHTML = `<h5>${monthLabel(k, true)}</h5>` + CATS.map(c => {
      const v = U.chart.series[c][best].v;
      return `<div><i style="background:var(--chart-${c})"></i><b>${v == null ? '–' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}</b>${CAT_NAME[c]}</div>`;
    }).join('');
    const left = Math.min(Math.max((xx / CHART.w) * r.width, 70), r.width - 70);
    tip.style.left = `${left}px`;
    tip.classList.add('show');
  };
  const hide = () => { tip.classList.remove('show'); cross.style.display = 'none'; };
  hit.addEventListener('pointerdown', show);
  hit.addEventListener('pointermove', show);
  hit.addEventListener('pointerleave', hide);
  hit.addEventListener('pointercancel', hide);
}

/* ---- settings ---- */
function renderSettings() {
  let h = band('navy', `<h1 class="band-title">Settings</h1><p class="band-sub">Backup, rest timer and app details.</p>`);
  h += `<main class="wrap">
    <section class="section card set-card">
      <h3>Backup</h3>
      <p>Your training is stored on this phone only. Save a backup to iCloud Drive every couple of weeks, and always before you change phones.</p>
      <div class="kv"><span>Last backup</span><b>${S.backupAt ? `${fmtDate(S.backupAt)}, ${fmtTime(S.backupAt)}` : 'Never'}</b></div>
      <button class="btn primary" data-a="export">${ic('save')}Save a backup</button>
      <label class="btn outline" for="importFile">${ic('restore')}Restore from a backup</label>
    </section>
    <section class="section card set-card">
      <h3>Rest timer</h3>
      <div class="switch-row"><p>Default rest for new exercises<small>Each exercise keeps its own rest time</small></p>
        <span class="stepper"><button data-a="restStep" data-d="-15" aria-label="15 seconds less">−</button><b class="num">${fmtClock(S.settings.rest)}</b><button data-a="restStep" data-d="15" aria-label="15 seconds more">+</button></span></div>
      <div class="switch-row"><p>Beep when rest ends<small>Plays while the app is open</small></p><button class="switch${S.settings.sound ? ' on' : ''}" data-a="toggle" data-k="sound" role="switch" aria-checked="${S.settings.sound}" aria-label="Beep when rest ends"></button></div>
      <div class="switch-row"><p>Keep the screen on during workouts<small>Otherwise it stays on only while the timer runs</small></p><button class="switch${S.settings.awake ? ' on' : ''}" data-a="toggle" data-k="awake" role="switch" aria-checked="${S.settings.awake}" aria-label="Keep the screen on during workouts"></button></div>
    </section>
    <section class="section card set-card">
      <h3>About</h3>
      <div class="kv"><span>Workouts logged</span><b>${S.history.length}</b></div>
      <div class="kv"><span>Version</span><b>${APP_VERSION}</b></div>
      <p style="margin-top:12px">Starting numbers and PBs came from your training notes. Weights are in kg.</p>
    </section></main>`;
  return h;
}

/* ---------------- sheets & toasts ---------------- */
function openSheet(html) {
  const root = $('#sheet');
  root.innerHTML = `<div class="sheet-backdrop" data-a="sheetClose"></div><div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  root.classList.add('open');
  document.body.classList.add('sheet-open');
}
function closeSheet() {
  const root = $('#sheet');
  root.classList.remove('open');
  root.innerHTML = '';
  document.body.classList.remove('sheet-open');
  U.form = null;
}
function confirmSheet({ title, body, ok, danger, onOk }) {
  U.confirmOk = onOk;
  openSheet(`<h2 class="sh-title">${esc(title)}</h2>${body ? `<p class="sh-body">${esc(body)}</p>` : ''}
    <div class="sh-actions"><button class="btn ${danger ? 'danger' : 'primary'}" data-a="confirmOk">${esc(ok)}</button><button class="btn ghost" data-a="sheetClose">Cancel</button></div>`);
}
function toast(msg, opts = {}) {
  const el = $('#toast');
  U.undo = opts.undo || null;
  U.toastAction = opts.onAction || null;
  el.innerHTML = `<span>${esc(msg)}</span>${opts.undo ? '<button data-a="undo">Undo</button>' : opts.action ? `<button data-a="toastAction">${esc(opts.action)}</button>` : ''}`;
  el.classList.add('show');
  clearTimeout(U.toastT);
  U.toastT = setTimeout(() => el.classList.remove('show'), opts.ms || (opts.undo ? 7000 : 4000));
}
const hideToast = () => { $('#toast').classList.remove('show'); U.undo = null; };

function anatSheet(sid) {
  const sl = slot(sid), ex = selEx(sid), e = exOf(ex);
  const names = list => list.map(m => MUSCLES[m]).join(', ') || 'None';
  openSheet(`<h2 class="sh-title">${esc(sl.name)}</h2>${sl.opts.length > 1 ? `<p class="sh-body">${esc(sl.opts[selIdx(sid)].label)}</p>` : ''}
    <div class="sh-fig" style="margin-top:12px">${ANATOMY.pair(e.p, e.s)}</div>
    <div class="legend"><span><i style="background:#E5383B"></i>Main muscles</span><span><i style="background:var(--a-warm)"></i>Supporting</span></div>
    <div class="mlist"><div><h4>Main</h4><p>${esc(names(e.p))}</p></div><div><h4>Supporting</h4><p>${esc(names(e.s))}</p></div></div>
    <div class="sh-actions"><button class="btn" data-a="sheetClose">Close</button></div>`);
}

function restSheet(sid) {
  const sl = slot(sid);
  openSheet(`<h2 class="sh-title">Rest time</h2><p class="sh-body">For ${esc(sl.name)}. The timer starts when you tick off a set.</p>
    <div class="chips" style="margin-top:16px">${REST_CHOICES.map(v => `<button class="chip${v === sl.rest ? ' on' : ''}" data-a="setRest" data-v="${v}" data-slot-id="${sid}">${fmtClock(v)}</button>`).join('')}</div>
    <div class="sh-actions"><button class="btn" data-a="sheetClose">Close</button></div>`);
}

function breakdownSheet() {
  const B = breakdown();
  const data = B.any ? B.done : B.planned;
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(e => e[1]));
  const heat = m => {
    const n = data[groupOf(m)];
    if (!n) return '';
    const pct = Math.round(25 + (n / max) * 75);
    return `fill: color-mix(in srgb, #E5383B ${pct}%, var(--a-idle))`;
  };
  openSheet(`<h2 class="sh-title">Sets by muscle</h2>
    <p class="sh-body">${B.any ? 'Working sets in your latest A and B sessions. A set counts for each main muscle it works.' : 'Planned working sets per muscle. This fills in with real numbers after your first workouts.'}</p>
    <div class="sh-fig" style="margin-top:12px">${ANATOMY.pair([], [], heat)}</div>
    <div style="margin-top:8px">${entries.map(([g, n]) => `<div class="mbar"><span>${esc(groupName(g))}</span><div><i style="width:${(n / max) * 100}%"></i></div><b>${n}</b></div>`).join('') || '<p class="muted">No sets yet.</p>'}</div>
    <p class="foot-note">Calves, shrugs, wrist curls and abs aren't counted.</p>
    <div class="sh-actions"><button class="btn" data-a="sheetClose">Close</button></div>`);
}

function liftSheet(ex) {
  const P = progress();
  const l = P.lifts.find(x => x.ex === ex);
  const e = exOf(ex), pb = pbFor(ex);
  const pts = l ? l.pts : [];
  const max = Math.max(1, ...pts.map(p => p.v));
  const lo = Math.min(...pts.map(p => p.v)) * 0.9;
  const rows = pts.map((p, i) => {
    const prev = pts[i - 1];
    const ch = prev && prev.v > 0 ? (p.v / prev.v - 1) * 100 : null;
    const best = p.k === 'start' ? 'From your notes' : fmtSet(p.set);
    const w = max > lo ? ((p.v - lo) / (max - lo)) * 100 : 100;
    return `<div class="mrow c-${e.cat}"><div class="mrow-top"><b>${monthLabel(p.k, false)}</b><span class="best">${esc(best)}</span>${i ? deltaBadge(ch) : ''}</div>
      <div class="mrow-bar"><i style="width:${Math.max(4, w)}%"></i></div></div>`;
  }).join('');
  openSheet(`<h2 class="sh-title">${esc(e.name)}</h2>
    ${pb ? `<p style="margin-top:10px"><span class="pb">${ic('trophy')}PB <b>${fmtSet(pb)}</b></span></p>` : ''}
    <p class="sh-body">Your best set each month. The bars and percentages use a strength score that combines weight and reps, so a heavier set or extra reps both count as progress.</p>
    <div style="margin-top:10px">${rows || '<p class="muted">No data yet.</p>'}</div>
    <div class="sh-actions"><button class="btn" data-a="sheetClose">Close</button></div>`);
}

function histSheet(id) {
  const s = S.history.find(x => x.id === id);
  if (!s) return;
  const w = W(s.w) || { name: 'Workout' };
  const body = s.items.map(it => {
    const sl = slot(it.s);
    const name = sl ? sl.name + (sl.opts.length > 1 ? ` (${(sl.opts.find(o => o.ex === it.e) || {}).label || exOf(it.e).name})` : '') : exOf(it.e).name;
    return `<div><span><b>${esc(name)}</b><br>${it.sets.map(st => (st.d ? 'Drop ' : '') + fmtShort(st)).join(', ')}</span></div>`;
  }).join('');
  openSheet(`<h2 class="sh-title">${esc(w.name)}</h2><p class="sh-body">${fmtDate(s.end)}, ${fmtTime(s.start)} to ${fmtTime(s.end)}</p>
    <div class="detail-sets">${body}</div>
    <div class="sh-actions"><button class="btn" data-a="sheetClose">Close</button><button class="btn ghost" style="color:var(--danger)" data-a="delHist" data-id="${s.id}">${ic('trash')}Delete this workout</button></div>`);
}

function finishSheet(wid) {
  const sess = sessionFromDraft(wid);
  const w = W(wid);
  if (!sess.items.length) { toast('Tick off at least one set first'); return; }
  const pbs = sessionPBs(sess.items);
  const total = sess.ticked + sess.filled;
  openSheet(`<h2 class="sh-title">Finish ${esc(w.name)}?</h2>
    <p class="sh-body">${total} set${total === 1 ? '' : 's'} will be saved${sess.filled ? `, including ${sess.filled} you filled in but didn't tick` : ''}.</p>
    ${pbs.length ? `<div style="margin-top:14px">${pbs.map(p => `<p style="margin-top:6px"><span class="pb">${ic('trophy')}New PB: ${esc(exOf(p.ex).name)} <b>${fmtSet(p.set)}</b></span></p>`).join('')}</div>` : ''}
    <div class="sh-actions"><button class="btn primary c-${w.cat}" data-a="finishOk">Finish and save</button><button class="btn ghost" data-a="sheetClose">Keep going</button></div>`);
}

/* ---- edit / add exercise form ---- */
function openForm(mode, wid, sid) {
  if (mode === 'edit') {
    const sl = slot(sid), e = exOf(selEx(sid));
    U.form = { mode, wid, sid, name: sl.name, opts: sl.opts.map(o => ({ ...o })), rest: sl.rest, p: [...e.p], s: [...e.s], counts: e.counts, sets: workingCount(sid) };
  } else {
    U.form = { mode, wid, name: '', opts: [{ label: '', ex: null }], rest: S.settings.rest, p: [], s: [], counts: true, sets: 3 };
  }
  drawForm();
}
function drawForm() {
  const F = U.form;
  const muscles = Object.keys(MUSCLES).map(m => {
    const st = F.p.includes(m) ? 'm-p' : F.s.includes(m) ? 'm-s' : '';
    return `<button class="chip ${st}" data-a="fMus" data-m="${m}">${esc(MUSCLES[m])}</button>`;
  }).join('');
  const optRows = F.mode === 'edit' ? `<div class="field"><span class="lbl">Options (shown as buttons, each keeps its own PB)</span>
      ${F.opts.map((o, i) => `<div class="opt-row"><input type="text" data-f="opt" data-k="${i}" value="${esc(o.label)}" placeholder="${F.opts.length > 1 ? 'Option name' : 'No options (one version only)'}">${F.opts.length > 1 ? `<button class="rm" data-a="fOptRm" data-k="${i}" aria-label="Remove option">${ic('minus')}</button>` : ''}</div>`).join('')}
      <button class="chip-btn plain" data-a="fOptAdd">${ic('plus')}Add an option</button></div>` : '';
  openSheet(`<h2 class="sh-title">${F.mode === 'edit' ? 'Edit exercise' : 'Add an exercise'}</h2>
    <div class="field"><label for="fName">Name</label><input type="text" id="fName" data-f="name" value="${esc(F.name)}" placeholder="e.g. Cable fly" autocomplete="off"></div>
    ${optRows}
    ${F.mode === 'add' ? `<div class="field"><span class="lbl">Sets</span><span class="stepper"><button data-a="fSets" data-d="-1" aria-label="One set fewer">−</button><b>${F.sets}</b><button data-a="fSets" data-d="1" aria-label="One more set">+</button></span></div>` : ''}
    <div class="field"><span class="lbl">Rest</span><div class="chips">${REST_CHOICES.map(v => `<button class="chip${v === F.rest ? ' on' : ''}" data-a="fRest" data-v="${v}">${fmtClock(v)}</button>`).join('')}</div></div>
    <div class="field"><span class="lbl">Muscles: tap once for main, twice for supporting</span><div class="chips">${muscles}</div></div>
    <div class="switch-row"><p>Count in set totals<small>Turn off for things like calves, shrugs and wrist curls</small></p><button class="switch${F.counts ? ' on' : ''}" data-a="fCounts" role="switch" aria-checked="${F.counts}" aria-label="Count in set totals"></button></div>
    <div class="sh-actions"><button class="btn primary" data-a="fSave">${F.mode === 'edit' ? 'Save changes' : 'Add exercise'}</button>
      ${F.mode === 'edit' ? `<button class="btn ghost" style="color:var(--danger)" data-a="fRemove">${ic('trash')}Remove from this workout</button>` : ''}
      <button class="btn ghost" data-a="sheetClose">Cancel</button></div>`);
}
function redrawForm() {
  const sh = $('.sheet');
  const y = sh ? sh.scrollTop : 0;
  drawForm();
  const sh2 = $('.sheet');
  if (sh2) { sh2.style.animation = 'none'; sh2.scrollTop = y; }
  const bd = $('.sheet-backdrop');
  if (bd) bd.style.animation = 'none';
}
function saveForm() {
  const F = U.form;
  const name = F.name.trim();
  if (!name) { toast('Give the exercise a name'); $('#fName') && $('#fName').focus(); return; }
  const w = W(F.wid);
  if (F.mode === 'add') {
    const ex = 'x' + uid();
    S.plan.ex[ex] = { name, cat: w.cat, p: [...F.p], s: [...F.s], counts: F.counts };
    const sid = `${F.wid}.${ex}`;
    S.plan.slots[sid] = { name, opts: [{ label: '', ex }], sets: Array(F.sets).fill('w'), rest: F.rest, ss: null };
    S.plan.workouts[F.wid].push(sid);
    historyChanged(); save(true); closeSheet(); render(true);
    toast(`${name} added`);
    return;
  }
  const sl = slot(F.sid);
  const cat = slotCat(F.wid, F.sid);
  const opts = F.opts.map(o => ({ ...o, label: o.label.trim() })).filter((o, i, arr) => o.ex || o.label || arr.length === 1);
  if (opts.length > 1 && opts.some(o => !o.label)) { toast('Give each option a name'); return; }
  const selectedEx = selEx(F.sid);
  for (const o of opts) {
    if (!o.ex) {
      o.ex = 'x' + uid();
      S.plan.ex[o.ex] = { name: opts.length > 1 ? `${name}, ${o.label}` : name, cat, p: [], s: [], counts: F.counts };
    }
    const e = S.plan.ex[o.ex];
    e.p = [...F.p]; e.s = [...F.s]; e.counts = F.counts;
    if (o.ex.startsWith('x')) e.name = opts.length > 1 ? `${name}, ${o.label}` : name;
  }
  sl.name = name;
  sl.opts = opts;
  sl.rest = F.rest;
  const idx = opts.findIndex(o => o.ex === selectedEx);
  S.sel[F.sid] = idx >= 0 ? idx : 0;
  historyChanged(); save(true); closeSheet(); render(true);
  toast('Changes saved');
}

/* ---------------- rest timer ---------------- */
let tmInt = 0;
function startRest(sec, cat) {
  S.timer = { end: Date.now() + sec * 1000, dur: sec, cat };
  save(true);
  drawTimer();
  wakeOn();
}
function drawTimer() {
  const el = $('#timer');
  const t = S.timer;
  clearInterval(tmInt); tmInt = 0;
  if (!t) { el.className = ''; el.innerHTML = ''; updateWake(); return; }
  el.className = `show c-${t.cat || 'pull'}${t.doneAt ? ' done' : ''}`;
  if (t.doneAt) {
    el.innerHTML = `<div class="tm-row"><div class="tm-text"><div class="tm-label">Rest over</div><div class="tm-time">Next set</div></div><button class="tm-btn go" data-a="tmSkip">OK</button></div>`;
    return;
  }
  el.innerHTML = `<div class="tm-fill"></div><div class="tm-row"><div class="tm-text"><div class="tm-label">Rest</div><div class="tm-time" id="tmTime"></div></div>
    <button class="tm-btn" data-a="tmSub" aria-label="15 seconds less">−15 s</button><button class="tm-btn" data-a="tmAdd" aria-label="15 seconds more">+15 s</button><button class="tm-btn" data-a="tmSkip">Skip</button></div>`;
  tickTimer();
  tmInt = setInterval(tickTimer, 250);
}
function tickTimer() {
  const t = S.timer;
  if (!t || t.doneAt) return;
  const left = (t.end - Date.now()) / 1000;
  if (left <= 0) { timerDone(); return; }
  const tt = $('#tmTime'), fill = $('#timer .tm-fill');
  if (tt) tt.textContent = fmtClock(left);
  if (fill) fill.style.width = `${Math.max(0, Math.min(100, (left / t.dur) * 100))}%`;
}
function timerDone() {
  clearInterval(tmInt); tmInt = 0;
  const late = Date.now() - S.timer.end;
  if (late > 60000) { S.timer = null; save(); drawTimer(); return; }
  S.timer.doneAt = Date.now();
  save();
  if (late < 3000 && document.visibilityState === 'visible') beep();
  drawTimer();
  updateWake();
  clearTimeout(U.tmHide);
  U.tmHide = setTimeout(() => { if (S.timer && S.timer.doneAt) { S.timer = null; save(); drawTimer(); } }, 12000);
}
let actx = null;
function audioUnlock() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
  } catch (e) { /* no audio */ }
}
function beep() {
  if (!S.settings.sound || !actx) return;
  try {
    const t0 = actx.currentTime + 0.02;
    [0, 0.3, 0.6].forEach((dt, k) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine';
      o.frequency.value = k === 2 ? 1320 : 990;
      g.gain.setValueAtTime(0.0001, t0 + dt);
      g.gain.exponentialRampToValueAtTime(0.6, t0 + dt + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.24);
      o.connect(g).connect(actx.destination);
      o.start(t0 + dt);
      o.stop(t0 + dt + 0.26);
    });
  } catch (e) { /* ignore */ }
}
let wakeLock = null;
async function wakeOn() {
  try {
    if ('wakeLock' in navigator && !wakeLock && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch (e) { wakeLock = null; }
}
function updateWake() {
  const want = (S.timer && !S.timer.doneAt) || (S.settings.awake && route().page === 'workout');
  if (want) wakeOn();
  else if (wakeLock) { try { wakeLock.release(); } catch (e) { /* ignore */ } wakeLock = null; }
}

/* ---------------- backup ---------------- */
async function exportBackup() {
  const d = new Date();
  const name = `lift-log-backup-${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}.json`;
  const data = JSON.stringify({ app: 'lift-log', v: 1, at: Date.now(), state: S });
  const file = new File([data], name, { type: 'application/json' });
  const done = () => { S.backupAt = Date.now(); save(true); render(true); toast('Backup saved'); };
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Lift Log backup' }); done(); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  done();
}
function importFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let o;
    try { o = JSON.parse(reader.result); } catch (e) { o = null; }
    if (!o || o.app !== 'lift-log' || !o.state || !o.state.plan || !Array.isArray(o.state.history)) {
      toast("That file isn't a Lift Log backup");
      return;
    }
    confirmSheet({
      title: `Restore the backup from ${fmtDate(o.at)}?`,
      body: `It has ${o.state.history.length} logged workout${o.state.history.length === 1 ? '' : 's'}. It replaces what's on this phone now (${S.history.length} logged). You can undo straight after.`,
      ok: 'Restore backup',
      onOk: () => {
        const snap = snapshot();
        try { localStorage.setItem(KEY + '.beforeRestore', snap); } catch (e) { /* ignore */ }
        let next;
        try { next = migrate(JSON.parse(JSON.stringify(o.state))); } catch (e) { closeSheet(); toast("That backup couldn't be read. Nothing was changed."); return; }
        S = next;
        S.backupAt = o.at || Date.now();
        historyChanged(); save(true); closeSheet(); render(); drawTimer();
        toast('Backup restored', { undo: () => restore(snap) });
      },
    });
  };
  reader.readAsText(file);
}

/* ---------------- actions ---------------- */
function nextInSuperset(wid, sid) {
  const list = listOf(wid, sid), i = list.indexOf(sid), ss = slot(sid).ss;
  return !!ss && i >= 0 && i < list.length - 1 && slot(list[i + 1]).ss === ss;
}
function setLabel(sid, i) {
  const sets = slot(sid).sets;
  if (sets[i] === 'd') return 'the drop set';
  return `set ${sets.slice(0, i + 1).filter(t => t === 'w').length}`;
}
function moveSlot(wid, sid, dir) {
  const list = listOf(wid, sid), i = list.indexOf(sid), j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  save(true); render(true);
  const el = $(`[data-slot="${sid}"]`);
  if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

const actions = {
  tick({ wid, sid, i, card }) {
    audioUnlock();
    const rows = rowsFor(wid, sid);
    const r = rows[i];
    if (r.done) {
      r.done = false;
      putRows(wid, sid, rows); save(true);
      rerenderCard(wid, sid); updateWkProgress(wid);
      return;
    }
    const ex = selEx(sid);
    const ph = placeholders(sid, ex)[i];
    const rowEl = card.querySelector(`.srow[data-i="${i}"]`);
    const kgIn = rowEl.querySelector('.kg').value.trim(), repsIn = rowEl.querySelector('.reps').value.trim();
    const kg = parseKg(kgIn !== '' ? kgIn : ph.kg), reps = parseReps(repsIn !== '' ? repsIn : ph.reps);
    if (kg == null || reps == null) {
      const bad = rowEl.querySelector(kg == null ? '.kg' : '.reps');
      bad.classList.remove('nudge'); void bad.offsetWidth; bad.classList.add('nudge');
      bad.focus();
      toast(kg == null ? 'Add the weight for this set (0 means bodyweight)' : 'Add the reps for this set');
      return;
    }
    const wasPB = pbFor(ex);
    rows[i] = { kg: kg === 0 ? 'BW' : fmtN(kg), reps: String(reps), done: true };
    putRows(wid, sid, rows); save(true);
    rerenderCard(wid, sid); updateWkProgress(wid);
    if (slot(sid).sets[i] === 'w' && wasPB && better({ kg, reps }, wasPB)) toast(`New PB: ${fmtSet({ kg, reps })}`);
    if (!nextInSuperset(wid, sid)) startRest(slot(sid).rest, slotCat(wid, sid));
  },
  opt({ wid, sid, el }) {
    const o = +el.dataset.o;
    if (o === selIdx(sid)) return;
    const label = slot(sid).opts[o].label;
    const rows = rowsFor(wid, sid);
    const apply = () => {
      if (!rows.some(r => r.done) && S.drafts[wid] && S.drafts[wid].rows[sid]) S.drafts[wid].rows[sid] = [];
      S.sel[sid] = o; save(true); closeSheet(); rerenderCard(wid, sid);
    };
    if (rows.some(r => r.done)) confirmSheet({ title: `Switch to ${label}?`, body: `The sets you've ticked will be saved under ${label}.`, ok: 'Switch', onOk: apply });
    else apply();
  },
  addSet({ wid, sid }) {
    const sl = slot(sid);
    let at = sl.sets.length;
    while (at > 0 && sl.sets[at - 1] === 'd') at--;
    sl.sets.splice(at, 0, 'w');
    for (const d of Object.values(S.drafts)) if (d.rows[sid] && d.rows[sid].length > at) d.rows[sid].splice(at, 0, emptyRow());
    save(true); rerenderCard(wid, sid); updateWkProgress(wid);
  },
  addDrop({ wid, sid }) {
    slot(sid).sets.push('d');
    save(true); rerenderCard(wid, sid);
  },
  rmSet({ wid, sid, i }) {
    const sl = slot(sid);
    if (sl.sets[i] === 'w' && workingCount(sid) <= 1) { toast('Every exercise needs at least one set. Use Edit details to remove the exercise.'); return; }
    const label = setLabel(sid, i);
    confirmSheet({
      title: `Remove ${label}?`,
      body: `It comes off ${sl.name} from now on. Sets already saved in your history stay.`,
      ok: `Remove ${label}`, danger: true,
      onOk: () => {
        const snap = snapshot();
        sl.sets.splice(i, 1);
        for (const d of Object.values(S.drafts)) if (d.rows[sid]) d.rows[sid].splice(i, 1);
        save(true); closeSheet(); render(true);
        toast(`${cap(label)} removed from ${sl.name}`, { undo: () => restore(snap) });
      },
    });
  },
  rest({ sid }) { restSheet(sid); },
  setRest({ el }) {
    const sid = el.dataset.slotId;
    slot(sid).rest = +el.dataset.v;
    save(true); closeSheet();
    const r = route();
    if (r.page === 'workout') rerenderCard(r.wid, sid);
  },
  anat({ sid }) { anatSheet(sid); },
  edit() { U.edit = !U.edit; render(true); },
  moveUp({ wid, sid }) { moveSlot(wid, sid, -1); },
  moveDown({ wid, sid }) { moveSlot(wid, sid, 1); },
  editEx({ wid, sid }) { openForm('edit', wid, sid); },
  addEx({ wid }) { openForm('add', wid); },
  absToggle({ wid }) {
    const open = !$('.abs-toggle').classList.contains('open');
    U.absOpen[wid] = open;
    render(true);
    if (open) { const t = $('.abs-toggle'); t && t.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  },
  finish({ wid }) { finishSheet(wid); },
  finishOk({ wid }) {
    const sess = sessionFromDraft(wid);
    if (!sess.items.length) { closeSheet(); return; }
    const snap = snapshot();
    const pbs = sessionPBs(sess.items);
    const d = S.drafts[wid];
    S.history.push({ id: uid(), w: wid, start: d.start, end: Date.now(), items: sess.items });
    delete S.drafts[wid];
    if (S.timer) S.timer = null;
    historyChanged(); save(true); closeSheet(); drawTimer();
    U.edit = false;
    const name = W(wid).name;
    location.hash = '#/';
    toast(pbs.length ? `${name} saved with ${pbs.length} new PB${pbs.length > 1 ? 's' : ''}` : `${name} saved`, { undo: () => restore(snap) });
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { /* ignore */ }
  },
  breakdown() { breakdownSheet(); },
  lift({ el }) { liftSheet(el.dataset.ex); },
  hist({ el }) { histSheet(el.dataset.id); },
  delHist({ el }) {
    const id = el.dataset.id;
    const s = S.history.find(x => x.id === id);
    confirmSheet({
      title: 'Delete this workout?',
      body: `${(W(s.w) || { name: 'Workout' }).name} on ${fmtDate(s.end)} will be removed from your history, PBs and progress. You can undo straight after.`,
      ok: 'Delete workout', danger: true,
      onOk: () => {
        const snap = snapshot();
        S.history = S.history.filter(x => x.id !== id);
        historyChanged(); save(true); closeSheet(); render(true);
        toast('Workout deleted', { undo: () => restore(snap) });
      },
    });
  },
  filter({ el }) { U.filter = el.dataset.v; render(true); },
  chartTable() { U.chartTable = !U.chartTable; render(true); },
  export() { exportBackup(); },
  restStep({ el }) {
    S.settings.rest = Math.min(600, Math.max(15, S.settings.rest + Number(el.dataset.d)));
    save(true); render(true);
  },
  toggle({ el }) {
    const k = el.dataset.k;
    S.settings[k] = !S.settings[k];
    save(true); render(true);
  },
  sheetClose() { closeSheet(); },
  confirmOk() { const f = U.confirmOk; U.confirmOk = null; if (f) f(); },
  undo() { const f = U.undo; hideToast(); if (f) f(); },
  toastAction() { const f = U.toastAction; hideToast(); if (f) f(); },
  tmAdd() { if (S.timer && !S.timer.doneAt) { S.timer.end += 15000; S.timer.dur += 15; save(); tickTimer(); } },
  tmSub() { if (S.timer && !S.timer.doneAt) { S.timer.end = Math.max(Date.now() + 1000, S.timer.end - 15000); save(); tickTimer(); } },
  tmSkip() { S.timer = null; save(true); drawTimer(); },
  fMus({ el }) {
    const F = U.form, m = el.dataset.m;
    if (F.p.includes(m)) { F.p = F.p.filter(x => x !== m); F.s.push(m); }
    else if (F.s.includes(m)) F.s = F.s.filter(x => x !== m);
    else F.p.push(m);
    redrawForm();
  },
  fRest({ el }) { U.form.rest = +el.dataset.v; redrawForm(); },
  fSets({ el }) { U.form.sets = Math.min(10, Math.max(1, U.form.sets + Number(el.dataset.d))); redrawForm(); },
  fCounts() { U.form.counts = !U.form.counts; redrawForm(); },
  fOptAdd() { U.form.opts.push({ label: '', ex: null }); redrawForm(); },
  fOptRm({ el }) { U.form.opts.splice(+el.dataset.k, 1); redrawForm(); },
  fSave() { saveForm(); },
  fRemove() {
    const F = U.form;
    const sl = slot(F.sid);
    const wid = F.wid, sid = F.sid;
    confirmSheet({
      title: `Remove ${sl.name}?`,
      body: `It comes off ${isAbsSlot(sid) ? 'your abs list' : W(wid).name}. Its history and PBs stay. You can undo straight after.`,
      ok: 'Remove exercise', danger: true,
      onOk: () => {
        const snap = snapshot();
        const list = listOf(wid, sid);
        list.splice(list.indexOf(sid), 1);
        save(true); closeSheet(); render(true);
        toast(`${sl.name} removed`, { undo: () => restore(snap) });
      },
    });
  },
};

/* ---------------- events ---------------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const a = el.dataset.a;
  if (!actions[a]) return;
  e.preventDefault();
  const card = el.closest('[data-slot]');
  const rowEl = el.closest('[data-i]');
  const r = route();
  actions[a]({ el, e, card, sid: card ? card.dataset.slot : (U.form && U.form.sid) || null, i: rowEl ? +rowEl.dataset.i : null, wid: r.wid || (U.form && U.form.wid) || null });
});

document.addEventListener('input', e => {
  const t = e.target;
  if (t.matches('.srow input')) {
    const card = t.closest('[data-slot]');
    const sid = card.dataset.slot, wid = route().wid, i = +t.closest('.srow').dataset.i;
    const rows = rowsFor(wid, sid);
    rows[i][t.classList.contains('kg') ? 'kg' : 'reps'] = t.value.trim();
    putRows(wid, sid, rows);
    save();
    if (rows[i].done) refreshRow(card, wid, sid, i);
  } else if (t.matches('.note')) {
    const sid = t.closest('[data-slot]').dataset.slot;
    const v = t.value;
    if (v.trim()) S.notes[sid] = v; else delete S.notes[sid];
    autoGrow(t);
    save();
  } else if (t.matches('[data-f]') && U.form) {
    if (t.dataset.f === 'name') U.form.name = t.value;
    else if (t.dataset.f === 'opt') U.form.opts[+t.dataset.k].label = t.value;
  }
});
function refreshRow(card, wid, sid, i) {
  const ex = selEx(sid);
  const rows = rowsFor(wid, sid);
  const ph = placeholders(sid, ex);
  const rowEl = card.querySelector(`.srow[data-i="${i}"]`);
  if (!rowEl || slot(sid).sets[i] === 'd') return;
  const pbRow = isPBRow(ex, rows[i], ph[i]);
  if (pbRow === rowEl.classList.contains('pbrow')) return;
  rowEl.classList.toggle('pbrow', pbRow);
  rowEl.querySelector('.sn').innerHTML = pbRow ? ic('trophy') : String(slot(sid).sets.slice(0, i + 1).filter(t => t === 'w').length);
}
document.addEventListener('change', e => {
  if (e.target.id === 'importFile' && e.target.files && e.target.files[0]) {
    importFile(e.target.files[0]);
    e.target.value = '';
  }
});
document.addEventListener('focusin', e => {
  if (e.target.matches('input[type="text"], textarea')) { clearTimeout(U.kbT); document.body.classList.add('kb'); }
});
document.addEventListener('focusout', e => {
  if (e.target.matches('input[type="text"], textarea')) {
    clearTimeout(U.kbT);
    U.kbT = setTimeout(() => document.body.classList.remove('kb'), 150);
  }
});
function autoGrow(t) { t.style.height = 'auto'; t.style.height = `${Math.max(42, t.scrollHeight)}px`; }
function onScroll() {
  const tb = $('#topbar');
  if (tb) tb.classList.toggle('scrolled', window.scrollY > 64);
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('hashchange', () => { U.edit = false; closeSheet(); render(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { writeNow(); return; }
  if (settleStaleDrafts()) render(true);
  if (S.timer && !S.timer.doneAt && S.timer.end <= Date.now()) timerDone();
  else drawTimer();
  updateWake();
});
window.addEventListener('pagehide', writeNow);

/* ---------------- start ---------------- */
function start() {
  S = load();
  settleStaleDrafts();
  if (S.timer && (S.timer.doneAt || S.timer.end < Date.now() - 60000)) S.timer = null;
  render();
  if (U.loadProblem) toast("Your saved data couldn't be read. A copy was kept; restore a backup in Settings.", { ms: 12000 });
  if (S.timer) { if (S.timer.end <= Date.now()) timerDone(); else drawTimer(); }
  save(true);
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline install not available */ });
    navigator.serviceWorker.ready.then(() => {
      let noted = null;
      try { noted = localStorage.getItem(KEY + '.offline'); localStorage.setItem(KEY + '.offline', '1'); } catch (e) { noted = '1'; }
      if (!hadController && !noted) toast('Saved to this phone. It now works offline.');
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController) toast('A new version of the app is ready', { action: 'Reload', onAction: () => { writeNow(); location.reload(); }, ms: 15000 });
    });
  }
}
start();
