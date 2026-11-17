// 11 días sin dormir — Short 9:16, photo version. Pure function of time: window.seek(t) paints frame t.
// Timing comes from timing.json (derived from the aligned voice-over); photos from assets/img/.
import * as M from './lib/motion.js';

const { W, H, E, prog, lerp, clamp, spring, SPRING, font, layout, glyph, text, fill, rrect, hash01, noise1, mix, bump } = M;

const C = { bg: '#0B0B10', ink: '#F4EFE6', dim: '#C9C4BC', accent: '#FF3B30', paper: '#EDE4D3', paperInk: '#2A2420' };
const D = 'Display', UI = 'UI';
const sp = (t, t0, cfg = SPRING.snappy) => spring(t - t0, cfg);

// Filled from timing.json in init().
const S = [];
const T = {};
const sec = (t) => { let i = 0; while (i + 1 < S.length && t >= S[i + 1]) i++; return i; };

// Visual accents -> synthesized SFX (sfx.mjs reads beats; grid is 0.5 s per beat).
const B = (s) => s / 0.5;
const HITS = [];
const hitList = () => [
  [B(0.0), '11 slams', 'impact'],
  [B(S[1]), 'cut to 1964 room', 'whoosh', { len: 0.35 }],
  [B(T.age), 'circle 17', 'whoosh', { len: 0.25, from: 1800, to: 900 }],
  [B(T.year), '1964 stamp', 'thud'],
  [B(T.d2), 'day 2 number', 'impact'],
  [B(T.d4), 'day 4 number', 'impact'],
  [B(T.persona), 'sign talks', 'pop', { pitch: 'E5' }],
  [B(S[4]), 'cut to stadium', 'whoosh', { len: 0.35 }],
  [B(T.famoso), 'quote stamp', 'thud'],
  [B(T.d7), 'day 7 number', 'impact'],
  [B(T.d11), 'day 11 number', 'impact'],
  [B(T.cien), '100', 'tick'],
  [B(T.n65), '65 breaks', 'impact'],
  [B(S[7]), 'counter starts', 'whoosh', { len: 0.4, from: 400, to: 2400 }],
  [B(T.duerme), 'lights out', 'tick'],
  [B(S[8]), 'record book', 'whoosh', { len: 0.35 }],
  [B(T.prohibido), 'PROHIBIDO stamp', 'impact'],
  [B(S[9]), 'back to the eye', 'whoosh', { len: 0.4 }],
];

let CAP = { captions: [] };
let IMG = {};

// ------------------------------------------------------------------ kit
function bigText(ctx, str, x, y, size, color, { align = 'center', family = D, weight = 400, track = 0, scale = 1, rot = 0, alpha = 1, stroke = 0 } = {}) {
  if (scale <= 0.001 || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= clamp(alpha); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale);
  if (stroke) {
    ctx.font = font(size, weight, family); ctx.letterSpacing = `${track}px`; ctx.textAlign = align;
    ctx.lineJoin = 'round'; ctx.lineWidth = stroke; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(str, 0, 0); ctx.letterSpacing = '0px';
  }
  text(ctx, str, 0, 0, font(size, weight, family), color, align, track);
  ctx.restore();
}

