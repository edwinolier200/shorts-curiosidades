// organs2d.js — drawn (cartoon) organs for the "cuerpo" series. Simplified but recognisable anatomy:
// not the ❤ symbol, not the exact medical mesh. Pure canvas, a pure function of its arguments.
//   import { heart } from './lib/organs2d.js';
//   heart(ctx, x, y, size, { style: 'flat'|'face'|'kids'|'sticker', beat: 0..1, look: [dx,dy], mood: 'happy'|'tired'|'shock'|'sleep', t })
// Styles (genre references, never copies): 'flat' = rounded vector infographic with soft shading (science-explainer look);
// 'face' = the same organ as a friendly character (organ-personification shorts); 'kids' = thick outline, few colours
// (children's health cartoons); 'sticker' = bold outline + white border (meme/sticker look).
const P = {
  flat:    { body: '#E8434F', shade: '#B8263A', light: '#FF8A8F', aorta: '#F0656E', aortaS: '#C23A4A', pulm: '#5A6CF0', pulmS: '#3D4BC0', vena: '#4256D6', cor: '#FFC94A', line: null, lw: 0 },
  face:    { body: '#F0505A', shade: '#C2304A', light: '#FF9AA0', aorta: '#F56F78', aortaS: '#CC4454', pulm: '#6676F5', pulmS: '#4655C8', vena: '#4A5EDC', cor: '#FFD25A', line: '#3A0F1C', lw: 7 },
  kids:    { body: '#FF5A5F', shade: '#FF5A5F', light: '#FFB3B5', aorta: '#FF7B80', aortaS: '#FF7B80', pulm: '#6E8BFF', pulmS: '#6E8BFF', vena: '#5B76F5', cor: '#FFD84D', line: '#2B1B2E', lw: 11 },
  sticker: { body: '#FF3B4E', shade: '#D21F3C', light: '#FF8C96', aorta: '#FF5C6A', aortaS: '#D63A4C', pulm: '#4C6BFF', pulmS: '#3550D6', vena: '#3F5BE8', cor: '#FFE14D', line: '#1A0B14', lw: 9 },
};
function tube(ctx, pts, w, fill, shade, line, lw) {          // a rounded vessel along a polyline of [x,y]
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const path = () => { ctx.beginPath(); ctx.moveTo(...pts[0]); for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; ctx.quadraticCurveTo(...pts[i], ...m); } ctx.lineTo(...pts[pts.length - 1]); };
  if (line) { path(); ctx.strokeStyle = line; ctx.lineWidth = w + lw * 2; ctx.stroke(); }
  path(); ctx.strokeStyle = shade; ctx.lineWidth = w; ctx.stroke();
  path(); ctx.strokeStyle = fill; ctx.lineWidth = w * 0.62; ctx.save(); ctx.translate(-w * 0.12, -w * 0.12); ctx.stroke(); ctx.restore();
}
function bodyPath(ctx) {                                     // heart body in a 200x220 box, apex low and to the viewer's right
  ctx.beginPath();
  ctx.moveTo(-58, -48);                                      // top of right atrium (viewer's left)
  ctx.bezierCurveTo(-92, -46, -104, -8, -96, 22);            // right atrium bulge
  ctx.bezierCurveTo(-86, 64, -40, 98, 22, 122);              // right ventricle sweeping to the apex
  ctx.bezierCurveTo(40, 130, 56, 126, 62, 112);              // apex (rounded)
  ctx.bezierCurveTo(92, 66, 104, 14, 94, -22);               // left ventricle wall
  ctx.bezierCurveTo(86, -50, 58, -62, 30, -56);              // left atrium shoulder
  ctx.bezierCurveTo(6, -52, -24, -58, -58, -48);
  ctx.closePath();
}
export function heart(ctx, x, y, size, { style = 'flat', beat = 0, look = [0, 0], mood = 'happy', t = 0, wave = -1, glow = 0 } = {}) {
  const c = P[style] || P.flat, s = size / 220, sq = 1 - 0.06 * beat;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (style === 'sticker') { ctx.save(); ctx.scale(1.0, 1.0); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#fff'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 46; bodyPath(ctx); ctx.stroke(); ctx.fill();
    tube(ctx, [[-40, -50], [-44, -110], [-42, -150]], 38 + 46, '#fff', '#fff'); tube(ctx, [[10, -52], [6, -110], [40, -152], [86, -124], [92, -70]], 44 + 46, '#fff', '#fff');
    ctx.restore(); }
  // vessels behind: superior vena cava (viewer's left), aorta arch with 3 branches, pulmonary trunk splitting
  tube(ctx, [[-44, -40], [-46, -100], [-44, -148]], 38, c.vena, c.pulmS, c.line, c.lw);
  [[-6, -130, -16, -176], [24, -146, 24, -192], [52, -140, 64, -184]].forEach(([x0, y0, x1, y1]) => tube(ctx, [[x0, y0], [x1, y1]], 16, c.aorta, c.aortaS, c.line, c.lw * 0.8));
  tube(ctx, [[8, -40], [4, -112], [38, -150], [84, -126], [92, -66], [94, -20]], 44, c.aorta, c.aortaS, c.line, c.lw);
  tube(ctx, [[30, -36], [34, -86], [-10, -104], [-62, -92]], 34, c.pulm, c.pulmS, c.line, c.lw);
  tube(ctx, [[34, -86], [80, -100], [120, -92]], 26, c.pulm, c.pulmS, c.line, c.lw);
  // body (beats: squeezes toward the apex)
  ctx.save(); ctx.translate(20, 40); ctx.scale(sq, 1 - 0.04 * beat); ctx.translate(-20, -40);
  if (c.line) { ctx.lineJoin = 'round'; ctx.strokeStyle = c.line; ctx.lineWidth = c.lw * 2; bodyPath(ctx); ctx.stroke(); }
  bodyPath(ctx); const g = ctx.createLinearGradient(-90, -60, 90, 120);
  if (style === 'kids') { ctx.fillStyle = c.body; } else { g.addColorStop(0, c.light); g.addColorStop(0.35, c.body); g.addColorStop(1, c.shade); ctx.fillStyle = g; }
  ctx.fill();
  ctx.save(); bodyPath(ctx); ctx.clip();
  if (style !== 'kids') { ctx.fillStyle = 'rgba(0,0,0,0.13)'; ctx.beginPath(); ctx.ellipse(70, 60, 70, 110, -0.5, 0, 6.283); ctx.fill(); }  // shaded side
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-50, -14, 22, 42, 0.5, 0, 6.283); ctx.fill();               // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(-62, -30, 7, 12, 0.5, 0, 6.283); ctx.fill();
  // coronary arteries: the groove between ventricles + the one around the top
  ctx.strokeStyle = c.cor; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -44); ctx.bezierCurveTo(10, 10, 20, 60, 44, 118); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-70, -26); ctx.bezierCurveTo(-30, -36, 20, -38, 70, -30); ctx.stroke();
  ctx.lineWidth = 4; [[6, 0, -22, 30], [14, 34, 50, 50], [24, 70, -6, 96]].forEach(([a, b, c2, d]) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c2) / 2 + 8, (b + d) / 2, c2, d); ctx.stroke(); });
  // electrical wave from the sinoatrial node (top of the right atrium) spreading over the muscle
  if (wave > 0) { ctx.save(); ctx.shadowColor = '#7FF0FF'; ctx.shadowBlur = 30; ctx.strokeStyle = 'rgba(160,245,255,0.95)'; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(-66, -40, wave, 0, 6.283); ctx.stroke(); ctx.fillStyle = 'rgba(127,240,255,0.10)'; ctx.fill(); ctx.restore(); }
  if (glow > 0) { ctx.fillStyle = `rgba(255,170,150,${0.35 * glow})`; ctx.fillRect(-200, -200, 400, 400); }
  ctx.restore();
  // face
  if (style === 'face' || style === 'sticker') face(ctx, look, mood, t, beat);
  ctx.restore(); ctx.restore();
}
function face(ctx, [lx, ly], mood, t, beat) {
  const blink = (t % 3.7) > 3.55 ? 0.15 : 1, ex = 30, ey = 18;
  [-1, 1].forEach((sd) => {
    const cx = sd * ex + 6, cy = ey;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(cx, cy, 19, 23 * (mood === 'sleep' ? 0.12 : blink), 0, 0, 6.283); ctx.fill();
    if (mood !== 'sleep' && blink > 0.5) { ctx.fillStyle = '#1A0B14'; ctx.beginPath(); ctx.arc(cx + lx * 6, cy + ly * 6 + 3, mood === 'shock' ? 7 : 11, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + lx * 6 + 4, cy + ly * 6 - 2, 3.5, 0, 6.283); ctx.fill(); }
  });
  ctx.strokeStyle = '#1A0B14'; ctx.fillStyle = '#7A1026'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  if (mood === 'happy') { ctx.moveTo(-8, 58); ctx.quadraticCurveTo(10, 78, 30, 58); ctx.stroke(); }
  if (mood === 'tired') { ctx.moveTo(-6, 66); ctx.quadraticCurveTo(10, 58, 28, 66); ctx.stroke(); }
  if (mood === 'shock') { ctx.ellipse(11, 66, 10, 14, 0, 0, 6.283); ctx.fill(); ctx.stroke(); }
  if (mood === 'sleep') { ctx.moveTo(0, 64); ctx.lineTo(22, 64); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,120,140,0.55)'; [-1, 1].forEach((sd) => { ctx.beginPath(); ctx.ellipse(sd * 52 + 6, 48, 13, 8, 0, 0, 6.283); ctx.fill(); });
}

