// E02 · El secreto de tu corazón — v4: INFOGRAPHIC style (chosen by the user 2026-11-24).
// A drawn heart (simplified real anatomy, not ❤) is the protagonist on a night-blue background; every sentence of the voice
// gets a flat infographic: counters, blood cells filling barrels, the electrical wave from the sinoatrial node, renewal
// cards, the beat dial, the employee card, a torso with a hand on the chest, and the liver for the next chapter.
// 2-D canvas only: fast to render. Older versions: examples/E02_v3_toon3d_film.js (3-D anatomy).
import * as M from './lib/motion.js';
import * as UI from './lib/ui.js';
import * as O from './lib/organs2d.js';
const { W, H, E, prog, lerp, clamp, spring, SPRING, hash01, font, rrect } = M;

const S = [], T = {};
let CAP = { captions: [] }, HB = [];
const B = (s) => s / 0.5;
const HITS = [];
const hitList = () => [
  [B(0.15), 'spark', 'blip', { pitch: 'C6', gain: 0.5 }],
  [B(T.nacieras - 0.4), 'heart grows', 'swell', { gain: 0.6 }],
  [B(T.secreto), 'secret', 'pop', { pitch: 'E5' }],
  [B(T.cien), 'counter', 'tick'], [B(T.tres), 'counter 2', 'impact'],
  [B(S[3]), 'to the barrels', 'whoosh', { len: 0.45 }],
  [B(T.siete), '7.000 L', 'thud'],
  ...[0, 1, 2, 3, 4, 5, 6].map((i) => [B(T.treinta + i * 0.16), 'barrels fill', 'blip', { gain: 0.3, pitch: 600 + i * 90 }]),
  [B(S[4]), 'electric', 'whoosh', { len: 0.4 }],
  [B(T.electricidad), 'zap', 'crash+blip', { gain: 0.4 }],
  [B(S[5]), 'cards', 'whoosh', { len: 0.4 }],
  [B(T.piel), 'card', 'pop', { pitch: 'C5' }], [B(T.globulos), 'card', 'pop', { pitch: 'E5' }], [B(T.celulas), 'card', 'pop', { pitch: 'G5' }],
  [B(T.edad), 'TU EDAD', 'impact'],
  [B(S[7]), 'lights out', 'sub', { gain: 0.9 }],
  [B(T.descansa), 'secret', 'bell', { pitch: 'E5', verb: 0.6 }],
  [B(T.dos), '2/3', 'pop', { pitch: 'G5' }],
  [B(T.trabajador), 'badge', 'pop', { pitch: 'C6' }],
  [B(T.tarde), 'stamp', 'impact'],
  [B(S[10]), 'torso', 'whoosh', { len: 0.6, from: 1800, to: 300 }],
  [B(T.mano), 'hand', 'thud', { gain: 0.6 }],
  [B(S[11]), 'to the liver', 'whoosh', { len: 0.5 }],
  [B(T.organo), 'liver glows', 'swell', { gain: 0.6 }],
  [B(S[12]), 'back to the heart', 'whoosh', { len: 0.5 }],
  [B(T.compartele), 'share', 'pop', { pitch: 'E6' }],
];

// ------------------------------------------------------------------ heartbeat = the score's thumps
function lastBeat(t) { for (let i = HB.length - 1; i >= 0; i--) if (HB[i] <= t) return HB[i]; return undefined; }
function pulse(t) { const b = lastBeat(t); if (b === undefined) return 0; const d = t - b, d2 = d - 0.18; return Math.exp(-((d - 0.05) ** 2) / 0.004) + (d2 > 0 ? 0.6 * Math.exp(-((d2 - 0.04) ** 2) / 0.004) : 0); }
function keys(t, K, dur = 0.8, ease = E.inOutCubic) {
  let i = 0; while (i + 1 < K.length && t >= K[i + 1][0]) i++;
  if (i === 0 || t >= K[i][0] + dur) return K[i][1];
  const p = ease(prog(t, K[i][0], K[i][0] + dur)), a = K[i - 1][1], b = K[i][1];
  return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], p)) : lerp(a, b, p);
}
const GOLD = '#FFC94A';

