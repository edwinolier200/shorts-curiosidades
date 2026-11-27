import * as M from './lib/motion.js';
import * as K from './lib/props2d.js';
import * as O from './lib/organs2d.js';
const { W, H, font, hash01 } = M;
function bg(ctx, t, hx, hy, hs) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#16244A'); g.addColorStop(1, '#0A1128'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let k = 0; k < 70; k++) { ctx.fillStyle = `rgba(255,255,255,${0.15 + 0.35 * hash01(k, 2)})`; ctx.beginPath(); ctx.arc(hash01(k, 3) * W, hash01(k, 4) * H, 1.5 + hash01(k, 5) * 2.5, 0, 6.283); ctx.fill(); }
  for (let k = 0; k < 12; k++) { ctx.save(); ctx.globalAlpha = 0.3; O.bloodCell(ctx, hash01(k, 7) * W, hash01(k, 9) * H, 14 + 20 * hash01(k, 12), k, 0.6); ctx.restore(); }
  const r = ctx.createRadialGradient(hx, hy, 0, hx, hy, hs); r.addColorStop(0, 'rgba(160,70,60,0.35)'); r.addColorStop(1, 'rgba(160,70,60,0)'); ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
}
function cap(ctx, s, k) { ctx.save(); ctx.font = font(82, 900, 'Heavy'); ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(6,10,26,0.9)'; ctx.lineWidth = 15; const [a, b] = s.split('|'); const w = ctx.measureText(a + ' ' + b).width;
  ctx.strokeText(a, W / 2, 1230); ctx.strokeText(b, W / 2, 1340); ctx.fillStyle = '#fff'; ctx.fillText(a, W / 2, 1230); ctx.fillStyle = '#FFC94A'; ctx.fillText(b, W / 2, 1340); ctx.restore(); }
M.film({ fonts: [font(100, 900, 'Heavy'), font(100, 800, 'UI')], samples: 1, draw(ctx, u, t) {
  const v = Math.min(2, Math.floor(t));
  if (v === 0) { bg(ctx, t, 540, 820, 700); O.liver(ctx, 560, 760, 640, { glow: 0.5 }); K.tito(ctx, 230, 1720, 560, { mouth: 0.6, look: [0.7, -0.6] });
    ctx.save(); ctx.font = font(44, 900, 'Heavy'); ctx.fillStyle = '#FFC94A'; ctx.textAlign = 'left'; ctx.fillText('LUNES DEL CUERPO', 70, 440); ctx.restore(); cap(ctx, 'TU HÍGADO|PUEDE VOLVER A CRECER', 1); }
  if (v === 1) { bg(ctx, t, 540, 860, 700); O.heart(ctx, 600, 860, 640); K.tito(ctx, 230, 1720, 560, { mouth: 0.3, mood: 'wow', look: [0.8, -0.7] }); cap(ctx, 'MIENTRAS VES|ESTO, TU CORAZÓN…', 1); }
  if (v === 2) { bg(ctx, t, 540, 860, 700); K.tito(ctx, 540, 1250, 1000, { mouth: 0.5, mood: 'smile' });
    ctx.save(); ctx.translate(540, 560); ctx.rotate(-0.03); ctx.font = font(70, 900, 'Heavy'); const s = 'HOY EN EL CUERPO:'; ctx.fillStyle = '#FFC94A'; const w = ctx.measureText(s).width; ctx.fillRect(-w / 2 - 24, -66, w + 48, 92); ctx.fillStyle = '#14121C'; ctx.textAlign = 'center'; ctx.fillText(s, 0, 0); ctx.restore();
    O.liver(ctx, 540, 760, 360); }
} });