// sinoatrial node position in heart-local units (for sparks drawn by the film)
export const SA_NODE = [-66, -40];
export const heartLocal = (x, y, size, [lx, ly]) => [x + lx * size / 220, y + ly * size / 220];

// ---- liver (flat infographic): big right lobe on the viewer's left, gallbladder underneath
export function liver(ctx, x, y, size, { glow = 0 } = {}) {
  const s = size / 320; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const shape = () => { ctx.beginPath(); ctx.moveTo(-150, -20); ctx.bezierCurveTo(-130, -96, 40, -104, 150, -62); ctx.bezierCurveTo(176, -52, 168, -26, 134, -18);
    ctx.bezierCurveTo(64, 2, 4, 42, -40, 84); ctx.bezierCurveTo(-96, 118, -160, 66, -150, -20); ctx.closePath(); };
  if (glow > 0) { ctx.save(); ctx.shadowColor = `rgba(255,190,90,${glow})`; ctx.shadowBlur = 70; shape(); ctx.fillStyle = '#A8443A'; ctx.fill(); ctx.restore(); }
  const g = ctx.createLinearGradient(-150, -100, 150, 100); g.addColorStop(0, '#D9705F'); g.addColorStop(0.45, '#B04A3E'); g.addColorStop(1, '#7E2C27');
  shape(); ctx.fillStyle = g; ctx.fill();
  ctx.save(); shape(); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.beginPath(); ctx.ellipse(40, 60, 170, 70, -0.25, 0, 6.283); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(-80, -50, 50, 16, -0.25, 0, 6.283); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(80,20,20,0.6)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(18, -82); ctx.quadraticCurveTo(4, -30, 10, 10); ctx.stroke();
  ctx.fillStyle = '#6FBF73'; ctx.beginPath(); ctx.ellipse(-34, 66, 16, 28, 0.5, 0, 6.283); ctx.fill();
  ctx.restore();
}
// ---- flat human torso silhouette (generic, nobody in particular) and a hand to place on the chest
export function torso(ctx, x, y, size, { a = 1 } = {}) {
  const s = size / 900; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#2C4A7E'; ctx.beginPath(); ctx.arc(0, -560, 120, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-60, -460); ctx.lineTo(60, -460); ctx.lineTo(70, -380);
  ctx.bezierCurveTo(260, -380, 380, -330, 400, -200); ctx.lineTo(430, 600); ctx.lineTo(-430, 600); ctx.lineTo(-400, -200);
  ctx.bezierCurveTo(-380, -330, -260, -380, -70, -380); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 14; ctx.lineCap = 'round';           // a hint of ribs
  for (let i = 0; i < 5; i++) { const yy = -250 + i * 70; ctx.beginPath(); ctx.moveTo(-40, yy); ctx.quadraticCurveTo(-220, yy + 10, -280, yy + 70); ctx.stroke(); ctx.beginPath(); ctx.moveTo(40, yy); ctx.quadraticCurveTo(220, yy + 10, 280, yy + 70); ctx.stroke(); }
  ctx.restore();
}
export function hand(ctx, x, y, size, { rot = -0.5 } = {}) {
  const s = size / 300; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#E9A77E'; ctx.strokeStyle = '#B87552'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.roundRect(-70, -20, 150, 170, 60); ctx.fill(); ctx.stroke();
  [[-62, -110, 34, 130], [-24, -140, 36, 160], [16, -132, 36, 150], [54, -100, 32, 118]].forEach(([fx, fy, w, h]) => { ctx.beginPath(); ctx.roundRect(fx, fy, w, h, 18); ctx.fill(); ctx.stroke(); });
  ctx.beginPath(); ctx.ellipse(-92, 40, 26, 70, -0.6, 0, 6.283); ctx.fill(); ctx.stroke();
  ctx.restore();
}
// ---- flat red blood cell (biconcave disc seen at an angle)
export function bloodCell(ctx, x, y, r, rot = 0, tilt = 0.7) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1, tilt);
  ctx.fillStyle = '#E8434F'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#B8263A'; ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, 6.283); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.35, r * 0.25, 0, 6.283); ctx.fill();
  ctx.restore();
}