// Full-bleed photo with a Ken Burns move (log-space zoom), optional blur / grade.
function photo(ctx, key, t, t0, t1, { z0 = 1.04, z1 = 1.16, fx0 = 0.5, fx1 = 0.5, fy0 = 0.5, fy1 = 0.5, dark = 0.25, blur = 0, gray = 0, sepia = 0 } = {}) {
  const im = IMG[key];
  if (!im) { fill(ctx, C.bg); return; }
  const p = E.inOutSine(prog(t, t0, t1));
  const z = Math.exp(lerp(Math.log(z0), Math.log(z1), p));
  const s = Math.max(W / im.width, H / im.height) * z;
  const dw = im.width * s, dh = im.height * s;
  const fx = lerp(fx0, fx1, p), fy = lerp(fy0, fy1, p);
  ctx.save();
  const f = [];
  if (blur) f.push(`blur(${blur.toFixed(1)}px)`);
  if (gray) f.push(`grayscale(${gray})`);
  if (sepia) f.push(`sepia(${sepia})`);
  f.push('contrast(1.08) saturate(1.05)');
  ctx.filter = f.join(' ');
  ctx.drawImage(im, (W - dw) * fx, (H - dh) * fy, dw, dh);
  ctx.filter = 'none';
  ctx.fillStyle = `rgba(5,5,10,${dark})`; ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(0.2, 'rgba(0,0,0,0)');
  g.addColorStop(0.6, 'rgba(0,0,0,0)'); g.addColorStop(0.75, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function dayCard(ctx, t, t0, n, cx, cy, tn = t0) {
  const k = sp(t, t0, SPRING.bouncy), flip = E.outCubic(prog(t, t0, t0 + 0.25));
  if (k <= 0) return;
  const w = 460, h = 500;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k * lerp(0.2, 1, flip)); ctx.rotate(-0.04);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; rrect(ctx, -w / 2 + 16, -h / 2 + 22, w, h, 34); ctx.fill();
  ctx.fillStyle = C.ink; rrect(ctx, -w / 2, -h / 2, w, h, 34); ctx.fill();
  ctx.fillStyle = C.accent; ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, 34); ctx.clip(); ctx.fillRect(-w / 2, -h / 2, w, 135); ctx.restore();
  for (const x of [-125, 125]) { ctx.fillStyle = '#2A2A30'; rrect(ctx, x - 14, -h / 2 - 34, 28, 80, 14); ctx.fill(); }
  text(ctx, 'DÍA', 0, -h / 2 + 106, font(92, 400, D), C.ink, 'center', 6);
  const kn = sp(t, tn - 0.05, SPRING.bouncy);
  if (kn > 0) { ctx.save(); ctx.translate(0, h / 2 - 170); ctx.scale(Math.min(1.15, kn), Math.min(1.15, kn)); text(ctx, String(n), 0, 110, font(n > 9 ? 290 : 320, 400, D), '#14141A', 'center'); ctx.restore(); }
  ctx.restore();
}

function tracker(ctx, t) {
  const on = prog(t, S[2] - 0.2, S[2] + 0.2) * (1 - prog(t, S[7] - 0.1, S[7] + 0.2));
  if (on <= 0) return;
  const day = t < S[3] ? 2 : t < S[5] ? 4 : t < S[6] ? 7 : 11;
  const prevDay = t < S[3] ? 0 : t < S[5] ? 2 : t < S[6] ? 4 : 7;
  const t0 = [T.d2, T.d4, T.d7, T.d11][[2, 4, 7, 11].indexOf(day)] - 0.1;
  const fillTo = lerp(prevDay, day, E.outCubic(prog(t, t0 + 0.1, t0 + 0.7)));
  const x0 = 110, x1 = W - 110, y = 300, gap = 10, n = 11, sw = (x1 - x0 - gap * (n - 1)) / n;
  ctx.save(); ctx.globalAlpha = on;
  text(ctx, 'NOCHES SIN DORMIR', x0, y - 26, font(34, 800, UI), C.dim, 'left', 3);
  text(ctx, `${Math.round(fillTo)} / 11`, x1, y - 26, font(40, 400, D), C.ink, 'right', 2);
  for (let i = 0; i < n; i++) {
    const f = clamp(fillTo - i);
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; rrect(ctx, x0 + i * (sw + gap), y, sw, 22, 6); ctx.fill();
    if (f > 0) { ctx.fillStyle = mix('#FF9F0A', C.accent, i / 10); rrect(ctx, x0 + i * (sw + gap), y, sw * f, 22, 6); ctx.fill(); }
  }
  ctx.restore();
}

// Eyelids closing over the frame: 0 = open, 1 = shut.
function lids(ctx, k) {
  if (k <= 0) return;
  const h = (H / 2 + 420) * k, sag = 260;
  ctx.save(); ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, h - sag); ctx.quadraticCurveTo(W / 2, h + sag, 0, h - sag); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W, H); ctx.lineTo(W, H - h + sag); ctx.quadraticCurveTo(W / 2, H - h - sag, 0, H - h + sag); ctx.closePath(); ctx.fill();
  ctx.restore();
}