// ------------------------------------------------------------------ background: night blue, stars, drifting cells, glow behind the heart
function background(ctx, t, hx, hy, hs, dim) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#16244A'); g.addColorStop(1, '#0A1128'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let k = 0; k < 70; k++) { const tw = 0.5 + 0.5 * Math.sin(t * 2 + k); ctx.fillStyle = `rgba(255,255,255,${(0.15 + 0.35 * hash01(k, 2)) * tw})`;
    ctx.beginPath(); ctx.arc(hash01(k, 3) * W, (hash01(k, 4) * H + t * 6 * hash01(k, 6)) % H, 1.5 + hash01(k, 5) * 2.5, 0, 6.283); ctx.fill(); }
  for (let k = 0; k < 14; k++) { const x = (hash01(k, 7) * W + t * (8 + 10 * hash01(k, 8))) % (W + 100) - 50, y = (hash01(k, 9) * H - t * 14 * hash01(k, 10) + H * 4) % H;
    ctx.save(); ctx.globalAlpha = 0.25 + 0.2 * hash01(k, 11); O.bloodCell(ctx, x, y, 14 + 22 * hash01(k, 12), t * 0.3 + k, 0.5 + 0.4 * hash01(k, 13)); ctx.restore(); }
  const r = ctx.createRadialGradient(hx, hy, 0, hx, hy, hs * 1.1); r.addColorStop(0, `rgba(255,80,90,${0.28 + 0.2 * pulse(t)})`); r.addColorStop(1, 'rgba(255,80,90,0)');
  ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
  if (dim > 0) { const d = ctx.createRadialGradient(hx, hy, hs * 0.45, hx, hy, hs * 1.4); d.addColorStop(0, `rgba(3,5,12,${dim * 0.2})`); d.addColorStop(1, `rgba(3,5,12,${dim * 0.93})`); ctx.fillStyle = d; ctx.fillRect(0, 0, W, H); }
}

