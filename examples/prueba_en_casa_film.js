import * as M from './lib/motion.js';
import * as K from './lib/props2d.js';
const { W, H, font } = M;
function cap(ctx, words, hi) { ctx.save(); ctx.font = font(64, 800, 'UI'); ctx.textAlign = 'center'; const s = words.join(' ');
  ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText(s, W / 2, 330); ctx.restore(); }
M.film({ fonts: [font(100, 900, 'Heavy'), font(100, 800, 'UI')], samples: 1, draw(ctx, u, t) {
  const v = Math.min(2, Math.floor(t));
  K.texturedBg(ctx, W, H, v === 0 ? ['#5A3A1A', '#1E1206'] : ['#22406E', '#0C1A33']);
  if (v === 0) { cap(ctx, ['Don', 'Tito', 'lo', 'explica']); K.tito(ctx, W / 2, 1200, 900, { mouth: 0.6, mood: 'smile' }); }
  if (v === 1) { cap(ctx, ['Te', 'mides', 'antes']); K.meter(ctx, W / 2, 950, 620, { value: '90', unit: 'mg/dL', state: 'ok', drop: 1 }); }
  if (v === 2) { cap(ctx, ['dos', 'horas', 'después']); K.meter(ctx, 330, 760, 360, { value: '160', unit: 'mg/dL', state: 'warn' }); K.clock(ctx, 760, 760, 160, { sweep: 0.17 });
    K.chart(ctx, 90, 1020, 900, 330, { good: 1, bad: 1 }); K.check(ctx, 520, 640, 50, 0); }
} });
