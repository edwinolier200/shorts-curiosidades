import * as M from './lib/motion.js';
import { heart } from './lib/organs2d.js';
const { W, H } = M;
const BG = [['#14213D', '#0B1226'], ['#2B1B4A', '#160C2C'], ['#FFF4E0', '#FFE2B8'], ['#FFD84D', '#FFB72B']];
const ST = ['flat', 'face', 'kids', 'sticker'];
M.film({ fonts: [], samples: 1, draw(ctx, u, t) {
  const i = Math.min(3, Math.floor(t)); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, BG[i][0]); g.addColorStop(1, BG[i][1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (i === 0) { for (let k = 0; k < 60; k++) { ctx.fillStyle = `rgba(255,255,255,${0.2 + M.hash01(k, 2) * 0.5})`; ctx.beginPath(); ctx.arc(M.hash01(k, 3) * W, M.hash01(k, 4) * H, 2 + M.hash01(k, 5) * 3, 0, 6.283); ctx.fill(); } }
  heart(ctx, W / 2, H * 0.5, 700, { style: ST[i], beat: 0, mood: 'happy', t: 1 });
} });