// ------------------------------------------------------------------ overlays, one per sentence
function glassCard(ctx, x, y, w, h, k, { border = 'rgba(255,201,74,0.65)' } = {}) {
  ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = 'rgba(10,16,40,0.82)'; rrect(ctx, x, y, w, h, 28); ctx.fill(); ctx.strokeStyle = border; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
}
function counter(ctx, t, t0, t1, to, label, y = 400) {
  if (t < t0 || t >= t1) return;
  const k = Math.min(1, spring(t - t0, SPRING.snappy)), p = E.outCubic(prog(t, t0, t0 + 1.1));
  const n = Math.round(to * p).toLocaleString('es-CO').replace(/,/g, '.');
  ctx.save(); ctx.globalAlpha = k * (1 - prog(t, t1 - 0.2, t1)); ctx.translate(W / 2, y);
  let sz = 170; ctx.font = font(sz, 900, 'Heavy'); while (ctx.measureText(n).width > W - 140) ctx.font = font(sz -= 6, 900, 'Heavy');
  const g = ctx.createLinearGradient(0, -sz, 0, 0); g.addColorStop(0, '#FFE7A3'); g.addColorStop(0.55, GOLD); g.addColorStop(1, '#C98A1E');
  ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 24; ctx.fillStyle = g; ctx.fillText(n, 0, 0);
  ctx.shadowBlur = 0; ctx.font = font(46, 900, 'Heavy'); ctx.fillStyle = '#fff'; ctx.fillText(label, 0, 72); ctx.restore();
}
function barrels(ctx, t) {
  if (t < T.siete - 0.1 || t > S[4] + 0.1) return;
  const k = Math.min(1, spring(t - T.siete + 0.1, SPRING.snappy)) * (1 - prog(t, S[4] - 0.25, S[4] + 0.05));
  const bw = 96, bh = 100, gx = 12, gy = 16, x0 = (W - 7 * (bw + gx) + gx) / 2, y0 = 330;
  glassCard(ctx, x0 - 36, y0 - 110, 7 * (bw + gx) - gx + 72, 5 * (bh + gy) + 160, k);
  ctx.save(); ctx.globalAlpha = k; ctx.font = font(62, 900, 'Heavy'); ctx.textAlign = 'center'; ctx.fillStyle = GOLD; ctx.fillText('7.000 LITROS AL DÍA', W / 2, y0 - 36);
  const f35 = t < T.treinta ? 0 : prog(t, T.treinta, T.barriles + 0.6) * 35;
  for (let i = 0; i < 35; i++) {
    const cx = x0 + (i % 7) * (bw + gx), cy = y0 + Math.floor(i / 7) * (bh + gy), f = clamp(f35 - i);
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; rrect(ctx, cx + 6, cy, bw - 12, bh, 14); ctx.fill();
    if (f > 0) { const g = ctx.createLinearGradient(0, cy, 0, cy + bh); g.addColorStop(0, '#FF6B6B'); g.addColorStop(1, '#B8263A'); ctx.fillStyle = g; rrect(ctx, cx + 6, cy + bh * (1 - f), bw - 12, bh * f, 14); ctx.fill(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; rrect(ctx, cx + 6, cy, bw - 12, bh, 14); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(cx + 6, cy + bh * 0.33, bw - 12, 3); ctx.fillRect(cx + 6, cy + bh * 0.66, bw - 12, 3);
  }
  ctx.font = font(34, 800, 'UI'); ctx.fillStyle = '#fff'; ctx.fillText(`${Math.floor(f35)} barriles de 200 litros`, W / 2, y0 + 5 * (bh + gy) + 26); ctx.restore();
}
function stream(ctx, t, hx, hy, hs) {                       // blood cells shot out of the aorta, up into the barrels
  if (t < S[3] - 0.1 || t > S[4]) return;
  const a = clamp((t - S[3] + 0.1) * 3) * (1 - prog(t, S[4] - 0.3, S[4]));
  const [ax, ay] = O.heartLocal(hx, hy, hs, [52, -150]);
  const F = 0.35 * t + HB.filter((b) => b <= t).reduce((s, b) => s + 0.6 * clamp((t - b) / 0.3), 0);
  ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 40; i++) { const u = (hash01(i, 5) + F) % 1, sw = Math.sin(u * 9 + i) * 40 * u;
    O.bloodCell(ctx, ax + sw + (hash01(i, 6) - 0.5) * 60 * u, ay - u * (ay - 900), 12 + 8 * hash01(i, 7), u * 6 + i, 0.6); }
  ctx.restore();
}
function ecg(ctx, t) {
  if (t < T.electricidad - 0.3 || t > S[5]) return;
  const a = 1 - prog(t, S[5] - 0.3, S[5]), y = 330, x0 = 70, x1 = W - 70;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#7FF0FF'; ctx.lineWidth = 6; ctx.shadowColor = '#7FF0FF'; ctx.shadowBlur = 22; ctx.lineJoin = 'round';
  ctx.beginPath(); const head = (t - T.electricidad + 0.3) * 700;
  for (let x = x0; x <= Math.min(x1, x0 + head); x += 3) { const ph = ((x - x0) / 330) % 1;
    const v = 30 * Math.exp(-(((ph - 0.2) / 0.035) ** 2)) + 150 * Math.exp(-(((ph - 0.38) / 0.012) ** 2)) - 55 * Math.exp(-(((ph - 0.42) / 0.012) ** 2)) + 45 * Math.exp(-(((ph - 0.62) / 0.05) ** 2));
    x === x0 ? ctx.moveTo(x, y - v) : ctx.lineTo(x, y - v); }
  ctx.stroke(); ctx.shadowBlur = 0; ctx.font = font(34, 800, 'UI'); ctx.fillStyle = '#BFF7FF'; ctx.textAlign = 'center'; ctx.fillText('NODO SINUSAL: SU PROPIO MARCAPASOS', W / 2, y + 120); ctx.restore();
}
function sparks(ctx, t, x, y) {
  if (t < T.electricidad - 0.2 || t > S[5]) return;
  ctx.save(); ctx.strokeStyle = '#BFF7FF'; ctx.lineWidth = 5; ctx.shadowColor = '#7FF0FF'; ctx.shadowBlur = 20; ctx.lineCap = 'round';
  const q = Math.floor(t * 12);
  for (let i = 0; i < 6; i++) { if (hash01(q * 7 + i, 3) < 0.4) continue; const a0 = hash01(q * 5 + i, 4) * 6.283; ctx.beginPath(); ctx.moveTo(x, y);
    let px = x, py = y; for (let s = 1; s <= 4; s++) { px += Math.cos(a0 + (hash01(q + i * 9 + s, 6) - 0.5)) * 22; py += Math.sin(a0 + (hash01(q + i * 9 + s, 7) - 0.5)) * 22; ctx.lineTo(px, py); } ctx.stroke(); }
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 10 + 4 * Math.sin(t * 30), 0, 6.283); ctx.fill(); ctx.restore();
}
function secretBubble(ctx, t, x, y) {
  const k = t >= T.secreto - 0.1 && t < S[2] ? Math.min(1, spring(t - T.secreto + 0.1, SPRING.bouncy)) * (1 - prog(t, S[2] - 0.3, S[2])) : 0; if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 78, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.arc(-62, 70, 18, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.arc(-92, 104, 10, 0, 6.283); ctx.fill();
  ctx.font = font(110, 900, 'Heavy'); ctx.textAlign = 'center'; ctx.fillStyle = '#E8434F'; ctx.fillText('?', 0, 38); ctx.restore();
}
function renewCards(ctx, t) {
  if (t < T.piel - 0.1 || t > S[7]) return;
  const rows = [[T.piel, 'PIEL', '1 MES', 'skin'], [T.globulos, 'GLÓBULOS ROJOS', '4 MESES', 'cell'], [T.celulas, 'CORAZÓN', t >= T.edad ? 'TU EDAD' : '¿ ?', 'heart']];
  const out = 1 - prog(t, S[7] - 0.25, S[7]);
  rows.forEach(([t0, name, val, icon], i) => {
    if (t < t0 - 0.1) return;
    const k = Math.min(1, spring(t - t0 + 0.1, SPRING.snappy)) * out, y = 260 + i * 190, x = 90 + (1 - k) * -120, hot = icon === 'heart' && t >= T.edad;
    glassCard(ctx, x, y, W - 180, 160, k, { border: hot ? '#FF4D5A' : 'rgba(255,201,74,0.55)' });
    ctx.save(); ctx.globalAlpha = k;
    if (icon === 'skin') { ctx.save(); ctx.translate(x + 95, y + 80); ctx.strokeStyle = '#F2C4A0'; ctx.lineWidth = 7; ctx.lineCap = 'round'; for (let j = 0; j < 3; j++) { ctx.beginPath(); for (let s = -42; s <= 42; s += 6) ctx.lineTo(s, -22 + j * 22 + Math.sin(s * 0.12 + j) * 6); ctx.stroke(); } ctx.restore(); }
    if (icon === 'cell') O.bloodCell(ctx, x + 95, y + 80, 44, 0, 0.85);
    if (icon === 'heart') O.heart(ctx, x + 95, y + 96, 96, { beat: pulse(t) });
    ctx.textAlign = 'left'; ctx.font = font(40, 900, 'Heavy'); ctx.fillStyle = '#fff'; ctx.fillText(name, x + 180, y + 66);
    ctx.font = font(58, 900, 'Heavy'); ctx.fillStyle = hot ? '#FF5A66' : GOLD; ctx.fillText(val, x + 180, y + 128);
    ctx.font = font(28, 800, 'UI'); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.textAlign = 'right'; ctx.fillText(icon === 'heart' ? 'casi no se renueva' : 'se renueva', x + W - 210, y + 66);
    ctx.restore();
  });
}
function beatDial(ctx, t, hx, hy) {
  if (t < T.relaja - 0.2 || t > S[9]) return;
  const k = Math.min(1, spring(t - T.relaja + 0.2, SPRING.snappy)) * (1 - prog(t, S[9] - 0.3, S[9])), R = 285;
  const b = lastBeat(t) ?? 0, ph = clamp((t - b) / 0.92), a0 = -Math.PI / 2;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(hx, hy); ctx.lineCap = 'round';
  ctx.lineWidth = 26; ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.283); ctx.stroke();
  ctx.strokeStyle = '#FF4D5A'; ctx.shadowColor = '#FF4D5A'; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(0, 0, R, a0, a0 + 2.094); ctx.stroke();
  ctx.strokeStyle = '#4DA3FF'; ctx.shadowColor = '#4DA3FF'; ctx.beginPath(); ctx.arc(0, 0, R, a0 + 2.15, a0 + 6.23); ctx.stroke();
  ctx.shadowBlur = 0; const an = a0 + ph * 6.283; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(Math.cos(an) * R, Math.sin(an) * R, 22, 0, 6.283); ctx.fill();
  if (t > T.dos - 0.1) { ctx.textAlign = 'center'; ctx.font = font(54, 900, 'Heavy'); ctx.fillStyle = '#FF7A84'; ctx.fillText('1/3 TRABAJA', 0, -R - 60); ctx.fillStyle = '#86C1FF'; ctx.fillText('2/3 DESCANSA', 0, R + 92); }
  ctx.restore();
}
function employee(ctx, t) {
  if (t < T.trabajador - 0.1 || t > S[10]) return;
  const k = Math.min(1, spring(t - T.trabajador + 0.1, SPRING.snappy)) * (1 - prog(t, S[10] - 0.25, S[10])), x = 120, y = 230, w = W - 240, h = 420;
  glassCard(ctx, x, y, w, h, k);
  ctx.save(); ctx.globalAlpha = k; ctx.textAlign = 'left'; ctx.font = font(34, 800, 'UI'); ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText('FICHA DEL EMPLEADO · CORAZÓN', x + 50, y + 70);
  [['Llegadas tarde', '0', '#fff'], ['Faltas', '0', '#fff'], ['Horas extra', 'TODAS', GOLD]].forEach(([a, v, c], i) => {
    ctx.globalAlpha = k * clamp((t - T.trabajador - i * 0.45) * 4); ctx.font = font(48, 900, 'Heavy'); ctx.fillStyle = '#fff'; ctx.fillText(a, x + 50, y + 160 + i * 90);
    ctx.textAlign = 'right'; ctx.fillStyle = c; ctx.fillText(v, x + w - 50, y + 160 + i * 90); ctx.textAlign = 'left'; });
  ctx.restore();
  UI.stamp(ctx, 'EMPLEADO DEL AÑO', W / 2, y + h - 10, t, T.tarde, { size: 62, tEnd: S[10] - 0.2 });
}
function captionsBig(ctx, t, y = 1300) {
  const c = CAP.captions.find((c) => t >= c.t - 0.03 && t < c.end); if (!c) return;
  const words = c.words.map((w) => (w.o || w.w).toUpperCase());
  let sz = 94; const gap = () => sz * 0.26;
  const measure = () => { ctx.font = font(sz, 900, 'Heavy'); return words.reduce((a, w, i) => a + ctx.measureText(w).width + (i ? gap() : 0), 0); };
  while (measure() > W - 150 && sz > 50) sz -= 3;
  const k = Math.min(1, spring(t - c.t + 0.03, { stiffness: 620, damping: 26 }));
  ctx.save(); ctx.translate(W / 2, y); ctx.scale(lerp(0.85, 1, k), lerp(0.85, 1, k)); ctx.globalAlpha = Math.min(1, k * 1.5);
  ctx.font = font(sz, 900, 'Heavy'); ctx.textAlign = 'left'; ctx.lineJoin = 'round'; let x = -measure() / 2;
  c.words.forEach((w, i) => { const on = t >= w.t - 0.03;
    ctx.strokeStyle = 'rgba(6,10,26,0.9)'; ctx.lineWidth = sz * 0.16; if (i) x += gap(); ctx.strokeText(words[i], x, 0);
    ctx.fillStyle = w.k ? (on ? GOLD : 'rgba(255,201,74,0.55)') : on ? '#fff' : 'rgba(255,255,255,0.55)'; ctx.fillText(words[i], x, 0); x += ctx.measureText(words[i]).width; });
  ctx.restore();
}