const VCY = 760;

// ------------------------------------------------------------------ scenes
function sHook(ctx, t) {
  photo(ctx, 'eye', t, 0, S[1], { z0: 1.0, z1: 1.28, fy0: 0.45, fy1: 0.5, dark: 0.12 });
  ctx.save(); ctx.globalAlpha = 0.16 * bump(t % 0.95, 0.08, 0.12); ctx.fillStyle = C.accent; ctx.fillRect(0, 0, W, H); ctx.restore();
  const k = sp(t, -0.12, SPRING.bouncy);
  ctx.save(); M.shake(ctx, B(t), B(0.0), 16);
  bigText(ctx, '11', W / 2, 520, 320, C.accent, { scale: lerp(2.4, 1, Math.min(1, k)) * (k > 0 ? 1 : 0), alpha: k * 3, stroke: 18 });
  ctx.restore();
  const k2 = sp(t, 0.25, SPRING.snappy);
  bigText(ctx, 'DÍAS SIN DORMIR', W / 2, 630 + (1 - k2) * 60, 112, C.ink, { alpha: k2, track: 2, stroke: 14 });
}

function sNews(ctx, t) {
  photo(ctx, 'room1964', t, S[1], S[2], { z0: 1.05, z1: 1.2, fx0: 0.4, fx1: 0.6, dark: 0.3, sepia: 0.35 });
  const k = sp(t, S[1] + 0.15, SPRING.gentle);
  const pw = 760, ph = 640, px = W / 2 - pw / 2 + (1 - k) * W, py = 380;
  ctx.save(); ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate(0.03 - (1 - k) * 0.2); ctx.translate(-(px + pw / 2), -(py + ph / 2));
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(px + 18, py + 24, pw, ph);
  ctx.fillStyle = C.paper; ctx.fillRect(px, py, pw, ph);
  text(ctx, 'EL DIARIO DE LA CIENCIA', px + pw / 2, py + 82, font(58, 400, D), C.paperInk, 'center', 4);
  ctx.fillStyle = C.paperInk; ctx.fillRect(px + 36, py + 104, pw - 72, 6); ctx.fillRect(px + 36, py + 116, pw - 72, 2);
  text(ctx, 'SAN DIEGO · ENERO DE 1964', px + pw / 2, py + 156, font(26, 800, UI), '#6B5F55', 'center', 4);
  const bx = px + 36, by = py + 180, bw = 330, bh = 400;
  if (IMG.room1964) {
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip(); ctx.filter = 'grayscale(1) sepia(0.4) contrast(1.2)';
    M.cover(ctx, IMG.room1964, bx, by, bw, bh, { fx: 0.5, fy: 0.45, zoom: 1.2 }); ctx.filter = 'none'; ctx.restore();
  }
  const hx = bx + bw + 26, hw = pw - bw - 98;
  ['CHICO DE 17', 'AÑOS INTENTA', 'NO DORMIR'].forEach((l, i) => {
    ctx.font = font(70, 400, D); const sz = Math.min(70, 70 * hw / ctx.measureText(l).width);
    text(ctx, l, hx, by + 58 + i * 64, font(sz, 400, D), C.paperInk, 'left');
  });
  ctx.fillStyle = '#B3A894';
  for (let i = 0; i < 8; i++) ctx.fillRect(hx, by + 236 + i * 20, hw * (0.6 + 0.4 * hash01(i, 2)), 8);
  const cp = E.inOutCubic(prog(t, T.age - 0.05, T.age + 0.45));
  if (cp > 0) {
    ctx.strokeStyle = C.accent; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath();
    const ccx = hx + hw / 2, ccy = by + 96;
    for (let i = 0; i <= 60 * cp; i++) { const a = -2.6 + (i / 60) * Math.PI * 2.15; const r = 1 + 0.04 * Math.sin(i * 0.4);
      ctx.lineTo(ccx + Math.cos(a) * (hw / 2 + 24) * r, ccy + Math.sin(a) * 120 * r); }
    ctx.stroke();
  }
  ctx.restore();
  const kn = sp(t, T.randy - 0.1, SPRING.snappy) * (1 - E.inCubic(prog(t, T.feria - 0.25, T.feria - 0.05)));
  if (kn > 0) {
    ctx.save(); ctx.fillStyle = C.accent; const nw = 760 * Math.min(1, kn);
    ctx.fillRect(W / 2 - 380, 1080, nw, 120); ctx.beginPath(); ctx.rect(W / 2 - 380, 1080, nw, 120); ctx.clip();
    text(ctx, 'RANDY GARDNER', W / 2, 1172, font(104, 400, D), C.ink, 'center', 3); ctx.restore();
  }
  const ky = sp(t, T.year - 0.05, SPRING.bouncy);
  if (ky > 0) {
    ctx.save(); ctx.translate(W - 230, 960); ctx.rotate(-0.18); const sc = lerp(2, 1, Math.min(1, ky)); ctx.scale(sc, sc);
    ctx.globalAlpha = Math.min(1, ky * 2); ctx.strokeStyle = C.accent; ctx.lineWidth = 10; rrect(ctx, -170, -78, 340, 150, 18); ctx.stroke();
    text(ctx, '1964', 0, 44, font(124, 400, D), C.accent, 'center', 4); ctx.restore();
  }
  const kf = sp(t, T.feria - 0.1, SPRING.bouncy);
  if (kf > 0) {
    ctx.save(); ctx.translate(W / 2, 1140); ctx.rotate(-0.02); ctx.scale(Math.min(1.1, kf), Math.min(1.1, kf));
    ctx.fillStyle = C.ink; rrect(ctx, -400, -66, 800, 132, 24); ctx.fill();
    text(ctx, 'FERIA DE CIENCIAS', 0, 40, font(100, 400, D), C.bg, 'center', 3); ctx.restore();
  }
}

