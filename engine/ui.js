// ui.js — v5 on-screen language (inspired by the top LatAm "¿Qué pasaría si…?" Shorts):
// top captions, the day badge that pops then docks in the corner, stat cards, pills, stamps, watermark.
//   import * as UI from './lib/ui.js';
//   UI.captionsTop(ctx, CAP, t)                                  // white, short, keyword in bold yellow, under the YouTube chips
//   UI.dayBadge(ctx, 'SIN COLOMBIA', 'MARTES', t, T.martes)      // pops big, then docks top-left until the next block
//   UI.statCard(ctx, '5.700 M $', 'lo que gana el canal en un año 🚢', t, T.dinero)
//   UI.pill(ctx, 'PRECIO ↑', x, y, t, t0); UI.stamp(ctx, 'EN PARO', x, y, t, t0); UI.watermark(ctx, '@tu.canal')
import { W, H, spring, SPRING, font, text, rrect, clamp, lerp, E, prog, shake } from './motion.js';

export const C = { navy: '#14213D', navyEdge: '#2E4372', yellow: '#FFD60A', red: '#E63B2E', white: '#FFFFFF', ink: '#111111' };
const sp = (t, t0, cfg = SPRING.snappy) => spring(t - t0, cfg);

// ---------------------------------------------------------------- captions at the top (y ~ 330, clear of the Shorts chips)
export function captionsTop(ctx, CAP, t, { y = 340, size = 66, maxW = W - 160 } = {}) {
  const c = CAP.captions.find((c) => t >= c.t - 0.03 && t < c.end);
  if (!c) return;
  let s = size;
  const words = c.words.map((wd, i) => wd.o || sentence(wd.w, i === 0 && c.first !== false));
  const measure = (sz) => { let w = 0; c.words.forEach((wd, i) => { ctx.font = font(sz, wd.k ? 800 : 600, 'UI'); w += ctx.measureText(words[i]).width + (i ? sz * 0.28 : 0); }); return w; };
  while (measure(s) > maxW && s > 36) s -= 2;
  const total = measure(s); let x = W / 2 - total / 2;
  const pop = Math.min(1, sp(t, c.t - 0.03, { stiffness: 500, damping: 26 }));
  ctx.save(); ctx.globalAlpha = pop; ctx.translate(0, (1 - pop) * 10);
  ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 3; ctx.textAlign = 'left';
  c.words.forEach((wd, i) => {
    const str = words[i]; ctx.font = font(s, wd.k ? 800 : 600, 'UI');
    const active = t >= wd.t - 0.03;
    ctx.fillStyle = !active ? 'rgba(255,255,255,0.55)' : wd.k ? C.yellow : C.white;
    if (i) x += s * 0.28;
    ctx.fillText(str, x, y); x += ctx.measureText(str).width;
  });
  ctx.restore();
}
// Captions store the original spelling in "o" (captions.py v5). Fallback for old upper-case captions: lower-case,
// capitalising only the first word of a chunk (after ¿ or ¡). Proper nouns need "o" to keep their capital.
function sentence(w, first) {
  if (/[a-záéíóúñ]/.test(w) || /\d/.test(w) || /^[A-Z]{1,3}\.?$/.test(w) && w.includes('.')) return w;
  const l = w.toLowerCase();
  if (!first) return l;
  const i = l.search(/[a-záéíóúñü]/); return i < 0 ? l : l.slice(0, i) + l.charAt(i).toUpperCase() + l.slice(i + 1);
}

// ---------------------------------------------------------------- day badge: big pop for ~0.9 s, then docks in the corner
function badge(ctx, series, label, s) {
  ctx.save(); ctx.scale(s, s);
  ctx.font = font(96, 400, 'Display'); ctx.letterSpacing = '3px'; const lw = ctx.measureText(label).width; ctx.letterSpacing = '0px';
  ctx.font = font(30, 800, 'UI'); const sw = ctx.measureText(series).width;
  const w = Math.max(lw + 80, sw + 60), h = 150;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; rrect(ctx, -w / 2 + 6, -h / 2 + 10, w, h, 18); ctx.fill();
  ctx.fillStyle = C.white; rrect(ctx, -w / 2, -h / 2, w, h, 18); ctx.fill();
  ctx.fillStyle = C.red; rrect(ctx, -sw / 2 - 26, -h / 2 - 22, sw + 52, 50, 10); ctx.fill();
  text(ctx, series, 0, -h / 2 + 14, font(30, 800, 'UI'), C.white, 'center', 1);
  text(ctx, label, 0, h / 2 - 34, font(96, 400, 'Display'), C.ink, 'center', 3);
  ctx.restore();
}
export function dayBadge(ctx, series, label, t, t0, { tEnd = Infinity, cx = W / 2, cy = 760, dock = [150, 470], dockScale = 0.42 } = {}) {
  if (t < t0 || t >= tEnd) return;
  const k = sp(t, t0, SPRING.bouncy), d = E.inOutCubic(prog(t, t0 + 0.9, t0 + 1.3));
  const x = lerp(cx, dock[0], d), y = lerp(cy, dock[1], d), s = lerp(Math.min(1.1, k) * 1.25, dockScale, d);
  ctx.save(); ctx.translate(x, y); ctx.rotate(lerp(-0.06, -0.03, d)); badge(ctx, series, label, s); ctx.restore();
}