M.film({
  fonts: [font(100, 900, 'Heavy'), font(100, 800, 'UI'), font(100, 400, 'Display')],
  hits: HITS, samples: 2,
  async init() {
    CAP = await fetch('captions.json').then((r) => r.json());
    const tm = await fetch('timing.json').then((r) => r.json());
    S.push(...tm.S); Object.assign(T, tm.T);
    HB = (await fetch('beats.json').then((r) => r.json())).heartbeats || [];
    HITS.push(...hitList());
  },
  draw(ctx, u, t) {
    const pl = pulse(t);
    // heart pose [x, y, size] per sentence, gliding between them
    const [hx, hy, hs] = keys(t, [
      [0, [540, 820, 50]], [T.nacieras - 0.7, [540, 840, 640]],
      [S[1], [560, 860, 600]], [S[2], [540, 1000, 460]], [S[3], [540, 1080, 240]], [S[4], [540, 880, 660]],
      [S[5], [540, 1060, 260]], [S[7], [540, 860, 660]], [S[8], [540, 770, 380]], [S[9], [540, 960, 380]],
      [S[10], [600, 800, 230]], [S[11], [640, 700, 190]], [S[12], [540, 860, 620]],
    ], 0.9);
    const dim = keys(t, [[0, 0], [S[7], 1], [T.relaja, 0]], 0.35);
    background(ctx, t, hx, hy, hs, dim);
    // torso + hand + liver for the last part
    const ta = keys(t, [[0, 0], [S[10], 1], [S[12], 0]], 0.8);
    if (ta > 0.01) {
      O.torso(ctx, 540, 1060, 1180, { a: ta });
      const la = keys(t, [[0, 0], [S[11], 1], [S[12], 0]], 0.6);
      if (la > 0.01) { ctx.save(); ctx.globalAlpha = la; O.liver(ctx, 430, 980, 440 * (0.85 + 0.15 * la), { glow: t > T.organo ? 0.6 + 0.4 * Math.sin(t * 5) : 0 }); ctx.restore(); }
    }
    // the protagonist
    const wr = (() => { if (t < T.electricidad - 0.2 || t > S[5]) return -1; const b = lastBeat(t + 0.1); return b === undefined ? -1 : (t + 0.1 - b) * 420; })();
    const grow = t < S[1] ? Math.min(1, spring(t - 0.05, SPRING.gentle)) : 1;
    O.heart(ctx, hx, hy, hs * grow, { style: 'flat', beat: dim > 0.5 && t < T.descansa + 0.6 ? 0 : pl, wave: wr > 260 ? -1 : wr, glow: dim > 0.5 ? 0.3 : 0 });
    const [sx, sy] = O.heartLocal(hx, hy, hs, O.SA_NODE); sparks(ctx, t, sx, sy);
    secretBubble(ctx, t, hx + hs * 0.42, hy - hs * 0.62);
    stream(ctx, t, hx, hy, hs);
    // hand on the chest
    if (t > T.mano - 0.3 && t < S[11] + 0.3) { const k = E.outCubic(clamp((t - T.mano + 0.3) / 0.5)) * (1 - prog(t, S[11] - 0.1, S[11] + 0.3));
      ctx.save(); ctx.globalAlpha = k; O.hand(ctx, lerp(W + 200, hx + 40, k), hy + 20, 300, { rot: -0.4 }); ctx.restore(); }
    // overlays
    counter(ctx, t, T.cien - 0.05, T.tres - 0.05, 100000, 'LATIDOS AL DÍA');
    counter(ctx, t, T.tres - 0.05, S[3], 3000000000, 'LATIDOS EN TU VIDA');
    barrels(ctx, t); ecg(ctx, t); renewCards(ctx, t); beatDial(ctx, t, hx, hy + hs * 0.12); employee(ctx, t);
    if (t > T.descansa - 0.05 && t < S[8]) { const k = Math.min(1, spring(t - T.descansa, SPRING.bouncy)) * (1 - prog(t, S[8] - 0.25, S[8]));
      ctx.save(); ctx.globalAlpha = k; ctx.font = font(64, 900, 'Heavy'); ctx.textAlign = 'center'; ctx.fillStyle = '#86C1FF'; ctx.fillText('Z z z', hx + hs * 0.45, hy - hs * 0.55 - k * 30); ctx.restore(); }
    UI.pill(ctx, 'PRÓXIMO CAPÍTULO: EL HÍGADO', W / 2, 1150, t, T.organo, { tEnd: S[12] - 0.1, bg: '#E63B2E', fg: '#fff', size: 44 });
    UI.pill(ctx, 'COMPÁRTELO', W / 2, 1150, t, T.compartele + 0.2, { bg: '#E63B2E', fg: '#fff', size: 56 });
    const fl = t >= T.descansa ? Math.exp(-(t - T.descansa) * 6) * 0.45 : 0; if (fl > 0.01) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
    captionsBig(ctx, t);
    UI.watermark(ctx);
  },
});