function sDay2(ctx, t) {
  // vision fails: the photo blurs and splits into double vision
  const bl = E.outCubic(prog(t, T.ojos, T.enfocar + 0.5));
  const off = 26 * bl * (1 + 0.3 * Math.sin(t * 3));
  photo(ctx, 'desk', t, S[2], S[3], { z0: 1.08, z1: 1.2, dark: 0.2, blur: 10 * bl });
  if (bl > 0) {
    ctx.save(); ctx.globalAlpha = 0.35 * bl; ctx.globalCompositeOperation = 'screen';
    ctx.translate(off, 0); photo(ctx, 'desk', t, S[2], S[3], { z0: 1.08, z1: 1.2, dark: 0.2, blur: 10 * bl });
    ctx.restore();
  }
  const card = 1 - E.inBack(prog(t, T.ojos - 0.25, T.ojos + 0.05));
  if (card > 0) { ctx.save(); ctx.globalAlpha = card; dayCard(ctx, t, S[2] - 0.05, 2, W / 2, VCY, T.d2); ctx.restore(); }
  [[W / 2 - 250, 560], [W / 2 + 240, 640], [W / 2 - 180, 940], [W / 2 + 220, 1000]].forEach(([x, y], i) => {
    const q = sp(t, T.reconoce + i * 0.12, SPRING.bouncy);
    if (q > 0) bigText(ctx, '?', x, y, 190, C.accent, { scale: Math.min(1.2, q), rot: 0.2 * (i % 2 ? 1 : -1), stroke: 14 });
  });
}

