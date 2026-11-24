// props2d.js — "prueba en casa" kit: an original narrator character + drawn devices for practical health explainers.
// Style: soft flat cartoon on a dark-blue textured background (the format of high-share practical-health Shorts),
// never a copy of any channel's character. Pure canvas, pure function of its arguments.
//   import * as K from './lib/props2d.js';
//   K.tito(ctx, x, y, size, { mouth: 0..1, blink: 0..1, look: [dx,dy], mood: 'smile'|'wow'|'serious' })   // the narrator: "Don Tito"
//   K.meter(ctx, x, y, size, { value: '90', unit: 'mg/dL', state: 'ok'|'warn'|'off', strip: true, drop: 0..1 })
//   K.clock(ctx, x, y, r, { sweep: 0..1 })      K.chart(ctx, x, y, w, h, { good: 0..1, bad: 0..1 })
//   K.spotlightRow(ctx, items, t)               K.check(ctx, x, y, r, k)    K.texturedBg(ctx, W, H, tint)
import { hash01 } from './motion.js';

export function texturedBg(ctx, W, H, [c0, c1] = ['#22406E', '#0C1A33']) {
  const g = ctx.createRadialGradient(W / 2, H * 0.42, 50, W / 2, H * 0.42, H * 0.8); g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) { ctx.fillStyle = `rgba(255,255,255,${0.012 + 0.025 * hash01(i, 3)})`; ctx.beginPath(); ctx.ellipse(hash01(i, 1) * W, hash01(i, 2) * H, 30 + 120 * hash01(i, 4), 20 + 60 * hash01(i, 5), hash01(i, 6) * 3, 0, 6.283); ctx.fill(); }
}

// ---- Don Tito: friendly grandfather-doctor narrator (original design: round face, white side hair, round glasses, grey moustache, white coat, bow tie)
export function tito(ctx, x, y, size, { mouth = 0, blink = 0, look = [0, 0], mood = 'smile' } = {}) {
  const s = size / 600; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const ink = '#2A1A14', skin = '#F2C29B', skinS = '#D99C74';
  const stroke = (w = 7) => { ctx.strokeStyle = ink; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); };
  // coat + shoulders
  ctx.fillStyle = '#F5F7FA'; ctx.beginPath(); ctx.moveTo(-250, 300); ctx.bezierCurveTo(-240, 150, -150, 110, 0, 105); ctx.bezierCurveTo(150, 110, 240, 150, 250, 300); ctx.closePath(); ctx.fill(); stroke();
  ctx.fillStyle = '#7FB2E5'; ctx.beginPath(); ctx.moveTo(-60, 110); ctx.lineTo(0, 210); ctx.lineTo(60, 110); ctx.closePath(); ctx.fill(); stroke(5);           // shirt
  ctx.fillStyle = '#D9434F'; ctx.beginPath(); ctx.moveTo(0, 140); ctx.lineTo(-38, 120); ctx.lineTo(-38, 162); ctx.closePath(); ctx.moveTo(0, 140); ctx.lineTo(38, 120); ctx.lineTo(38, 162); ctx.closePath(); ctx.fill(); stroke(5);  // bow tie
  ctx.strokeStyle = '#9AA6B2'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-120, 130); ctx.quadraticCurveTo(-150, 220, -95, 250); ctx.stroke();                    // stethoscope
  ctx.fillStyle = '#C9D2DC'; ctx.beginPath(); ctx.arc(-95, 255, 18, 0, 6.283); ctx.fill(); stroke(4);
  // neck + head
  ctx.fillStyle = skinS; ctx.fillRect(-45, 60, 90, 60);
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, -40, 150, 165, 0, 0, 6.283); ctx.fill(); stroke();
  ctx.beginPath(); ctx.ellipse(-150, -20, 28, 40, 0, 0, 6.283); ctx.ellipse(150, -20, 28, 40, 0, 0, 6.283); ctx.fillStyle = skin; ctx.fill(); stroke(6);     // ears
  ctx.fillStyle = '#EDEDED'; [[-1], [1]].forEach(([sd]) => { ctx.beginPath(); ctx.ellipse(sd * 128, -95, 50, 62, sd * 0.3, 0, 6.283); ctx.fill(); stroke(5); });   // white side hair
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(-50, -150, 60, 30, -0.3, 0, 6.283); ctx.fill();                                           // bald shine
  ctx.fillStyle = 'rgba(217,120,100,0.35)'; ctx.beginPath(); ctx.ellipse(-85, 15, 30, 18, 0, 0, 6.283); ctx.ellipse(85, 15, 30, 18, 0, 0, 6.283); ctx.fill();   // cheeks
  // eyes behind round glasses
  [-1, 1].forEach((sd) => {
    const ex = sd * 62, ey = -45;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(ex, ey, 26, 26 * (1 - blink * 0.9), 0, 0, 6.283); ctx.fill();
    if (blink < 0.6) { ctx.fillStyle = '#3B2A20'; ctx.beginPath(); ctx.arc(ex + look[0] * 8, ey + look[1] * 6 + 2, mood === 'wow' ? 9 : 12, 0, 6.283); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex + look[0] * 8 + 4, ey + look[1] * 6 - 3, 4, 0, 6.283); ctx.fill(); }
    ctx.beginPath(); ctx.arc(ex, ey, 46, 0, 6.283); ctx.strokeStyle = '#5A4636'; ctx.lineWidth = 8; ctx.stroke();
    ctx.strokeStyle = '#EDEDED'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex - 30, ey - (mood === 'wow' ? 72 : mood === 'serious' ? 56 : 64) + (sd > 0 && mood === 'serious' ? 6 : 0)); ctx.lineTo(ex + 30, ey - (mood === 'wow' ? 76 : 62)); ctx.stroke();   // eyebrows
  });
  ctx.strokeStyle = '#5A4636'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-16, -48); ctx.lineTo(16, -48); ctx.stroke();
  ctx.fillStyle = skinS; ctx.beginPath(); ctx.ellipse(0, 5, 26, 32, 0, 0, 6.283); ctx.fill();                                                                   // nose
  // mouth (opens with the voice) + moustache
  const mo = Math.max(0, Math.min(1, mouth));
  ctx.fillStyle = '#7A2E2A'; ctx.beginPath(); ctx.ellipse(0, 78, 40, 6 + 26 * mo, 0, 0, Math.PI * (mood === 'serious' ? 2 : 1)); ctx.fill(); stroke(5);
  ctx.fillStyle = '#BFC3C7'; ctx.beginPath(); ctx.moveTo(-70, 58); ctx.bezierCurveTo(-50, 25, -10, 30, 0, 45); ctx.bezierCurveTo(10, 30, 50, 25, 70, 58); ctx.bezierCurveTo(40, 62, 10, 55, 0, 52); ctx.bezierCurveTo(-10, 55, -40, 62, -70, 58); ctx.fill(); stroke(5);
  ctx.restore();
}

