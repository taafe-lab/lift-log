/* Muscle anatomy figure. Paths are drawn for the left half of a 100 x 220 figure
   (centre line x = 50) and mirrored for the right half. */
const ANATOMY = (() => {
  // Body outline, left half, closed along the centre line (overlaps so the halves join cleanly)
  const OUTLINE =
    'M50.6,17 L45.6,17 C45.6,22.5 45.3,26 44.5,28.4 C41,30.4 36,31.8 31,33 C25.6,34 20.6,35.2 18.4,39.4 ' +
    'C16.6,43.4 16.2,48 16.6,52.4 C15.8,57 15,63 14.7,69 C14.4,74 14.3,78 14.3,81.5 ' +
    'C13.3,87 12.2,94 11.7,101 C11.3,107 11.2,111 11.4,114.5 C10.2,117.5 9.4,121.5 9.8,125 ' +
    'C10.2,128 11.8,129.6 13.4,129.2 C15,128.6 15.7,126 15.8,123 C15.9,120 15.8,117 16.1,114.5 ' +
    'C17.2,108 18.4,101 19.5,94 C20.1,90 20.7,86 21.1,82.5 C21.6,77 22.2,71 22.8,65 ' +
    'C23.3,60 24,55.5 25.4,52 C26.6,56 27.8,61 28.6,66 C29.6,73 30.6,80 31.8,87 ' +
    'C32.4,91 32.6,94 32.2,97 C31.2,101 30,105 29.4,109 C28.6,113 28,118 27.8,123 ' +
    'C27.4,132 27.8,141 29,149 C30,155 31.2,160 32.2,163.5 C32.6,166 32.4,168.5 31.8,171 ' +
    'C31,177 31,183 32.4,190 C33.6,196 34.6,201 34.8,205 C34.4,208 33.4,210.6 33.8,212.4 ' +
    'C34.4,214 37.5,214.6 41.5,214.4 C44.2,214.2 45.6,213.4 45.6,211.6 C45.6,209.6 45,207.4 44.8,205 ' +
    'C45.2,199 46,193 46.6,187 C47.2,181 47,175 46,170 C45.6,167.5 45.8,165 46.2,162.5 ' +
    'C47,156 47.8,148 48.4,140 C49,132 49.4,125 49.8,119 L50,117 L50.6,117 Z';

  const DELT_SIDE = 'M22.2,37.4 C20.2,38.2 18.6,39.8 17.6,42.2 C16.8,44.6 16.6,47.6 17,50.4 C17.4,52 18.2,53.2 19.2,53.8 C20.6,53 22,51.6 23.4,49.4 C22.4,45.8 22,41.6 22.2,37.4 Z';
  const FOREARM = 'M15.5,83.5 C14.1,88.5 13.1,94.5 12.6,100.5 C12.3,105 12.3,109 12.6,112.6 L15.1,112.6 C16,107 17.4,100.5 18.7,94.5 C19.5,90.5 20.3,86.5 20.5,83.5 C18.9,82.6 17,82.6 15.5,83.5 Z';

  const FRONT = {
    traps: ['M44.8,25.5 C44.4,28.5 42,30.6 38,31.9 C35.5,32.7 33,33.2 30.8,33.6 C35,34.2 40,34 44.2,33.4 C45.4,31 45.4,28 44.8,25.5 Z'],
    frontDelts: ['M31,34.6 C27.4,34.8 24.4,35.8 22.6,37.6 C22.4,41.4 22.8,45.2 23.8,48.4 C24.4,49.8 25,50.8 25.6,51.2 C26.4,47.5 27.6,43 29.4,39.5 C30.2,37.8 31,36 31,34.6 Z'],
    sideDelts: [DELT_SIDE],
    chestUpper: ['M48.6,35.2 C44,34.8 38,35.4 33.6,36.6 C31,37.6 29.4,39.4 28.4,42 C28,43.2 27.8,44.4 27.8,45.4 C33,44.4 40.5,43.9 48.6,44.2 Z'],
    chestMid: ['M48.6,45.2 C40.5,44.9 33.4,45.4 27.8,46.6 C27.6,50 28.4,53.4 30.2,56 C32.8,58.8 36.6,60 40.6,59.8 C44,59.6 46.6,59 48.6,57.8 Z'],
    biceps: ['M20.8,54.6 C18.6,57.4 17.2,61.6 16.8,66.5 C16.5,71.5 17.2,76.5 18.4,80.2 C19.4,81.6 20.6,81.6 21.2,80.2 C22.2,75.5 22.5,70 22.3,64.5 C22.1,60.5 21.7,57.2 20.8,54.6 Z'],
    forearms: [FOREARM],
    abs: ['M48.6,61.2 C46.2,61.2 44,61.5 42.4,62.2 C41.8,70 41.8,80 42.2,90 C42.6,96 43.4,101 44.6,104.6 C45.8,106.6 47.2,107.8 48.6,108.4 Z'],
    obliques: ['M41.2,62.8 C36.6,64.4 33.2,67.6 31.4,71.8 C32,78 33,84 34,89.5 C35.6,94 37.8,98.6 41.6,102 C42.1,102.2 42.6,101.8 42.8,101.2 C41.6,95 41,88 40.8,80 C40.7,73.5 40.8,67.5 41.2,62.8 Z'],
    abductors: ['M30.8,104.6 C29.6,107.6 28.8,111.4 28.8,115.6 C28.8,116.6 29,117.2 29.4,117.4 C30.8,116 32.2,114 33.2,111.6 C33.6,109.4 33.4,107.2 32.6,105.6 C32,104.9 31.4,104.6 30.8,104.6 Z'],
    quads: ['M30.6,116.5 C29.4,124 29.2,133 30.2,141.5 C31.2,149 33.2,155.5 35.8,159.6 C37.6,162 39.8,163 41.6,162.6 C43.6,162 44.8,160 45.4,157 C46,152.6 46.2,148 45.9,144.4 C44.2,138 43,130 42.8,122 C42.8,120.8 42.9,119.8 43,119 C40,117.3 35.4,116.4 30.6,116.5 Z'],
    adductors: ['M49.6,120.4 C47.6,120.6 45.8,120.2 44.2,119.6 C44,127 45,134.6 46.6,141.6 C47,143.4 47.4,144.8 47.8,145.6 C48.4,138 49.1,129 49.6,120.4 Z'],
    calves: ['M45.8,170.4 C46.6,175.4 46.4,181.6 45.4,187 C44.8,189.6 44,191 43.2,191.2 C42.6,185 42.4,178.6 43,173 C43.6,171.2 44.6,170.4 45.8,170.4 Z'],
    shin: ['M33.4,170 C32.6,176 32.8,183 34.2,190 C35,193.6 36,196 37,197 C38,192 38.4,185 38.2,178 C38,174 37.4,171.4 36.4,169.8 C35.4,169.4 34.4,169.5 33.4,170 Z'],
  };
  const FRONT_LINES = [
    'M42.2,69.6 C44.4,69.2 46.6,69.2 48.6,69.4',
    'M42,78 C44.2,77.6 46.6,77.6 48.6,77.8',
    'M42.4,86.6 C44.6,86.2 46.6,86.2 48.6,86.4',
    'M37.4,118 C38.6,128 39.6,140 40.4,152 C40.8,156 41,159 41,162',
    'M45.6,147 C43.4,150 42.2,154 42.4,159.6',
    'M38.2,163.8 C38.4,166.6 39.4,168.2 40.6,168.2 C41.8,168.2 42.6,166.6 42.6,163.8',
  ];

  const BACK = {
    traps: ['M50,25 C48.6,26.4 46.8,28.2 44.6,29.2 C40.6,31.2 35.6,32.6 30.6,33.8 C34.6,35.6 38.6,38.4 41.6,42.4 C44.4,47.4 46.8,54.6 48.4,61.4 C48.9,63.2 49.5,64.4 50,64.8 Z'],
    rearDelts: ['M30.4,35 C27,35.2 24.4,36 22.6,37.6 C22.4,41.4 22.8,45.2 23.8,48.4 C24.4,49.8 25,50.8 25.6,51 C26.6,47.6 28,44.2 29.8,41.6 C30.8,40 31,37 30.4,35 Z'],
    sideDelts: [DELT_SIDE],
    upperBack: ['M30.8,37.2 C29.2,40 28.6,43.6 28.8,47.4 C29.4,50.4 30.8,52.8 33,54.4 C35.8,55.4 38.6,54.6 41.2,52.6 C42.4,51.6 43,50.4 42.8,49 C41.6,45.2 39,41.6 35.8,39.2 C34.2,38.2 32.6,37.4 30.8,37.2 Z'],
    lats: ['M28.6,50.6 C27.6,55 27.8,60 28.6,65 C29.6,71.5 31,78 33,84 C34.6,88.6 36.6,92.4 39,95.2 C40.2,93 41.6,88.6 43.2,83 C44.6,77.6 46,72 47.2,67.6 C46,64.8 44.4,61.6 42.6,58.8 C40.6,57.2 38.2,56.4 35.6,56.2 C33,55.6 30.6,53.6 28.6,50.6 Z'],
    lowerBack: ['M49.4,66.6 C47.8,70.2 46.6,74.6 45.8,79.6 C45,85.4 45,91.4 45.6,97.4 C46,99.6 47,101.4 48.4,102.4 C49,102.6 49.4,102.4 49.4,102 Z'],
    triceps: ['M17.4,55 C16.3,59 15.5,63.4 15.3,68.4 C15.1,72.8 15.7,77 16.9,80.6 C18.1,82.2 19.6,82.6 20.7,81.6 C21.9,77 22.5,71 22.3,65 C22.1,61 21.2,57.2 20,54.8 C19.2,54.4 18.2,54.5 17.4,55 Z'],
    forearms: [FOREARM],
    abductors: ['M38,98.6 C34.4,99.2 31.4,101.2 30,104.4 C29.4,106.2 29.2,108.4 29.6,110.4 C31.6,108.6 34,107.2 37,106.2 C39.4,105.4 41.6,104.8 43,104.2 C42.4,101 40.6,98.8 38,98.6 Z'],
    glutes: ['M48.8,103.6 C44.8,103 40.2,103.6 35.6,105.6 C32.6,107.6 30.8,110.8 30.4,114.6 C30.2,118.6 31.4,122 33.8,124.4 C36.8,126.6 40.6,127.4 44.4,127 C46.6,126.6 48.2,125.6 49,124.2 C49.4,117.4 49.4,110.6 48.8,103.6 Z'],
    hamstrings: ['M31.2,128.4 C30.4,134.8 30.8,141.4 32,147.6 C33.2,153.2 35,157.8 37.4,160.8 C38.8,162 40.4,162.4 41.8,161.8 C43.8,160 45.2,156.4 45.8,152 C46.4,146 46.4,139.6 46,133.4 C45.8,131.2 45.4,129.4 44.8,128.2 C40.4,129 35.8,129.2 31.2,128.4 Z'],
    adductors: ['M49.6,126.4 C48.4,127.6 47.4,129.6 46.8,132 C47,136.6 47.8,140.4 48.8,142.2 C49.2,137.6 49.5,131.6 49.6,126.4 Z'],
    calves: ['M32.6,168 C31.4,173.4 31.4,179.6 32.8,185.6 C33.8,190 35.6,193.2 37.8,194.2 C39.2,194.6 40.2,193.8 40.6,192.2 C41.4,193.6 42.6,194 43.6,193 C45.6,189.6 46.6,184.6 46.6,179 C46.6,174.4 45.8,170.4 44.8,167.6 C40.8,166.4 36.6,166.6 32.6,168 Z'],
  };
  const BACK_LINES = [
    'M38.6,130.4 C38.8,140 39,150 39.4,160.6',
    'M40.6,169 C40.6,177 40.6,185 40.6,192.2',
  ];

  // Which view shows a muscle best
  const PREF = {
    chestUpper: 'front', chestMid: 'front', frontDelts: 'front', biceps: 'front', abs: 'front', obliques: 'front',
    quads: 'front', adductors: 'front', rearDelts: 'back', triceps: 'back', lats: 'back', upperBack: 'back',
    lowerBack: 'back', glutes: 'back', hamstrings: 'back', calves: 'back', traps: 'back', abductors: 'back', sideDelts: 'front',
  };

  // Bounding boxes from path coordinates (y only is needed for cropping)
  const yRange = {};
  for (const view of ['front', 'back']) {
    const set = view === 'front' ? FRONT : BACK;
    for (const [m, paths] of Object.entries(set)) {
      const ys = paths.join(' ').match(/-?\d+(\.\d+)?/g).map(Number).filter((_, i) => i % 2 === 1);
      yRange[view + ':' + m] = [Math.min(...ys), Math.max(...ys)];
    }
  }

  function pickView(primary, secondary) {
    let f = 0, b = 0;
    for (const m of primary) { if (PREF[m] === 'front') f += 2; else if (PREF[m] === 'back') b += 2; }
    for (const m of secondary) { if (PREF[m] === 'front') f += 1; else if (PREF[m] === 'back') b += 1; }
    return b > f ? 'back' : 'front';
  }

  function cropFor(view, muscles) {
    let lo = 999, hi = -1;
    for (const m of muscles) {
      const r = yRange[view + ':' + m];
      if (r) { lo = Math.min(lo, r[0]); hi = Math.max(hi, r[1]); }
    }
    if (hi < 0) return [0, 0, 100, 220];
    let top = lo - 16, bottom = hi + 16;
    const minH = 124;
    if (bottom - top < minH) { const c = (top + bottom) / 2; top = c - minH / 2; bottom = c + minH / 2; }
    if (top < 0) { bottom -= top; top = 0; }
    if (bottom > 220) { top -= bottom - 220; bottom = 220; }
    top = Math.max(0, top);
    return [0, Math.round(top), 100, Math.round(bottom - top)];
  }

  // fill: function(muscleId) -> '' | 'p' | 's' | {style}
  function figure(view, classFor, styleFor) {
    const set = view === 'front' ? FRONT : BACK;
    const lines = view === 'front' ? FRONT_LINES : BACK_LINES;
    let half = `<path class="a-body" d="${OUTLINE}"/>`;
    for (const [m, paths] of Object.entries(set)) {
      const c = classFor ? classFor(m) : '';
      const st = styleFor ? styleFor(m) : '';
      for (const d of paths) half += `<path class="a-m${c ? ' ' + c : ''}"${st ? ` style="${st}"` : ''} d="${d}"/>`;
    }
    for (const d of lines) half += `<path class="a-line" d="${d}"/>`;
    return `<g>${half}</g><g transform="matrix(-1 0 0 1 100 0)">${half}</g>` +
      `<ellipse class="a-body" cx="50" cy="13" rx="8.2" ry="10.2"/>`;
  }

  // Single figure, cropped to the highlighted area (for exercise cards)
  function thumb(primary, secondary) {
    const view = pickView(primary, secondary);
    const vb = cropFor(view, [...primary, ...secondary]);
    const p = new Set(primary), s = new Set(secondary);
    const cls = m => (p.has(m) ? 'p' : s.has(m) ? 's' : '');
    return `<svg class="anat" viewBox="${vb.join(' ')}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${figure(view, cls)}</svg>`;
  }

  // Front and back side by side
  function pair(primary, secondary, styleFor) {
    const p = new Set(primary), s = new Set(secondary);
    const cls = styleFor ? null : (m => (p.has(m) ? 'p' : s.has(m) ? 's' : ''));
    return `<svg class="anat" viewBox="0 0 214 222" aria-hidden="true">` +
      `<g transform="translate(2 1)">${figure('front', cls, styleFor)}</g>` +
      `<g transform="translate(112 1)">${figure('back', cls, styleFor)}</g></svg>`;
  }

  return { thumb, pair, pickView };
})();