// Real-text STOP sign composited onto the foggy street photo (lit from the streetlight, slightly hazed).
function stopSign(ctx, cx, cy, r, t) {
  ctx.save();
  ctx.fillStyle = '#2B2E33'; ctx.fillRect(cx - 12, cy, 24, H);
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetX = 12;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
  ctx.closePath();
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, '#E0352B'); g.addColorStop(1, '#8E1A16');
  ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 12; ctx.strokeStyle = '#E9E4DA'; ctx.stroke();
  ctx.font = font(r * 0.62, 800, UI); ctx.fillStyle = '#F2EEE6'; ctx.textAlign = 'center';
  ctx.fillText('STOP', cx, cy + r * 0.22);
  // haze + sheen so it sits in the photo
  const h = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.5, 10, cx, cy, r * 1.2);
  h.addColorStop(0, 'rgba(255,220,180,0.25)'); h.addColorStop(1, 'rgba(120,120,130,0.18)');
  ctx.fillStyle = h; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; ctx.lineTo(cx + Math.cos(a) * (r + 6), cy + Math.sin(a) * (r + 6)); }
  ctx.fill();
  ctx.restore();
}

function sDay4(ctx, t) {
  const alive = sp(t, T.persona - 0.05, SPRING.wobbly);
  const push = 1 + 0.12 * E.outCubic(prog(t, T.persona - 0.1, T.persona + 0.4));
  ctx.save(); ctx.translate(W / 2, VCY); ctx.scale(push, push); ctx.translate(-W / 2, -VCY);
  photo(ctx, 'stopsign', t, S[3], S[4], { z0: 1.05, z1: 1.18, dark: 0.15 });
  stopSign(ctx, W / 2 - 60, 620, 210, t);
  ctx.restore();
  const card = 1 - E.inBack(prog(t, T.senal - 0.6, T.senal - 0.3));
  if (card > 0) { ctx.save(); ctx.globalAlpha = card; dayCard(ctx, t, S[3] - 0.05, 4, W / 2, VCY, T.d4); ctx.restore(); }
  if (alive > 0) {
    ctx.save(); ctx.globalAlpha = 0.25 * bump(t, T.persona, 0.12); ctx.fillStyle = C.accent; ctx.fillRect(0, 0, W, H); ctx.restore();
    const q = Math.min(1.1, alive);
    ctx.save(); ctx.translate(W / 2 + 170, 520); ctx.rotate(0.06); ctx.scale(q, q);
    ctx.fillStyle = C.ink; rrect(ctx, -230, -95, 460, 170, 40); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-120, 70); ctx.lineTo(-170, 150); ctx.lineTo(-40, 70); ctx.fill();
    text(ctx, '¿HOLA?', 0, 32, font(110, 400, D), C.bg, 'center', 3); ctx.restore();
  }
}

function sStadium(ctx, t) {
  photo(ctx, 'stadium', t, S[4], S[5], { z0: 1.15, z1: 1.02, dark: 0.15, gray: 0.3 });
  const q = sp(t, T.famoso - 0.1, SPRING.bouncy);
  if (q > 0) {
    ctx.save(); M.shake(ctx, B(t), B(T.famoso), 10);
    ctx.translate(W / 2, 700); ctx.rotate(-0.06); const sc = lerp(1.8, 1, Math.min(1, q)); ctx.scale(sc, sc);
    ctx.fillStyle = C.ink; rrect(ctx, -400, -95, 800, 160, 22); ctx.fill();
    text(ctx, '“SOY PAUL LOWE”', 0, 36, font(104, 400, D), C.bg, 'center', 2); ctx.restore();
  }
  const s2 = sp(t, T.futbol - 0.05, SPRING.snappy);
  if (s2 > 0) bigText(ctx, '(NO LO ERA)', W / 2, 860, 64, C.ink, { alpha: s2, track: 6, family: UI, weight: 800, stroke: 10 });
}

