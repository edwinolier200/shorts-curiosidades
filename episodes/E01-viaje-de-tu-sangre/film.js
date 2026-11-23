// E01 · El viaje de tu sangre — every visual is drawn in code (no AI images).
// Pure function of time. Timing from timing.json (aligned Chatterbox voice-over).
import * as M from './lib/motion.js';
import * as UI from './lib/ui.js';

const { W, H, E, prog, lerp, clamp, spring, SPRING, font, text, rrect, hash01, noise1, springKeys, bump } = M;
const S = [], T = {};
const T0 = { minuto: 3 };
let CAP = { captions: [] };
const B = (s) => s / 0.5;
const HITS = [];
const hitList = () => [
  [B(0.05), 'drop appears', 'impact'],
  [B(S[1]), 'zoom to lungs', 'whoosh', { len: 0.4 }],
  [B(T.segundo), 'oxygen card', 'pop', { pitch: 'E5' }],
  [B(S[2]), 'zoom to heart', 'whoosh', { len: 0.35 }],
  [B(T.cienmil), 'beats card', 'thud'],
  [B(T.vacaciones), 'stamp', 'impact'],
  [B(S[3]), 'to the brain', 'whoosh', { len: 0.4, from: 600, to: 2400 }],
  [B(T.quince), 'brain card', 'pop', { pitch: 'G5' }],
  [B(S[4]), 'to the kidneys', 'whoosh', { len: 0.35 }],
  [B(T.ciento), 'kidney card', 'pop', { pitch: 'C6' }],
  [B(S[5]), 'the long trip', 'whoosh', { len: 0.5, from: 2400, to: 400 }],
  [B(T.gravedad), 'gravity pill', 'thud'],
  [B(T.vuelve), 'back home', 'impact'],
  [B(T.setenta), 'final card', 'pop', { pitch: 'E6' }],
];

// ------------------------------------------------------------------ palette
const P = { bg0: '#0B1630', bg1: '#060B1A', body: '#16284F', body2: '#0F1C3A', rim: '#5AB0FF', art: '#FF4357', vein: '#3D7BFF',
  heart: '#FF4D5E', heartD: '#A3122A', lung: '#F59AAE', lungD: '#C24E68', brain: '#F7B6C6', brainD: '#D07890', kid: '#C2414B', kidD: '#7E1F2A',
  cellOld: '#8E1B2D', cellNew: '#FF3B4E', yellow: '#FFD60A', ink: '#F4EFE6' };

// ------------------------------------------------------------------ body space (1000 x 1800) and camera
const HEART = [515, 500], LUNG_L = [432, 455], LUNG_R = [568, 455], BRAIN = [500, 150], KID_L = [452, 735], KID_R = [548, 735];
let CAM = { x: 500, y: 900, z: 0.62 };
const toS = (x, y) => [W / 2 + (x - CAM.x) * CAM.z, 1010 + (y - CAM.y) * CAM.z];
function withBody(ctx, fn) { ctx.save(); ctx.translate(W / 2 - CAM.x * CAM.z, 1010 - CAM.y * CAM.z); ctx.scale(CAM.z, CAM.z); fn(); ctx.restore(); }

