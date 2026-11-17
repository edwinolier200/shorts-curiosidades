// 382 días sin comer (Angus Barbieri, 1965-66) — Short 9:16, photo style of episode 001.
// Pure function of time: window.seek(t) paints frame t. Timing from timing.json (aligned voice-over).
import * as M from './lib/motion.js';

const { W, H, E, prog, lerp, clamp, spring, SPRING, font, text, fill, rrect, hash01, mix, bump } = M;

const C = { bg: '#0B0B10', ink: '#F4EFE6', dim: '#C9C4BC', accent: '#FF3B30', paper: '#EDE4D3', paperInk: '#2A2420' };
const D = 'Display', UI = 'UI';
const sp = (t, t0, cfg = SPRING.snappy) => spring(t - t0, cfg);

const S = [];
const T = {};
const sec = (t) => { let i = 0; while (i + 1 < S.length && t >= S[i + 1]) i++; return i; };

const B = (s) => s / 0.5;
const HITS = [];
const hitList = () => [
  [B(0.0), '382 slams', 'impact'],
  [B(S[1]), 'cut to 1965 town', 'whoosh', { len: 0.35 }],
  [B(T.year), '1965 stamp', 'thud'],
  [B(T.kilos), '+200 kg badge', 'impact'],
  [B(T.seguir), 'plan crossed out', 'whoosh', { len: 0.25, from: 1800, to: 900 }],
  [B(T.agua), 'agua', 'pop', { pitch: 'C5' }],
  [B(T.te), 'te', 'pop', { pitch: 'E5' }],
  [B(T.cafe), 'cafe', 'pop', { pitch: 'G5' }],
  [B(T.vitaminas), 'vitaminas', 'pop', { pitch: 'C6' }],
  [B(T.combustible), 'grasa = combustible', 'thud'],
  [B(T.analisis), 'analysis ticks', 'tick'],
  [B(S[6]), 'scale counter starts', 'whoosh', { len: 0.4, from: 2400, to: 400 }],
  [B(T.ochenta), '81 kg lands', 'impact'],
  [B(T.perdido), '-120 kg badge', 'thud'],
  [B(S[7]), 'twist: 5 years later', 'impact'],
  [B(T.intentes), 'warning stamp', 'impact'],
  [B(S[9]), 'back to the plate', 'whoosh', { len: 0.4 }],
];

let CAP = { captions: [] };
let IMG = {};