function sDay7(ctx, t) {
  const amp = 4 + 18 * clamp((t - T.tiemblan + 0.3) / 0.5);
  ctx.save(); ctx.translate(noise1(t * 28, 11) * amp, noise1(t * 25, 21) * amp);
  photo(ctx, 'hands', t, S[5], S[6], { z0: 1.1, z1: 1.2, dark: 0.2 });
  ctx.restore();
  const card = 1 - E.inBack(prog(t, T.arrastra - 0.15, T.arrastra + 0.1));
  if (card > 0) { ctx.save(); ctx.globalAlpha = card; dayCard(ctx, t, S[5] - 0.05, 7, W / 2, VCY, T.d7); ctx.restore(); }
  if (t < T.arrastra - 0.1) return;
  const word = 'PALABRAS', f = font(180, 400, D), L = layout(ctx, word, f, 4);
  const x0 = W / 2 - L.width / 2, base = 640;
  L.glyphs.forEach((g, i) => {
    const k = spring(t - (T.arrastra - 0.1 + i * 0.1), { stiffness: 30, damping: 9 });
    if (k <= 0) return;
    const sag = 50 * Math.sin(i * 0.9 + t * 1.5) * clamp(k);
    for (let j = 4; j >= 0; j--) {
      ctx.save(); ctx.globalAlpha = j === 0 ? 1 : 0.15;
      ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = j === 0 ? 18 : 0;
      glyph(ctx, g.ch, x0 + g.cx - (1 - k) * 300 - j * 22, base + sag + j * 10, f, j === 0 ? C.ink : C.accent, 1, 1 + j * 0.02);
      ctx.restore();
    }
  });
}

function sDay11(ctx, t) {
  const black = t >= T.n65 + 0.12 && t < T.olvida - 0.05;
  if (black) fill(ctx, '#000');
  else photo(ctx, 'chalkboard', t, S[6], S[7], { z0: 1.05, z1: 1.22, dark: 0.35 });
  const card = 1 - E.inBack(prog(t, T.cien - 1.5, T.cien - 1.2));
  if (card > 0) { ctx.save(); ctx.globalAlpha = card; dayCard(ctx, t, S[6] - 0.05, 11, W / 2, VCY, T.d11); ctx.restore(); }
  if (t >= T.cien - 1.1 && t < T.n65 + 0.12) {
    const eq = sp(t, T.cien - 1.1, SPRING.snappy);
    bigText(ctx, '100 − 7 − 7 − 7…', W / 2, VCY - 260, 96, C.ink, { alpha: eq, track: 2, stroke: 12 });
    const seq = [[T.cien, '100'], [T.cien + 0.15, '93'], [T.cien + 0.3, '86'], [T.cien + 0.42, '79'], [T.detiene + 0.05, '72'], [T.n65 - 0.02, '65']];
    let cur = null; for (const [tt, s] of seq) if (t >= tt - 0.02) cur = [tt, s];
    if (cur) {
      const k = sp(t, cur[0] - 0.02, SPRING.bouncy);
      bigText(ctx, cur[1], W / 2, VCY + 150, 420, cur[1] === '65' ? C.accent : C.ink, { scale: lerp(1.25, 1, Math.min(1, k)), stroke: 22 });
    }
  }
  if (black) {
    const fl = hash01(Math.floor(t * 20), 31) > 0.25 ? 1 : 0.3;
    bigText(ctx, '¿ ?', W / 2, VCY + 120, 360, C.ink, { alpha: 0.8 * fl });
  }
  if (t >= T.olvida - 0.05) {
    const k = sp(t, T.olvida - 0.05, SPRING.snappy);
    ctx.save(); ctx.globalAlpha = k;
    ctx.fillStyle = 'rgba(244,239,230,0.95)'; rrect(ctx, W / 2 - 380, VCY - 300, 760, 560, 30); ctx.fill();
    text(ctx, 'ESTABA HACIENDO:', W / 2 - 320, VCY - 190, font(70, 400, D), C.bg, 'left', 2);
    ctx.fillStyle = '#BDB6AA';
    for (let i = 0; i < 3; i++) ctx.fillRect(W / 2 - 320, VCY - 40 + i * 120, 640, 8);
    if (Math.floor(t * 3) % 2 === 0) { ctx.fillStyle = C.accent; ctx.fillRect(W / 2 - 320, VCY - 150, 12, 100); }
    ctx.restore();
  }
}