// ------------------------------------------------------------------ paths (cubic beziers sampled to polylines)
function bez(pts, n = 40) {
  const out = [];
  for (let i = 0; i + 3 < pts.length; i += 3) {
    const [a, b, c, d] = [pts[i], pts[i + 1], pts[i + 2], pts[i + 3]];
    for (let k = i ? 1 : 0; k <= n; k++) {
      const u = k / n, v = 1 - u;
      out.push([v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]]);
    }
  }
  const L = [0]; for (let i = 1; i < out.length; i++) L.push(L[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  return { pts: out, L, len: L[L.length - 1] };
}
function at(path, p) {
  const d = clamp(p) * path.len; let i = 1; while (i < path.L.length - 1 && path.L[i] < d) i++;
  const f = (d - path.L[i - 1]) / Math.max(1e-6, path.L[i] - path.L[i - 1]);
  return [lerp(path.pts[i - 1][0], path.pts[i][0], f), lerp(path.pts[i - 1][1], path.pts[i][1], f)];
}
// heart -> right lung -> heart (pulmonary loop)
const LUNGLOOP = bez([[512, 490], [540, 420], [600, 390], [590, 450], [585, 510], [540, 540], [508, 505]]);
// heart -> aortic arch -> carotid -> brain (a neighbour drop)
const TOBRAIN = bez([[520, 470], [520, 380], [480, 360], [490, 300], [495, 250], [500, 210], [500, 170]]);
// heart -> descending aorta -> renal artery -> kidney (a neighbour drop)
const TOKIDNEY = bez([[520, 470], [560, 380], [510, 380], [505, 520], [503, 640], [500, 720], [452, 735]]);
// our drop: aortic arch -> descending aorta -> left leg -> foot -> vein back up -> heart
const BIGTRIP = bez([[520, 470], [560, 380], [512, 380], [505, 560], [500, 760], [490, 860], [450, 920],
  [436, 1150], [432, 1450], [428, 1690], [420, 1720], [460, 1720], [458, 1690],
  [470, 1400], [478, 1100], [478, 900], [490, 760], [496, 620], [505, 520]]);

// ------------------------------------------------------------------ drawing: background, body, vessels, organs
function background(ctx, t) {
  const g = ctx.createRadialGradient(W / 2, 900, 80, W / 2, 900, 1300); g.addColorStop(0, P.bg0); g.addColorStop(1, P.bg1);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // drifting out-of-focus red cells for depth
  for (let i = 0; i < 26; i++) {
    const x = (hash01(i, 3) * W + t * (8 + hash01(i, 4) * 18)) % (W + 200) - 100;
    const y = hash01(i, 5) * H + Math.sin(t * 0.4 + i) * 30, r = 14 + hash01(i, 6) * 40;
    ctx.save(); ctx.globalAlpha = 0.07 + hash01(i, 7) * 0.08; ctx.filter = `blur(${(r / 7).toFixed(1)}px)`;
    cell(ctx, x, y, r, P.cellOld, t + i); ctx.restore();
  }
}
function bodyPath(ctx) {
  ctx.beginPath();
  ctx.ellipse(500, 160, 88, 105, 0, 0, Math.PI * 2);                         // head
  ctx.moveTo(462, 255); ctx.lineTo(538, 255); ctx.lineTo(542, 300);          // neck
  ctx.bezierCurveTo(640, 305, 700, 320, 715, 380);                          // right shoulder
  ctx.bezierCurveTo(735, 520, 760, 700, 790, 900);                          // right arm outer
  ctx.bezierCurveTo(800, 960, 760, 975, 750, 920);                          // right hand
  ctx.bezierCurveTo(725, 760, 690, 600, 668, 520);                          // right arm inner
  ctx.bezierCurveTo(660, 640, 640, 740, 640, 860);                          // right flank
  ctx.bezierCurveTo(650, 1000, 625, 1300, 605, 1660);                       // right leg outer
  ctx.bezierCurveTo(640, 1700, 640, 1735, 590, 1735); ctx.lineTo(540, 1735); // right foot
  ctx.bezierCurveTo(540, 1500, 525, 1150, 510, 960);                        // right leg inner
  ctx.lineTo(490, 960);
  ctx.bezierCurveTo(475, 1150, 460, 1500, 460, 1735); ctx.lineTo(410, 1735); // left leg inner + foot
  ctx.bezierCurveTo(360, 1735, 360, 1700, 395, 1660);
  ctx.bezierCurveTo(375, 1300, 350, 1000, 360, 860);                        // left leg outer
  ctx.bezierCurveTo(360, 740, 340, 640, 332, 520);                          // left flank
  ctx.bezierCurveTo(310, 600, 275, 760, 250, 920);                          // left arm inner
  ctx.bezierCurveTo(240, 975, 200, 960, 210, 900);                          // left hand
  ctx.bezierCurveTo(240, 700, 265, 520, 285, 380);                          // left arm outer
  ctx.bezierCurveTo(300, 320, 360, 305, 458, 300); ctx.closePath();          // left shoulder
}
function body(ctx, t, glow = 0) {
  ctx.save();
  bodyPath(ctx);
  const g = ctx.createLinearGradient(0, 0, 0, 1800); g.addColorStop(0, P.body); g.addColorStop(1, P.body2);
  ctx.fillStyle = g; ctx.globalAlpha = 0.92; ctx.fill('evenodd'); ctx.globalAlpha = 1;
  ctx.shadowColor = P.rim; ctx.shadowBlur = 30 + 40 * glow; ctx.strokeStyle = P.rim; ctx.lineWidth = 5; ctx.globalAlpha = 0.55 + 0.4 * glow; ctx.stroke();
  ctx.restore();
}
function vessels(ctx, t) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const flow = (path, color, w, dir = 1) => {
    ctx.beginPath(); path.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = color; ctx.globalAlpha = 0.35; ctx.lineWidth = w; ctx.setLineDash([]); ctx.stroke();
    ctx.globalAlpha = 0.9; ctx.lineWidth = w * 0.35; ctx.setLineDash([18, 26]); ctx.lineDashOffset = -dir * t * 120; ctx.stroke();
  };
  const legR = bez([[500, 760], [520, 860], [550, 920], [565, 1150], [570, 1450], [575, 1700], [580, 1705]]);
  const armL = bez([[505, 390], [420, 380], [330, 400], [300, 560], [270, 720], [240, 860], [230, 900]]);
  const armR = bez([[515, 390], [600, 380], [680, 400], [705, 560], [735, 720], [760, 860], [770, 900]]);
  [TOBRAIN, TOKIDNEY, bez([[505, 720], [520, 730], [535, 735], [548, 735]]), legR, armL, armR].forEach((p) => flow(p, P.art, 16));
  flow(BIGTRIP, P.art, 18); flow(LUNGLOOP, '#B07CFF', 14);
  ctx.restore();
}
const beat = (t) => { const ph = (t * 70 / 60) % 1; return Math.exp(-ph * 9) + 0.5 * Math.exp(-Math.max(0, ph - 0.18) * 12) * (ph > 0.18 ? 1 : 0); };
function heart(ctx, t, k = 1) {
  const s = (1 + 0.07 * beat(t)) * k, [x, y] = HEART;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(0, 38);
  ctx.bezierCurveTo(-70, -5, -48, -60, -10, -44); ctx.bezierCurveTo(-2, -40, 0, -34, 0, -30);
  ctx.bezierCurveTo(4, -48, 22, -60, 40, -52); ctx.bezierCurveTo(70, -30, 40, 20, 0, 38); ctx.closePath();
  const g = ctx.createRadialGradient(-12, -24, 4, 0, 0, 70); g.addColorStop(0, '#FF8A94'); g.addColorStop(0.45, P.heart); g.addColorStop(1, P.heartD);
  ctx.shadowColor = P.heart; ctx.shadowBlur = 25 + 35 * beat(t); ctx.fillStyle = g; ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = '#7A0E20'; ctx.lineWidth = 6; ctx.lineCap = 'round';                 // great vessels on top
  ctx.beginPath(); ctx.moveTo(-6, -40); ctx.bezierCurveTo(-8, -62, 14, -70, 20, -56); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-22, -22, 9, 5, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function lung(ctx, [x, y], side, t) {
  const br = 1 + 0.035 * Math.sin(t * 2 * Math.PI / 4);
  ctx.save(); ctx.translate(x, y); ctx.scale(side * br, br);
  ctx.beginPath(); ctx.moveTo(10, -120);
  ctx.bezierCurveTo(-50, -110, -78, 0, -70, 90); ctx.bezierCurveTo(-66, 135, -10, 140, 20, 110);
  ctx.bezierCurveTo(30, 40, 30, -60, 10, -120); ctx.closePath();
  const g = ctx.createLinearGradient(-60, -100, 30, 130); g.addColorStop(0, P.lung); g.addColorStop(1, P.lungD);
  ctx.fillStyle = g; ctx.globalAlpha = 0.92; ctx.fill(); ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,230,236,0.65)'; ctx.lineWidth = 3; ctx.lineCap = 'round';   // bronchial tree
  const branch = (x0, y0, a, l, d) => { if (d > 4) return; const x1 = x0 + Math.cos(a) * l, y1 = y0 + Math.sin(a) * l; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineWidth = 5 - d; ctx.stroke(); branch(x1, y1, a - 0.45, l * 0.68, d + 1); branch(x1, y1, a + 0.4, l * 0.7, d + 1); };
  branch(18, -110, Math.PI * 0.62, 70, 0);
  ctx.restore();
}
function brain(ctx, t, glow = 0) {
  const [x, y] = BRAIN;
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.ellipse(0, 0, 72, 58, 0, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(-20, -20, 5, 0, 0, 80); g.addColorStop(0, '#FFD3DE'); g.addColorStop(0.6, P.brain); g.addColorStop(1, P.brainD);
  ctx.shadowColor = '#FF9AB5'; ctx.shadowBlur = 12 + 40 * glow; ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
  ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(150,60,85,0.55)'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) {                                                           // gyri
    let px = -70 + hash01(i, 11) * 140, py = -55 + hash01(i, 12) * 110, a = hash01(i, 13) * 6.28;
    ctx.beginPath(); ctx.moveTo(px, py);
    for (let k = 0; k < 9; k++) { a += noise1(i * 7 + k, 2) * 1.6; px += Math.cos(a) * 11; py += Math.sin(a) * 11; ctx.lineTo(px, py); }
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(150,60,85,0.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -58); ctx.bezierCurveTo(5, -20, -5, 20, 0, 58); ctx.stroke();
  ctx.restore(); ctx.restore();
}
function kidney(ctx, [x, y], side, glow = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(side, 1);
  ctx.beginPath(); ctx.moveTo(10, -46); ctx.bezierCurveTo(-40, -60, -48, 50, 0, 46); ctx.bezierCurveTo(22, 44, 26, 18, 12, 4); ctx.bezierCurveTo(26, -12, 30, -40, 10, -46); ctx.closePath();
  const g = ctx.createLinearGradient(-30, -40, 20, 40); g.addColorStop(0, '#E3606A'); g.addColorStop(1, P.kidD);
  ctx.shadowColor = P.kid; ctx.shadowBlur = 10 + 40 * glow; ctx.fillStyle = g; ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();
}
// red blood cell: biconcave disc with a darker dimple and a soft glow
function cell(ctx, x, y, r, color, t, glow = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 1.3) * 0.5); ctx.scale(1, 0.82);
  if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
  const g = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r); g.addColorStop(0, '#5A0A16'); g.addColorStop(0.45, color); g.addColorStop(0.8, color); g.addColorStop(1, '#5A0A16');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.45, r * 0.3, r * 0.12, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------------ where is "our" drop at time t