// ------------------------------------------------------------------ kit (same as episode 001)
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
function photo(ctx, key, t, t0, t1, { z0 = 1.04, z1 = 1.16, fx0 = 0.5, fx1 = 0.5, fy0 = 0.5, fy1 = 0.5, dark = 0.25, blur = 0, gray = 0, sepia = 0 } = {}) {
  const im = IMG[key];
  if (!im) { fill(ctx, C.bg); return; }
  const p = E.inOutSine(prog(t, t0, t1));
  const z = Math.exp(lerp(Math.log(z0), Math.log(z1), p));
  const s = Math.max(W / im.width, H / im.height) * z;
  const dw = im.width * s, dh = im.height * s;
  ctx.save();
  const f = [];
  if (blur) f.push(`blur(${blur.toFixed(1)}px)`);
  if (gray) f.push(`grayscale(${gray})`);
  if (sepia) f.push(`sepia(${sepia})`);
  f.push('contrast(1.08) saturate(1.05)');
  ctx.filter = f.join(' ');
  ctx.drawImage(im, (W - dw) * lerp(fx0, fx1, p), (H - dh) * lerp(fy0, fy1, p), dw, dh);
  ctx.filter = 'none';
  ctx.fillStyle = `rgba(5,5,10,${dark})`; ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(0.2, 'rgba(0,0,0,0)');
  g.addColorStop(0.6, 'rgba(0,0,0,0)'); g.addColorStop(0.75, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
function pill(ctx, str, x, y, size, k, { bg = C.ink, fg = C.bg, rot = 0 } = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.font = font(size, 400, D); ctx.letterSpacing = '3px';
  const w = ctx.measureText(str).width + size * 0.8, h = size * 1.25;
  ctx.letterSpacing = '0px';
  ctx.translate(x, y); ctx.rotate(rot); const sc = Math.min(1.12, k); ctx.scale(sc, sc);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; rrect(ctx, -w / 2 + 8, -h / 2 + 10, w, h, h * 0.22); ctx.fill();
  ctx.fillStyle = bg; rrect(ctx, -w / 2, -h / 2, w, h, h * 0.22); ctx.fill();
  text(ctx, str, 0, size * 0.36, font(size, 400, D), fg, 'center', 3);
  ctx.restore();
}
function stamp(ctx, str, x, y, size, t, t0, rot = -0.18) {
  const s = sp(t, t0 - 0.08, { stiffness: 500, damping: 26 });
  if (s <= 0) return;
  ctx.save(); M.shake(ctx, B(t), B(t0), 18);
  ctx.translate(x, y); ctx.rotate(rot); const sc = lerp(2.6, 1, Math.min(1, s)); ctx.scale(sc, sc); ctx.globalAlpha = Math.min(1, s * 1.5);
  ctx.font = font(size, 400, D); ctx.letterSpacing = '8px'; const w = ctx.measureText(str).width + size * 0.6; ctx.letterSpacing = '0px';
  ctx.strokeStyle = C.accent; ctx.lineWidth = size * 0.09; rrect(ctx, -w / 2, -size * 0.62, w, size * 1.1, 22); ctx.stroke();
  text(ctx, str, 0, size * 0.35, font(size, 400, D), C.accent, 'center', 8);
  ctx.restore();
}

// Days-without-food tracker: fills 0 -> 382 through the middle of the story.
function tracker(ctx, t) {
  const on = prog(t, S[2] - 0.2, S[2] + 0.2) * (1 - prog(t, S[7] - 0.1, S[7] + 0.2));
  if (on <= 0) return;
  const d = Math.round(382 * E.inOutSine(prog(t, S[2], T.d382 + 0.3)));
  const x0 = 110, x1 = W - 110, y = 300;
  ctx.save(); ctx.globalAlpha = on;
  text(ctx, 'DÍAS SIN COMER', x0, y - 26, font(34, 800, UI), C.dim, 'left', 3);
  text(ctx, `${d} / 382`, x1, y - 26, font(40, 400, D), d === 382 ? C.accent : C.ink, 'right', 2);
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; rrect(ctx, x0, y, x1 - x0, 22, 8); ctx.fill();
  const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#FF9F0A'); g.addColorStop(1, C.accent);
  ctx.fillStyle = g; rrect(ctx, x0, y, Math.max(22, (x1 - x0) * d / 382), 22, 8); ctx.fill();
  ctx.restore();
}

const VCY = 760;

// ------------------------------------------------------------------ scenes
function sHook(ctx, t) {
  photo(ctx, 'plate', t, 0, S[1], { z0: 1.0, z1: 1.22, dark: 0.15 });
  const k = sp(t, -0.12, SPRING.bouncy);
  ctx.save(); M.shake(ctx, B(t), B(0.0), 16);
  bigText(ctx, '382', W / 2, 500, 300, C.accent, { scale: lerp(2.2, 1, Math.min(1, k)) * (k > 0 ? 1 : 0), alpha: k * 3, stroke: 18 });
  ctx.restore();
  const k2 = sp(t, 0.25, SPRING.snappy);
  bigText(ctx, 'DÍAS SIN COMER', W / 2, 640 + (1 - k2) * 60, 120, C.ink, { alpha: k2, track: 2, stroke: 14 });
}

function sNews(ctx, t) {
  photo(ctx, 'town', t, S[1], S[2], { z0: 1.05, z1: 1.2, fx0: 0.35, fx1: 0.65, dark: 0.3, sepia: 0.3 });
  const k = sp(t, S[1] + 0.15, SPRING.gentle);
  const pw = 760, ph = 600, px = W / 2 - pw / 2 + (1 - k) * W, py = 380;
  ctx.save(); ctx.translate(px + pw / 2, py + ph / 2); ctx.rotate(0.03 - (1 - k) * 0.2); ctx.translate(-(px + pw / 2), -(py + ph / 2));
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(px + 18, py + 24, pw, ph);
  ctx.fillStyle = C.paper; ctx.fillRect(px, py, pw, ph);
  text(ctx, 'EL DIARIO DE ESCOCIA', px + pw / 2, py + 82, font(58, 400, D), C.paperInk, 'center', 4);
  ctx.fillStyle = C.paperInk; ctx.fillRect(px + 36, py + 104, pw - 72, 6); ctx.fillRect(px + 36, py + 116, pw - 72, 2);
  text(ctx, 'TAYPORT · JUNIO DE 1965', px + pw / 2, py + 156, font(26, 800, UI), '#6B5F55', 'center', 4);
  const bx = px + 36, by = py + 180, bw = 330, bh = 370;
  if (IMG.town) {
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip(); ctx.filter = 'grayscale(1) sepia(0.4) contrast(1.2)';
    M.cover(ctx, IMG.town, bx, by, bw, bh, { fx: 0.5, fy: 0.5, zoom: 1.1 }); ctx.filter = 'none'; ctx.restore();
  }
  const hx = bx + bw + 26, hw = pw - bw - 98;
  ['HOMBRE DE', '200 KILOS', 'DEJA DE COMER'].forEach((l, i) => {
    ctx.font = font(70, 400, D); const sz = Math.min(70, 70 * hw / ctx.measureText(l).width);
    text(ctx, l, hx, by + 58 + i * 64, font(sz, 400, D), C.paperInk, 'left');
  });
  ctx.fillStyle = '#B3A894';
  for (let i = 0; i < 7; i++) ctx.fillRect(hx, by + 236 + i * 20, hw * (0.6 + 0.4 * hash01(i, 2)), 8);
  ctx.restore();
  const kn = sp(t, T.angus - 0.1, SPRING.snappy);
  if (kn > 0) {
    ctx.save(); ctx.fillStyle = C.accent; const nw = 760 * Math.min(1, kn);
    ctx.fillRect(W / 2 - 380, 1040, nw, 120); ctx.beginPath(); ctx.rect(W / 2 - 380, 1040, nw, 120); ctx.clip();
    text(ctx, 'ANGUS BARBIERI', W / 2, 1132, font(104, 400, D), C.ink, 'center', 3); ctx.restore();
  }
  stamp(ctx, '1965', W - 220, 880, 110, t, T.year, -0.2);
  pill(ctx, '27 AÑOS', 260, 300, 74, sp(t, T.age - 0.1, SPRING.bouncy), { rot: -0.06 });
  pill(ctx, '+200 KG', W - 250, 300, 84, sp(t, T.kilos - 0.1, SPRING.bouncy), { bg: C.accent, fg: C.ink, rot: 0.06 });
}

function sPlan(ctx, t) {
  photo(ctx, 'corridor', t, S[2], S[3], { z0: 1.05, z1: 1.2, dark: 0.3, sepia: 0.2 });
  const k = sp(t, S[2] + 0.1, SPRING.bouncy);
  if (k > 0) {
    ctx.save(); ctx.translate(W / 2, VCY - 40); ctx.rotate(-0.03); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
    ctx.fillStyle = 'rgba(244,239,230,0.96)'; rrect(ctx, -380, -230, 760, 420, 28); ctx.fill();
    text(ctx, 'PLAN DE LOS MÉDICOS', 0, -140, font(44, 800, UI), '#6B5F55', 'center', 4);
    text(ctx, 'AYUNO DE', 0, -40, font(96, 400, D), C.paperInk, 'center', 3);
    text(ctx, 'UNOS DÍAS', 0, 80, font(140, 400, D), C.paperInk, 'center', 3);
    // red strike-through on "seguir"
    const st = E.outCubic(prog(t, T.seguir - 0.1, T.seguir + 0.25));
    if (st > 0) { ctx.strokeStyle = C.accent; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-300, 40); ctx.lineTo(-300 + 600 * st, 40 - 40 * st); ctx.stroke(); }
    ctx.restore();
  }
  pill(ctx, '…Y SIGUIÓ', W / 2 + 120, VCY + 290, 100, sp(t, T.seguir + 0.1, SPRING.bouncy), { bg: C.accent, fg: C.ink, rot: -0.05 });
}

function sDrinks(ctx, t) {
  photo(ctx, 'drinks', t, S[3], S[4], { z0: 1.12, z1: 1.02, dark: 0.25 });
  bigText(ctx, 'SOLO TOMÓ:', W / 2, 520, 90, C.ink, { alpha: sp(t, S[3] + 0.1), stroke: 12, track: 3 });
  [['AGUA', T.agua], ['TÉ', T.te], ['CAFÉ', T.cafe], ['VITAMINAS', T.vitaminas]].forEach(([w, tt], i) =>
    pill(ctx, w, i % 2 ? W / 2 + 200 : W / 2 - 200, 680 + Math.floor(i / 2) * 170 + (i === 3 ? 0 : 0), 92, sp(t, tt - 0.08, SPRING.bouncy), { rot: (i % 2 ? 1 : -1) * 0.05, bg: i === 3 ? C.accent : C.ink, fg: i === 3 ? C.ink : C.bg }));
}

function sFuel(ctx, t) {
  const glow = 0.7 + 0.3 * Math.sin(t * 9) * 0.5 + 0.3 * prog(t, T.grasa, T.combustible);
  photo(ctx, 'fire', t, S[4], S[5], { z0: 1.0, z1: 1.3, dark: 0.35 * (1.2 - glow * 0.5) });
  const kg = sp(t, T.grasa - 0.1, SPRING.bouncy);
  bigText(ctx, 'GRASA', W / 2, 600, 210, C.ink, { scale: Math.min(1.1, kg), stroke: 16 });
  const ke = sp(t, T.combustible - 0.25, SPRING.snappy);
  bigText(ctx, '=', W / 2, 760, 150, C.accent, { alpha: ke, stroke: 12 });
  const kc = sp(t, T.combustible - 0.1, SPRING.bouncy);
  bigText(ctx, 'COMBUSTIBLE', W / 2, 960, 170, '#FF9F0A', { scale: Math.min(1.1, kc), stroke: 16 });
}

function sLab(ctx, t) {
  photo(ctx, 'lab', t, S[5], S[6], { z0: 1.05, z1: 1.2, dark: 0.3 });
  const k = sp(t, S[5] + 0.1, SPRING.gentle);
  if (k <= 0) return;
  ctx.save(); ctx.translate(W / 2, VCY + (1 - k) * 700); ctx.rotate(0.03);
  ctx.fillStyle = 'rgba(244,239,230,0.96)'; rrect(ctx, -340, -280, 680, 560, 26); ctx.fill();
  text(ctx, 'ANÁLISIS', 0, -170, font(100, 400, D), C.paperInk, 'center', 4);
  ['SANGRE', 'ORINA', 'PESO'].forEach((w, i) => {
    const tt = T.hospital + 0.4 + i * 0.5, c = E.outBack(prog(t, tt, tt + 0.25));
    text(ctx, w, -230, -40 + i * 110, font(76, 400, D), C.paperInk, 'left', 3);
    ctx.strokeStyle = '#BDB6AA'; ctx.lineWidth = 6; ctx.strokeRect(160, -100 + i * 110, 70, 70);
    if (c > 0) { ctx.save(); ctx.translate(195, -65 + i * 110); ctx.scale(c, c); ctx.strokeStyle = C.accent; ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(-6, 22); ctx.lineTo(32, -26); ctx.stroke(); ctx.restore(); }
  });
  ctx.restore();
}

function sScale(ctx, t) {
  photo(ctx, 'scale', t, S[6], S[7], { z0: 1.0, z1: 1.18, dark: 0.35 });
  const kgv = Math.round(lerp(214, 81, E.outCubic(prog(t, S[6] + 0.2, T.ochenta))));
  const done = t >= T.ochenta;
  ctx.save(); if (done) M.shake(ctx, B(t), B(T.ochenta), 12);
  bigText(ctx, String(kgv), W / 2, VCY + 100, 400, done ? C.accent : C.ink, { scale: 1 + 0.05 * bump(t, T.ochenta, 0.15), stroke: 22 });
  bigText(ctx, 'KILOS', W / 2, VCY + 230, 110, C.ink, { track: 8, stroke: 12 });
  ctx.restore();
  pill(ctx, '−120 KG', W / 2 + 160, VCY - 330, 100, sp(t, T.perdido - 0.1, SPRING.bouncy), { bg: C.accent, fg: C.ink, rot: 0.07 });
}

function sLater(ctx, t) {
  photo(ctx, 'calendar', t, S[7], S[8], { z0: 1.2, z1: 1.04, dark: 0.3 });
  ctx.save(); ctx.globalAlpha = 0.3 * bump(t, S[7], 0.12); ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H); ctx.restore();
  const k = sp(t, T.cinco - 0.15, SPRING.bouncy);
  bigText(ctx, '5 AÑOS', W / 2, 600, 230, C.ink, { scale: Math.min(1.1, k), stroke: 18 });
  bigText(ctx, 'DESPUÉS', W / 2, 730, 120, C.ink, { alpha: k, track: 6, stroke: 12 });
  stamp(ctx, '< 90 KG', W / 2, 1000, 150, t, T.noventa, -0.12);
}

