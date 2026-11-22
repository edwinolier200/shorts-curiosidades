// blocks.js — the "escalera" format: a block tag for each step of the ladder (LUNES ☕, 2/7, PASO 3…).
//   import { blockTag, ladder } from './lib/blocks.js';
//   blockTag(ctx, 'LUNES', '☕', t, T.lunes)        // slams in at the block start, sits at the top of the frame
//   ladder(ctx, ['L','M','X','J','V','S','D'], i, t) // small progress dots: which step of the ladder we are on
import { W, spring, SPRING, font, text, rrect, clamp } from './motion.js';
export function blockTag(ctx, label, emoji, t, t0, { y = 420, color = '#FFD60A', ink = '#111' } = {}) {
  const k = spring(t - t0, SPRING.bouncy);
  if (k <= 0) return;
  const s = Math.min(1.12, k);
  ctx.save(); ctx.translate(W / 2, y); ctx.rotate(-0.04); ctx.scale(s, s);
  ctx.font = font(120, 400, 'Display'); const w = ctx.measureText(label).width + (emoji ? 170 : 90);
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; rrect(ctx, -w / 2 + 12, -86, w, 150, 26); ctx.fill();
  ctx.fillStyle = color; rrect(ctx, -w / 2, -98, w, 150, 26); ctx.fill();
  text(ctx, label, emoji ? -40 : 0, 20, font(120, 400, 'Display'), ink, 'center', 4);
  if (emoji) { ctx.font = '96px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(emoji, w / 2 - 80, 14); }
  ctx.restore();
}
export function ladder(ctx, steps, i, t, { y = 300, on = '#FFD60A', off = 'rgba(255,255,255,0.25)' } = {}) {
  const gap = 96, x0 = W / 2 - ((steps.length - 1) * gap) / 2;
  steps.forEach((s, j) => {
    const x = x0 + j * gap, active = j === i, done = j < i;
    ctx.save(); ctx.fillStyle = active || done ? on : off; ctx.globalAlpha = done ? 0.6 : 1;
    ctx.beginPath(); ctx.arc(x, y, active ? 34 : 26, 0, Math.PI * 2); ctx.fill();
    text(ctx, s, x, y + 12, font(active ? 38 : 30, 800, 'UI'), active || done ? '#111' : '#fff', 'center');
    ctx.restore();
  });
}