function dropAt(t) {
  if (t < S[1]) return { p: HEART, c: P.cellOld, trail: null };
  if (t < S[2]) { const p = E.inOutSine(prog(t, S[1] + 0.3, S[2] - 0.3)); return { path: LUNGLOOP, p: at(LUNGLOOP, p), pr: p, c: p > 0.45 ? P.cellNew : P.cellOld }; }
  if (t < S[5]) return { p: [520, 470], c: P.cellNew, wait: true };
  const p = E.inOutSine(prog(t, S[5] + 0.2, T.vuelve + 0.2));
  return { path: BIGTRIP, p: at(BIGTRIP, p), pr: p, c: P.cellNew };
}

// ------------------------------------------------------------------ the film
M.film({
  fonts: [font(100, 400, 'Display'), font(100, 800, 'UI'), font(100, 600, 'UI')],
  hits: HITS, samples: 3,
  async init() {
    CAP = await fetch('captions.json').then((r) => r.json());
    const tm = await fetch('timing.json').then((r) => r.json());
    S.push(...tm.S); Object.assign(T, tm.T); HITS.push(...hitList());
  },
  draw(ctx, u, t) {
    const d = dropAt(t);
    // camera keys: [time, [x, y, zoom]]
    const keys = [[0, [515, 505, 2.6]], [T.minuto, [515, 560, 1.5]], [S[1] - 0.3, [520, 600, 1.2]], [S[1], [530, 470, 2.1]],
      [S[2], [515, 500, 3.0]], [S[3], [500, 190, 2.6]], [S[4], [500, 735, 2.5]], [S[5], [500, 700, 1.3]],
      [S[6], [500, 930, 0.82]], [T.vuelve - 0.6, [515, 520, 2.4]], [S[8], [500, 930, 0.82]]];
    let [cx, cy, z] = springKeys(t, keys, { stiffness: 40, damping: 13 });
    // during the long trip the camera follows the drop down the leg and back up
    if (t > S[5] + 0.6 && t < S[6]) { const f = E.inOutSine(prog(t, S[5] + 0.6, S[5] + 2)); cx = lerp(cx, d.p[0], f); cy = lerp(cy, d.p[1], f); }
    CAM = { x: cx, y: cy, z: Math.exp(Math.log(Math.max(0.3, z))) };

    background(ctx, t);
    const emo = bump(t, (S[6] + S[7]) / 2, (S[7] - S[6]) / 2 + 0.5);
    withBody(ctx, () => {
      body(ctx, t, emo);
      vessels(ctx, t);
      lung(ctx, LUNG_L, -1, t); lung(ctx, LUNG_R, 1, t);
      kidney(ctx, KID_L, 1, t > S[4] ? bump(t, T.rinones, 1.5) : 0); kidney(ctx, KID_R, -1, t > S[4] ? bump(t, T.rinones, 1.5) : 0);
      brain(ctx, t, t > S[3] ? bump(t, T.cerebro, 1.5) : 0);
      heart(ctx, t, 1 + (t >= T.vuelve ? 0.25 * bump(t, T.vuelve + 0.15, 0.4) : 0));
      // neighbour drops: one to the brain, one to the kidney
      if (t > S[3] && t < S[5]) {
        cell(ctx, ...at(TOBRAIN, E.inOutSine(prog(t, S[3] + 0.3, T.cerebro + 0.6))), 17, P.cellNew, t, 20);
        if (t > S[4] - 0.4) cell(ctx, ...at(TOKIDNEY, E.inOutSine(prog(t, S[4], T.rinones + 0.8))), 17, P.cellNew, t, 20);
      }
      // our drop with a fading trail and a yellow ring so it is always findable
      if (d.path) for (let i = 1; i <= 10; i++) { const q = at(d.path, Math.max(0, d.pr - i * 0.006)); ctx.globalAlpha = 0.35 * (1 - i / 10); cell(ctx, q[0], q[1], 16, d.c, t); ctx.globalAlpha = 1; }
      const r = 20 + 2 * Math.sin(t * 6);
      cell(ctx, d.p[0], d.p[1], r, d.c, t, 30);
      ctx.save(); ctx.strokeStyle = P.yellow; ctx.lineWidth = 4 / CAM.z * 1.6; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.arc(d.p[0], d.p[1], r + 14 + 4 * Math.sin(t * 5), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    });

    // ---- interface: soft dark band so captions and the stopwatch read over any scene
    const sc = ctx.createLinearGradient(0, 0, 0, 560); sc.addColorStop(0, 'rgba(5,10,25,0.85)'); sc.addColorStop(0.75, 'rgba(5,10,25,0.35)'); sc.addColorStop(1, 'rgba(5,10,25,0)');
    ctx.fillStyle = sc; ctx.fillRect(0, 0, W, 560);
    const tag = (lbl, i0, i1) => UI.dayBadge(ctx, 'TU SANGRE', lbl, t, S[i0], { tEnd: S[i1] });
    tag('PULMONES', 1, 2); tag('CORAZÓN', 2, 3); tag('CEREBRO', 3, 4); tag('RIÑONES', 4, 5); tag('A LOS PIES', 5, 6);
    UI.statCard(ctx, '0,75 s', 'lo que tarda en cargar oxígeno 🫁', t, T.segundo, { tEnd: S[2] });
    UI.statCard(ctx, '100.000', 'latidos al día ❤️', t, T.cienmil, { tEnd: S[3] });
    UI.stamp(ctx, 'SIN VACACIONES', W / 2 + 60, 760, t, T.vacaciones, { size: 74, tEnd: S[3] });
    UI.statCard(ctx, '2 % → 15 %', 'de tu peso → de tu sangre 🧠', t, T.quince, { tEnd: S[4] });
    UI.statCard(ctx, '180 L', 'filtrados cada día 🛁', t, T.ciento, { tEnd: S[5] });
    UI.pill(ctx, 'CONTRA LA GRAVEDAD ↑', W / 2, 1250, t, T.gravedad, { tEnd: S[6], size: 50 });
    UI.statCard(ctx, '≈ 70', 'latidos mientras veías esto ❤️', t, T.setenta);
    // stopwatch: real elapsed time since the hook; it freezes when the drop is home
    const tt = Math.min(t, T.vuelve + 0.2), ss = Math.floor(tt), cs = Math.floor((tt % 1) * 10);
    const home = t >= T.vuelve + 0.2;
    ctx.save(); const tw = 270, tx = W / 2 - tw / 2, ty = 410;
    ctx.fillStyle = home ? P.yellow : 'rgba(10,18,40,0.8)'; rrect(ctx, tx, ty, tw, 76, 38); ctx.fill();
    ctx.strokeStyle = home ? '#000' : 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3; ctx.stroke();
    text(ctx, `⏱ 0:${String(ss).padStart(2, '0')}.${cs}`, W / 2, ty + 54, font(46, 800, 'UI'), home ? '#111' : '#fff', 'center');
    ctx.restore();
    UI.captionsTop(ctx, CAP, t);
    UI.watermark(ctx);
  },
  post(ctx, u, t) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.78);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
});