function sWarn(ctx, t) {
  photo(ctx, 'doctor', t, S[8], S[9], { z0: 1.05, z1: 1.18, dark: 0.3 });
  pill(ctx, 'CON SUPERVISIÓN MÉDICA', W / 2, 620, 72, sp(t, T.ojo + 0.3, SPRING.bouncy), { rot: -0.03 });
  stamp(ctx, 'NO LO INTENTES', W / 2, 900, 130, t, T.intentes, -0.15);
}

function sEnd(ctx, t) {
  photo(ctx, 'plate', t, S[9], T.end, { z0: 1.22, z1: 1.32, dark: 0.15 });
  const k = sp(t, T.cuantas - 0.2, SPRING.bouncy);
  if (k > 0) bigText(ctx, '¿Y TÚ?', W / 2, 600, 260, C.accent, { scale: Math.min(1.15, k), stroke: 18 });
  const f = E.inOutCubic(prog(t, T.end - 0.9, T.end - 0.1));
  if (f > 0) { ctx.fillStyle = `rgba(0,0,0,${f})`; ctx.fillRect(0, 0, W, H); }
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
const SCENES = [sHook, sNews, sPlan, sDrinks, sFuel, sLab, sScale, sLater, sWarn, sEnd];
const PHOTOS = ['plate', 'town', 'corridor', 'drinks', 'fire', 'lab', 'scale', 'calendar', 'doctor'];

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