function sCounter(ctx, t) {
  const nightK = E.inOutCubic(prog(t, T.duerme - 0.1, T.duerme + 0.6));
  if (nightK < 1) photo(ctx, 'clock', t, S[7], T.duerme + 0.6, { z0: 1.0, z1: 1.25, dark: 0.35 });
  if (nightK > 0) {
    ctx.save(); ctx.globalAlpha = nightK;
    photo(ctx, 'sleep', t, T.duerme - 0.1, S[8], { z0: 1.15, z1: 1.03, dark: 0.15 });
    ctx.restore();
  }
  if (nightK < 1) {
    const n = Math.round(264 * E.outCubic(prog(t, S[7] + 0.1, T.h264 + 1.2)));
    ctx.save(); ctx.globalAlpha = 1 - nightK; M.shake(ctx, B(t), B(T.h264 + 1.2), 10);
    bigText(ctx, String(n), W / 2, VCY + 120, 440, n === 264 ? C.accent : C.ink, { scale: 1 + 0.04 * bump(t, T.h264 + 1.2, 0.15), stroke: 22 });
    bigText(ctx, 'HORAS DESPIERTO', W / 2, VCY + 250, 96, C.ink, { track: 4, stroke: 12 });
    ctx.restore();
  }
  if (nightK > 0) {
    for (let i = 0; i < 3; i++) {
      if (t < T.duerme) continue;
      const tt = (t - T.duerme + i * 0.6) % 1.8;
      bigText(ctx, 'Z', W / 2 + 120 + tt * 140 + i * 30, 640 - tt * 240, 90 + i * 30, '#F5E9C8', { alpha: nightK * Math.sin(Math.PI * tt / 1.8), stroke: 8 });
    }
    const k = sp(t, T.catorce - 0.1, SPRING.bouncy);
    if (k > 0) bigText(ctx, '14 HORAS', W / 2, 1200, 170, '#F5E9C8', { scale: Math.min(1.1, k), stroke: 16 });
  }
}

function sBanned(ctx, t) {
  photo(ctx, 'record', t, S[8], S[9], { z0: 1.05, z1: 1.2, dark: 0.3 });
  const k = sp(t, S[8] - 0.05, SPRING.gentle);
  const cw = 760, ch = 560, cx = W / 2, cy = VCY - 20 + (1 - k) * 900;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.03);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-cw / 2 + 18, -ch / 2 + 24, cw, ch);
  ctx.fillStyle = '#F3E8CF'; ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
  ctx.strokeStyle = '#B08D3C'; ctx.lineWidth = 10; ctx.strokeRect(-cw / 2 + 28, -ch / 2 + 28, cw - 56, ch - 56);
  ctx.lineWidth = 3; ctx.strokeRect(-cw / 2 + 46, -ch / 2 + 46, cw - 92, ch - 92);
  text(ctx, 'CERTIFICADO', 0, -ch / 2 + 130, font(60, 400, D), '#6B5520', 'center', 8);
  text(ctx, 'RÉCORD MUNDIAL', 0, -ch / 2 + 235, font(98, 400, D), '#2A2420', 'center', 3);
  text(ctx, 'MÁS TIEMPO SIN DORMIR', 0, -ch / 2 + 300, font(38, 800, UI), '#6B5520', 'center', 3);
  text(ctx, '264 HORAS', 0, -ch / 2 + 405, font(84, 400, D), '#2A2420', 'center', 3);
  ctx.fillStyle = '#C9A13B'; ctx.beginPath();
  for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12, r = i % 2 ? 58 : 70; ctx.lineTo(cw / 2 - 120 + Math.cos(a) * r, ch / 2 - 110 + Math.sin(a) * r); }
  ctx.fill(); ctx.restore();
  const s = sp(t, T.prohibido - 0.08, { stiffness: 500, damping: 26 });
  if (s > 0) {
    ctx.save(); M.shake(ctx, B(t), B(T.prohibido), 22);
    ctx.translate(W / 2, VCY - 10); ctx.rotate(-0.2); const sc = lerp(3, 1, Math.min(1, s)); ctx.scale(sc, sc); ctx.globalAlpha = Math.min(1, s * 1.5);
    ctx.strokeStyle = C.accent; ctx.lineWidth = 18; rrect(ctx, -400, -110, 800, 220, 26); ctx.stroke();
    text(ctx, 'PROHIBIDO', 0, 72, font(200, 400, D), C.accent, 'center', 10); ctx.restore();
  }
  const g = sp(t, T.guinness, SPRING.snappy);
  if (g > 0) bigText(ctx, 'DEMASIADO PELIGROSO', W / 2, 1210, 82, C.ink, { alpha: g, track: 4, scale: lerp(0.9, 1, g), stroke: 12 });
}