// ---- handheld meter (glucometer / thermometer / oximeter style), number on an LCD
export function meter(ctx, x, y, size, { value = '- - -', unit = '', state = 'off', strip = true, drop = 0 } = {}) {
  const s = size / 400; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = ctx.createLinearGradient(-130, -200, 130, 200); body.addColorStop(0, '#3E5C9A'); body.addColorStop(1, '#1F3360');
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; ctx.fillStyle = body; ctx.beginPath(); ctx.roundRect(-130, -200, 260, 380, 60); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#13213F'; ctx.lineWidth = 8; ctx.stroke();
  const lcd = { off: ['#CFE5D2', '#2A3B30'], ok: ['#B9F0C2', '#14361C'], warn: ['#FFB0AA', '#5A1410'] }[state] || ['#CFE5D2', '#2A3B30'];
  if (state === 'warn') { ctx.shadowColor = '#FF4D4D'; ctx.shadowBlur = 40; }
  ctx.fillStyle = lcd[0]; ctx.beginPath(); ctx.roundRect(-100, -160, 200, 190, 22); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#0E1A33'; ctx.lineWidth = 8; ctx.stroke();
  ctx.fillStyle = lcd[1]; ctx.textAlign = 'center'; ctx.font = `900 ${String(value).length > 3 ? 86 : 110}px Heavy`; ctx.fillText(String(value), 0, -40); ctx.font = '800 34px UI'; ctx.fillText(unit, 0, 10);
  ctx.fillStyle = '#5F7FC0'; [[-48, 100], [48, 100]].forEach(([bx, by]) => { ctx.beginPath(); ctx.arc(bx, by, 30, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#13213F'; ctx.lineWidth = 6; ctx.stroke(); });
  if (strip) { ctx.fillStyle = '#F4F4F4'; ctx.fillRect(-22, 180, 44, 120); ctx.fillStyle = '#C99A2E'; ctx.fillRect(-14, 190, 28, 20);
    if (drop > 0) { ctx.fillStyle = '#D61F2C'; ctx.beginPath(); ctx.arc(0, 270, 16 * drop, 0, 6.283); ctx.fill(); } }
  ctx.restore();
}
export function clock(ctx, x, y, r, { sweep = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.fillStyle = '#C9303A'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#FBFBF8'; ctx.beginPath(); ctx.arc(0, 0, r * 0.86, 0, 6.283); ctx.fill();
  if (sweep > 0) { ctx.fillStyle = 'rgba(255,206,110,0.55)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * 0.8, -Math.PI / 2, -Math.PI / 2 + sweep * Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = '#222'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; ctx.lineWidth = i % 3 ? 3 : 6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.66, Math.sin(a) * r * 0.66); ctx.lineTo(Math.cos(a) * r * 0.76, Math.sin(a) * r * 0.76); ctx.stroke(); }
  const am = -Math.PI / 2 + sweep * 6.283 * 2, ah = -Math.PI / 2 + sweep * 6.283 / 6;
  ctx.lineCap = 'round'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ah) * r * 0.42, Math.sin(ah) * r * 0.42); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(am) * r * 0.62, Math.sin(am) * r * 0.62); ctx.stroke();
  ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, 6.283); ctx.fill(); ctx.restore();
}
// glowing two-curve chart: a calm green line and a red spike (each drawn up to its progress 0..1)
export function chart(ctx, x, y, w, h, { good = 1, bad = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(8,16,34,0.7)'; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 22); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(20, h * i / 4); ctx.lineTo(w - 20, h * i / 4); ctx.stroke(); }
  const line = (f, col, p) => { if (p <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 24; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i <= 100 * p; i++) { const u = i / 100, px = 24 + u * (w - 48), py = h - 30 - f(u) * (h - 60); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
    const u = p, px = 24 + u * (w - 48), py = h - 30 - f(u) * (h - 60); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px, py, 10, 0, 6.283); ctx.fill(); ctx.restore(); };
  line((u) => 0.3 + 0.12 * Math.sin(u * Math.PI) , '#3BE37A', good);
  line((u) => 0.3 + 0.6 * Math.min(1, u * 3) * (1 - 0.15 * u), '#FF3B4E', bad);
  ctx.restore();
}
export function check(ctx, x, y, r, k = 1) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.fillStyle = '#2EC866'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-r * 0.45, 0); ctx.lineTo(-r * 0.1, r * 0.35); ctx.lineTo(r * 0.5, -r * 0.35); ctx.stroke(); ctx.restore();
}
