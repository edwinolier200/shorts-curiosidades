// Infographic thumbnails for E02 (3 variants, one per second): drawn in the same style as the video.
import * as M from './lib/motion.js';
import * as O from './lib/organs2d.js';
const { W, H, hash01, font } = M;
const P = H > W;                                    // portrait (Shorts) or landscape
const GOLD = '#FFC94A';
function bg(ctx, hx, hy, hs) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1A2A58'); g.addColorStop(1, '#0A1128'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(hx, hy); for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI * 2 / 18); ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.045)' : 'rgba(255,201,74,0.06)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, -2400); ctx.lineTo(90, -2400); ctx.fill(); } ctx.restore();
  for (let k = 0; k < 80; k++) { ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.5 * hash01(k, 2)})`; ctx.beginPath(); ctx.arc(hash01(k, 3) * W, hash01(k, 4) * H, 1.5 + hash01(k, 5) * 3, 0, 6.283); ctx.fill(); }
  for (let k = 0; k < 12; k++) { ctx.save(); ctx.globalAlpha = 0.5; O.bloodCell(ctx, hash01(k, 7) * W, hash01(k, 9) * H, 16 + 26 * hash01(k, 12), k, 0.5 + 0.4 * hash01(k, 13)); ctx.restore(); }
  const r = ctx.createRadialGradient(hx, hy, 0, hx, hy, hs * 1.0); r.addColorStop(0, 'rgba(255,70,90,0.55)'); r.addColorStop(1, 'rgba(255,70,90,0)'); ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
}
function txt(ctx, s, x, y, size, color = '#fff', align = 'center') {
  ctx.save(); ctx.font = font(size, 900, 'Heavy'); ctx.textAlign = align; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#070B1C'; ctx.lineWidth = size * 0.2; ctx.strokeText(s, x, y); ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.restore();
}
function marker(ctx, s, x, y, size, rot = -0.03, bgc = GOLD, fg = '#14121C', align = 'center') {
  ctx.save(); ctx.font = font(size, 900, 'Heavy'); const w = ctx.measureText(s).width, pad = size * 0.28;
  const x0 = align === 'center' ? x - w / 2 : x; ctx.translate(x0 + w / 2, y - size * 0.35); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-w / 2 - pad + 10, -size * 0.62 + 12, w + pad * 2, size * 1.2);
  ctx.fillStyle = bgc; ctx.fillRect(-w / 2 - pad, -size * 0.62, w + pad * 2, size * 1.2);
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.fillText(s, 0, size * 0.36); ctx.restore();
}
function dial(ctx, x, y, R, w) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = w; const a0 = -Math.PI / 2;
  ctx.strokeStyle = '#FF4D5A'; ctx.shadowColor = '#FF4D5A'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.arc(x, y, R, a0, a0 + 2.094); ctx.stroke();
  ctx.strokeStyle = '#4DA3FF'; ctx.shadowColor = '#4DA3FF'; ctx.beginPath(); ctx.arc(x, y, R, a0 + 2.2, a0 + 6.18); ctx.stroke(); ctx.restore();
}
function zzz(ctx, x, y, s) { [[0, 0, 1], [s * 0.55, -s * 0.6, 0.75], [s * 1.0, -s * 1.1, 0.55]].forEach(([dx, dy, k]) => txt(ctx, 'Z', x + dx, y + dy, s * k, '#9CCBFF')); }
function bubble(ctx, x, y, r) {
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.arc(x - r * 0.8, y + r * 0.95, r * 0.22, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.arc(x - r * 1.15, y + r * 1.35, r * 0.12, 0, 6.283); ctx.fill();
  ctx.shadowBlur = 0; ctx.font = font(r * 1.5, 900, 'Heavy'); ctx.textAlign = 'center'; ctx.fillStyle = '#E8434F'; ctx.fillText('?', x, y + r * 0.52); ctx.restore();
}
M.film({ fonts: [font(100, 900, 'Heavy')], samples: 1, draw(ctx, u, t) {
  const v = Math.min(2, Math.floor(t));
  if (P) {
    const hx = 540, hy = v === 2 ? 1120 : 1060, hs = v === 2 ? 700 : 780;
    bg(ctx, hx, hy, hs);
    if (v === 0) { dial(ctx, hx, hy + 60, 450, 34); O.heart(ctx, hx, hy, hs); zzz(ctx, 800, 690, 120);
      txt(ctx, 'TU CORAZÓN', 540, 330, 130); marker(ctx, 'SÍ DESCANSA', 540, 520, 140); marker(ctx, '2/3 DE SU VIDA', 540, 1640, 70, 0.02, '#4DA3FF', '#fff'); }
    if (v === 1) { O.heart(ctx, hx, hy, hs); bubble(ctx, 820, 680, 130);
      txt(ctx, '¿TU CORAZÓN', 540, 330, 130); txt(ctx, 'DESCANSA?', 540, 500, 150, GOLD); marker(ctx, 'NADIE TE LO DIJO', 540, 1640, 70, 0.02, '#E63B2E', '#fff'); }
    if (v === 2) { O.heart(ctx, hx, hy, hs);
      txt(ctx, '3.000.000.000', 540, 360, 128, GOLD); txt(ctx, 'LATIDOS…', 540, 500, 100); marker(ctx, 'Y SÍ DESCANSA', 540, 680, 110); zzz(ctx, 820, 860, 100); }
  } else {
    ctx.save(); ctx.scale(W / 1280, H / 720);
    const hx = 330, hy = 420, hs = 470;
    bg(ctx, hx, hy, hs);
    if (v === 0) { dial(ctx, hx, hy + 40, 280, 24); O.heart(ctx, hx, hy, hs); zzz(ctx, 520, 180, 70);
      txt(ctx, 'TU CORAZÓN', 900, 250, 80); marker(ctx, 'SÍ DESCANSA', 900, 410, 84); marker(ctx, '2/3 DE SU VIDA', 900, 570, 50, 0.02, '#4DA3FF', '#fff'); }
    if (v === 1) { O.heart(ctx, hx, hy, hs); bubble(ctx, 530, 170, 70);
      txt(ctx, '¿TU CORAZÓN', 900, 270, 80); txt(ctx, 'DESCANSA?', 900, 400, 96, GOLD); marker(ctx, 'NADIE TE LO DIJO', 900, 570, 50, 0.02, '#E63B2E', '#fff'); }
    if (v === 2) { O.heart(ctx, hx, hy, hs);
      txt(ctx, '3.000.000.000', 900, 240, 68, GOLD); txt(ctx, 'LATIDOS…', 900, 350, 66); marker(ctx, 'Y SÍ DESCANSA', 900, 510, 74); zzz(ctx, 520, 190, 64); }
    ctx.restore();
  }
} });