function sEnd(ctx, t) {
  photo(ctx, 'eye', t, S[9], T.end, { z0: 1.28, z1: 1.4, dark: 0.12 });
  const k = sp(t, T.cuantas - 0.2, SPRING.bouncy);
  if (k > 0) bigText(ctx, '¿Y TÚ?', W / 2, 560, 250, C.accent, { scale: Math.min(1.15, k), stroke: 18 });
  lids(ctx, E.inOutCubic(prog(t, T.cuantas + 0.8, T.end - 0.1)));
}

// ------------------------------------------------------------------ captions (word by word)
function captions(ctx, t) {
  const c = CAP.captions.find((c) => t >= c.t - 0.03 && t < c.end);
  if (!c) return;
  const words = c.words.map((w) => w.w);
  let size = 104; const maxW = W - 150;
  ctx.font = font(size, 800, UI);
  const line = words.join(' ');
  if (ctx.measureText(line).width > maxW) size *= maxW / ctx.measureText(line).width;
  const f = font(size, 800, UI); ctx.font = f;
  const widths = words.map((w) => ctx.measureText(w).width), space = ctx.measureText(' ').width;
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  let x = W / 2 - total / 2; const y = 1400;
  const pop = sp(t, c.t - 0.03, { stiffness: 600, damping: 22 });
  ctx.save(); ctx.translate(W / 2, y); ctx.scale(lerp(0.85, 1, Math.min(1, pop)), lerp(0.85, 1, Math.min(1, pop))); ctx.translate(-W / 2, -y);
  ctx.lineJoin = 'round'; ctx.textAlign = 'left';
  c.words.forEach((w, i) => {
    const active = t >= w.t - 0.03;
    ctx.font = f; ctx.lineWidth = size * 0.2; ctx.strokeStyle = '#000';
    ctx.strokeText(w.w, x, y);
    ctx.fillStyle = active ? (w.k ? C.accent : '#FFFFFF') : 'rgba(255,255,255,0.5)';
    ctx.fillText(w.w, x, y);
    x += widths[i] + space;
  });
  ctx.restore();
}

// ------------------------------------------------------------------ film
const SCENES = [sHook, sNews, sDay2, sDay4, sStadium, sDay7, sDay11, sCounter, sBanned, sEnd];
const PHOTOS = ['eye', 'room1964', 'desk', 'stopsign', 'stadium', 'hands', 'chalkboard', 'clock', 'sleep', 'record'];

M.film({
  fonts: [font(100, 400, D), font(100, 800, UI)],
  images: Object.fromEntries(PHOTOS.map((k) => [k, `assets/img/${k}.png`])),
  hits: HITS,
  samples: 4,
  async init() {
    CAP = await fetch('captions.json').then((r) => r.json());
    const tm = await fetch('timing.json').then((r) => r.json());
    S.push(...tm.S); Object.assign(T, tm.T); HITS.push(...hitList());
  },
  draw(ctx, u, t, images) {
    IMG = images;
    const i = sec(t);
    const push = 1 + 0.06 * (1 - E.outCubic(prog(t, S[i], S[i] + 0.35)));
    ctx.save(); ctx.translate(W / 2, VCY); ctx.scale(push, push); ctx.translate(-W / 2, -VCY);
    SCENES[i](ctx, t);
    ctx.restore();
    tracker(ctx, t);
    captions(ctx, t);
  },
  post(ctx, u, t) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const f = Math.floor(t * 30);
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 900; i++) { ctx.fillStyle = hash01(i + f * 977, 5) > 0.5 ? '#fff' : '#000'; ctx.fillRect(hash01(i + f * 131, 1) * W, hash01(i + f * 733, 2) * H, 3, 3); }
    ctx.globalAlpha = 1;
  },
});
