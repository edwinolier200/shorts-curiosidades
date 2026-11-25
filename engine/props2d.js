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

// ---- more objects for the "prueba en casa" format (same flat language: rounded, gradient, one shadow, one highlight)
export function plate(ctx, x, y, size) {                       // a typical lunch: rice, beans, meat, salad, plantain
  const s = size / 400; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20; ctx.fillStyle = '#F4F6F8'; ctx.beginPath(); ctx.ellipse(0, 0, 200, 120, 0, 0, 6.283); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#C9D3DD'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, 160, 94, 0, 0, 6.283); ctx.stroke();
  ctx.fillStyle = '#FFFDF5'; ctx.beginPath(); ctx.ellipse(-60, -20, 78, 48, 0, 0, 6.283); ctx.fill();                                   // rice
  ctx.fillStyle = 'rgba(0,0,0,0.06)'; for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.ellipse(-60 + (hash01(i, 1) - 0.5) * 120, -20 + (hash01(i, 2) - 0.5) * 70, 6, 3, hash01(i, 3) * 3, 0, 6.283); ctx.fill(); }
  ctx.fillStyle = '#6B2E1E'; ctx.beginPath(); ctx.ellipse(55, -35, 62, 36, 0.2, 0, 6.283); ctx.fill();                                   // beans
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.ellipse(40, -48, 20, 8, 0.2, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#A8552E'; ctx.beginPath(); ctx.roundRect(10, 10, 110, 60, 24); ctx.fill();                                            // meat
  ctx.fillStyle = '#E9B84A'; ctx.beginPath(); ctx.ellipse(-60, 45, 50, 22, -0.2, 0, 6.283); ctx.fill();                                 // fried plantain
  ctx.fillStyle = '#4CAF50'; [[-140, 10], [-125, 35], [140, 30]].forEach(([a, b]) => { ctx.beginPath(); ctx.ellipse(a, b, 22, 12, 0.6, 0, 6.283); ctx.fill(); });
  ctx.restore();
}
export function sugarCube(ctx, x, y, size, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const h = size / 2;
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(-h, -h, size, size, size * 0.18); ctx.fill();
  ctx.fillStyle = 'rgba(120,150,200,0.25)'; ctx.beginPath(); ctx.roundRect(-h, h * 0.2, size, h * 0.8, size * 0.18); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; for (let i = 0; i < 6; i++) { ctx.fillRect(-h + hash01(i, 4) * size * 0.8, -h + hash01(i, 5) * size * 0.8, 4, 4); }
  ctx.restore();
}
export function chair(ctx, x, y, size) {
  const s = size / 300; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#8A5A3B'; ctx.strokeStyle = '#4A2E1E'; ctx.lineWidth = 6;
  [[-100, -260, 30, 260], [70, -260, 30, 260], [-100, 0, 30, 140], [70, 0, 30, 140]].forEach(([a, b, w, h]) => { ctx.beginPath(); ctx.roundRect(a, b, w, h, 10); ctx.fill(); ctx.stroke(); });
  ctx.fillStyle = '#B87A4E'; ctx.beginPath(); ctx.roundRect(-120, -20, 240, 40, 14); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-100, -250, 200, 60, 14); ctx.fill(); ctx.stroke(); ctx.restore();
}
// a flat walking person (generic, faceless) — phase drives the stride
export function walker(ctx, x, y, size, phase = 0, { shirt = '#3BA7F5', pants = '#5C78C8', glow = 0 } = {}) {
  const s = size / 600; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round';
  const sw = Math.sin(phase * Math.PI * 2), bob = Math.abs(Math.cos(phase * Math.PI * 2)) * 10;
  ctx.translate(0, -bob);
  const leg = (a, col) => { ctx.save(); ctx.translate(0, 40); ctx.rotate(a); ctx.strokeStyle = col; ctx.lineWidth = 56; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 120); ctx.stroke();
    ctx.translate(0, 120); ctx.rotate(Math.max(0, -a) * 0.9); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 120); ctx.stroke(); ctx.fillStyle = '#F5F5F5'; ctx.beginPath(); ctx.ellipse(16, 128, 44, 22, 0, 0, 6.283); ctx.fill(); ctx.restore(); };
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, 290, 170, 26, 0, 0, 6.283); ctx.fill();
  leg(-sw * 0.45, '#46609F'); if (glow > 0) { ctx.save(); ctx.shadowColor = `rgba(255,220,90,${glow})`; ctx.shadowBlur = 60; leg(sw * 0.45, pants); ctx.restore(); } else leg(sw * 0.45, pants);
  const arm = (a, col) => { ctx.save(); ctx.translate(0, -150); ctx.rotate(a); ctx.strokeStyle = col; ctx.lineWidth = 40; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 180); ctx.stroke(); ctx.restore(); };
  arm(sw * 0.5, '#2F8FD8');
  ctx.fillStyle = shirt; ctx.beginPath(); ctx.roundRect(-70, -190, 140, 250, 60); ctx.fill();
  arm(-sw * 0.5, shirt);
  ctx.fillStyle = '#E9A77E'; ctx.beginPath(); ctx.arc(0, -260, 62, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#3A2A20'; ctx.beginPath(); ctx.arc(0, -275, 62, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  ctx.restore();
}
// horizontal comparison bars (label, value 0..1, colour) with the value text
export function bars(ctx, x, y, w, rows, k = 1, labelFont = '800 38px UI', valueFont = '900 58px Heavy') {
  ctx.save(); ctx.translate(x, y);
  rows.forEach(([label, v, col, txt], i) => { const yy = i * 170;
    ctx.fillStyle = '#fff'; ctx.font = labelFont; ctx.textAlign = 'left'; ctx.fillText(label, 0, yy);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.roundRect(0, yy + 22, w, 70, 35); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(0, yy + 22, Math.max(70, w * v * k), 70, 35); ctx.fill();
    if (txt) { ctx.fillStyle = '#fff'; ctx.font = valueFont; ctx.textAlign = 'right'; ctx.fillText(txt, w - 10, yy - 2); } });
  ctx.restore();
}
// a city block seen from above with a dot walking around it (p = 0..1 of the lap)
export function block(ctx, x, y, size, p = 0) {
  const s = size / 500; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#2B3A55'; ctx.beginPath(); ctx.roundRect(-250, -250, 500, 500, 40); ctx.fill();
  ctx.fillStyle = '#3E8E5A'; ctx.beginPath(); ctx.roundRect(-180, -180, 360, 360, 26); ctx.fill();
  [[-130, -130], [20, -130], [-130, 20], [20, 20]].forEach(([a, b], i) => { ctx.fillStyle = ['#E8A24A', '#D9534F', '#5BA4E6', '#F2D16B'][i]; ctx.beginPath(); ctx.roundRect(a, b, 110, 110, 14); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(a + 20, b + 20, 24, 24); ctx.fillRect(a + 64, b + 20, 24, 24); });
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.setLineDash([22, 18]); ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(-215, -215, 430, 430, 30); ctx.stroke(); ctx.setLineDash([]);
  const per = 4 * 430, d = (p % 1) * per; let px, py;
  if (d < 430) { px = -215 + d; py = -215; } else if (d < 860) { px = 215; py = -215 + d - 430; } else if (d < 1290) { px = 215 - (d - 860); py = 215; } else { px = -215; py = 215 - (d - 1290); }
  ctx.strokeStyle = '#FFC94A'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-215, -215);
  for (let q = 0; q <= d; q += 10) { let qx, qy; if (q < 430) { qx = -215 + q; qy = -215; } else if (q < 860) { qx = 215; qy = -215 + q - 430; } else if (q < 1290) { qx = 215 - (q - 860); qy = 215; } else { qx = -215; qy = 215 - (q - 1290); } ctx.lineTo(qx, qy); }
  ctx.stroke(); ctx.fillStyle = '#fff'; ctx.shadowColor = '#FFC94A'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(px, py, 22, 0, 6.283); ctx.fill(); ctx.restore();
}