// ---------------------------------------------------------------- stat card: big yellow number + one small line
export function statCard(ctx, big, small, t, t0, { y = 1180, tEnd = Infinity } = {}) {
  if (t < t0 || t >= tEnd) return;
  const k = Math.min(1, sp(t, t0, SPRING.bouncy));
  ctx.save(); ctx.font = font(96, 400, 'Display'); const bw = ctx.measureText(big).width;
  ctx.font = font(32, 800, 'UI'); const swd = ctx.measureText(small).width;
  const w = Math.max(bw, swd) + 90, h = 190;
  ctx.translate(W / 2, y + (1 - k) * 60); ctx.globalAlpha = k;
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; rrect(ctx, -w / 2 + 6, -h / 2 + 10, w, h, 24); ctx.fill();
  ctx.fillStyle = C.navy; rrect(ctx, -w / 2, -h / 2, w, h, 24); ctx.fill();
  ctx.strokeStyle = C.navyEdge; ctx.lineWidth = 4; ctx.stroke();
  text(ctx, big, 0, 12, font(96, 400, 'Display'), C.yellow, 'center', 2);
  text(ctx, small, 0, 66, font(32, 800, 'UI'), C.white, 'center');
  ctx.restore();
}
// ---------------------------------------------------------------- yellow pill label (with optional arrow ↑ ↓)
export function pill(ctx, str, x, y, t, t0, { tEnd = Infinity, bg = C.yellow, fg = C.ink, size = 54, rot = -0.03 } = {}) {
  if (t < t0 || t >= tEnd) return;
  const k = Math.min(1.1, sp(t, t0, SPRING.bouncy));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  ctx.font = font(size, 400, 'Display'); const w = ctx.measureText(str).width + size * 0.9, h = size * 1.3;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; rrect(ctx, -w / 2 + 5, -h / 2 + 8, w, h, 14); ctx.fill();
  ctx.fillStyle = bg; rrect(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
  text(ctx, str, 0, size * 0.36, font(size, 400, 'Display'), fg, 'center', 2);
  ctx.restore();
}
// ---------------------------------------------------------------- red stamp that slams in (EN PARO, CANCELADO, PROHIBIDO)
export function stamp(ctx, str, x, y, t, t0, { size = 90, rot = -0.14, tEnd = Infinity } = {}) {
  if (t < t0 || t >= tEnd) return;
  const s = spring(t - t0, { stiffness: 520, damping: 26 });
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const sc = lerp(2.4, 1, Math.min(1, s)); ctx.scale(sc, sc); ctx.globalAlpha = Math.min(1, s * 1.6);
  ctx.font = font(size, 400, 'Display'); ctx.letterSpacing = '6px'; const w = ctx.measureText(str).width + size * 0.7; ctx.letterSpacing = '0px';
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; rrect(ctx, -w / 2, -size * 0.62, w, size * 1.15, 14); ctx.fill();
  ctx.strokeStyle = C.red; ctx.lineWidth = size * 0.09; ctx.stroke();
  text(ctx, str, 0, size * 0.36, font(size, 400, 'Display'), C.red, 'center', 6);
  ctx.restore();
}
// ---------------------------------------------------------------- channel watermark (left, mid-height: clear of the Shorts UI)
export function watermark(ctx, handle, { y = H * 0.58 } = {}) {
  if (!handle) return;
  ctx.save(); ctx.globalAlpha = 0.55; ctx.font = font(30, 800, 'UI'); ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillText(handle, 62, y + 2); ctx.fillStyle = '#fff'; ctx.fillText(handle, 60, y);
  ctx.restore();
}
// ---------------------------------------------------------------- v5 set: navy "sky" + warm wooden table, the stage every 3D object sits on
export function stage(ctx, { horizon = 0.36 } = {}) {
  const hy = H * horizon;
  const sky = ctx.createLinearGradient(0, 0, 0, hy); sky.addColorStop(0, '#0E1730'); sky.addColorStop(1, '#1B2A52');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, hy);
  const wood = ctx.createLinearGradient(0, hy, 0, H); wood.addColorStop(0, '#B8713A'); wood.addColorStop(1, '#7A4320');
  ctx.fillStyle = wood; ctx.fillRect(0, hy, W, H - hy);
  ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = '#3A1E0C';
  for (let i = 0; i < 26; i++) { const y = hy + (i / 26) ** 1.6 * (H - hy); ctx.lineWidth = 1 + i * 0.12; ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(W * 0.3, y + 6, W * 0.7, y - 6, W, y + 2); ctx.stroke(); }
  ctx.restore();
}
