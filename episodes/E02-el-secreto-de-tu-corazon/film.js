// E02 · El secreto de tu corazón — v2: a REAL human heart (BodyParts3D anatomy) inside a real chest.
// One world, the inside of the chest: rib cage, lungs that breathe, the heart that beats on the score's heartbeat,
// the aorta that throws out blood, the electrical wave from the sinoatrial node, the liver for the next chapter.
// Every overlay is drawn in code and explains the sentence being spoken.
import * as M from './lib/motion.js';
import * as G from './lib/gl.js';
import * as A from './lib/anatomy.js';
import * as UI from './lib/ui.js';
const { THREE } = G;
const { W, H, E, prog, lerp, clamp, spring, SPRING, hash01, font, rrect } = M;

const S = [], T = {};
let CAP = { captions: [] }, HB = [];
const B = (s) => s / 0.5;
const HITS = [];
const hitList = () => [
  [B(0.1), 'into the chest', 'whoosh', { len: 1.2, from: 300, to: 1800, gain: 0.7 }],
  [B(T.nacieras), 'heart reveal', 'impact', { gain: 0.7 }],
  [B(T.secreto), 'secret', 'sub'],
  [B(T.cien), 'counter', 'tick'], [B(T.tres), 'counter 2', 'impact'],
  [B(S[3]), 'to the aorta', 'whoosh', { len: 0.5 }],
  [B(T.siete), '7.000 L', 'thud'],
  ...[0, 1, 2, 3, 4, 5, 6].map((i) => [B(T.treinta + i * 0.18), 'barrels fill', 'blip', { gain: 0.35, pitch: 600 + i * 90 }]),
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
  [B(S[10]), 'pull back', 'whoosh', { len: 0.8, from: 1800, to: 300 }],
  [B(S[11]), 'down to the liver', 'whoosh', { len: 0.6 }],
  [B(T.organo), 'liver glows', 'swell', { gain: 0.6 }],
  [B(S[12]), 'back to the heart', 'whoosh', { len: 0.5 }],
  [B(T.compartele), 'share', 'pop', { pitch: 'E6' }],
];

// ------------------------------------------------------------------ the heartbeat = the score's thumps
function lastBeat(t) { let b; for (let i = HB.length - 1; i >= 0; i--) if (HB[i] <= t) { b = HB[i]; break; } return b; }
function pulse(t) { const b = lastBeat(t); if (b === undefined) return 0; const d = t - b, d2 = d - 0.18; return Math.exp(-((d - 0.05) ** 2) / 0.004) * 0.9 + (d2 > 0 ? 0.55 * Math.exp(-((d2 - 0.04) ** 2) / 0.004) : 0); }
function keys(t, K, dur = 0.9, ease = E.inOutCubic) {
  let i = 0; while (i + 1 < K.length && t >= K[i + 1][0]) i++;
  if (i === 0 || t >= K[i][0] + dur) return K[i][1];
  const p = ease(prog(t, K[i][0], K[i][0] + dur)), a = K[i - 1][1], b = K[i][1];
  return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], p)) : lerp(a, b, p);
}
const GOLD = '#FFC94A';

// ------------------------------------------------------------------ the chest
const PARTS = ['heart_wall', 'coronary_arteries', 'cardiac_veins', 'aorta', 'vena_cava', 'pulmonary_artery', 'lungs', 'ribs', 'sternum', 'liver'];
let C, SA, LIVER;
function chestSet(body) {
  const scene = new THREE.Scene(), cam = G.camera(30, 0.1, 300);
  scene.background = new THREE.Color(0x0c0405); scene.fog = new THREE.FogExp2(0x0d0304, 0.012);
  scene.add(body);
  const hemi = new THREE.HemisphereLight(0xffd9cf, 0x1a0505, 0.35); scene.add(hemi);
  const key = new THREE.SpotLight(0xfff0e6, 520, 120, 0.42, 0.7, 1.5); key.position.set(C.x - 9, C.y + 14, C.z + 18); key.target.position.copy(C); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x9fd0ff, 1.6); rim.position.set(C.x + 10, C.y + 4, C.z - 12); scene.add(rim);
  const warm = new THREE.PointLight(0xff5a3c, 0, 18, 2); warm.position.set(C.x, C.y - 1, C.z + 4); scene.add(warm);
  const liverLight = new THREE.PointLight(0xffc070, 0, 14, 2); liverLight.position.copy(LIVER).add(new THREE.Vector3(0, 1, 4)); scene.add(liverLight);
  const P = body.parts;
  const ribMats = [P.ribs.material, P.sternum.material];

  // floating red blood cells around the heart (depth + scale) and the stream the aorta throws out
  const cellGeo = new THREE.LatheGeometry([[0, 0.05], [0.25, 0.07], [0.42, 0.11], [0.5, 0.0], [0.42, -0.11], [0.25, -0.07], [0, -0.05]].map(([x, y]) => new THREE.Vector2(x, y)), 20);
  const cellMat = new THREE.MeshPhysicalMaterial({ color: 0xb3121c, roughness: 0.35, clearcoat: 0.8, sheen: 0.6, sheenColor: new THREE.Color(0xff7766) });
  const NF = 90, floaters = new THREE.InstancedMesh(cellGeo, cellMat, NF); scene.add(floaters);
  const NS = 260, stream = new THREE.InstancedMesh(cellGeo, cellMat, NS); scene.add(stream);
  const ARCH = A.toScene([25, -95, 1372]);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3();
  const flow = (t) => 0.18 * t + HB.filter((b) => b <= t).reduce((a, b) => a + 0.5 * clamp((t - b) / 0.25), 0);

  return { scene, camera: cam, bloom: 0.3, bloomThreshold: 0.9, bloomRadius: 0.6,
    update(t) {
      const pl = pulse(t);
      // ---- heartbeat: squeeze the real ventricles (wall + the vessels lying on it)
      ['heart_wall', 'coronary_arteries', 'cardiac_veins'].forEach((p) => A.beat(P[p], Math.min(1, pl)));
      // ---- breathing lungs
      const br = Math.sin(t * 2 * Math.PI / 4.2) * 0.5 + 0.5; P.lungs.parent.scale.setScalar(1 + 0.018 * br);
      // ---- light level: dark for the secret, warm otherwise
      const lvl = keys(t, [[0, 1], [S[7], 0.08], [T.relaja, 0.75], [S[10], 1]], 0.4);
      key.intensity = 520 * lvl; hemi.intensity = 0.35 * lvl; rim.intensity = 1.6 * Math.max(lvl, 0.35);
      warm.intensity = (40 + 160 * pl) * Math.max(lvl, 0.5);
      // ---- rib cage: seen from outside at the start and at "pon la mano en tu pecho", dissolved when we are inside
      const ribA = keys(t, [[0, 1], [1.2, 0], [S[10], 1], [S[11], 0]], 1.0);
      ribMats.forEach((m) => { m.transparent = ribA < 0.99; m.opacity = ribA; m.depthWrite = ribA > 0.5; });
      P.ribs.visible = P.sternum.visible = ribA > 0.02;
      const luA = keys(t, [[0, 1], [1.6, 0], [S[10], 1], [S[11] + 0.6, 0]], 1.2);
      P.lungs.material.transparent = luA < 0.99; P.lungs.material.opacity = luA; P.lungs.material.depthWrite = luA > 0.6; P.lungs.visible = luA > 0.02;
      // ---- the liver only for the teaser
      const lv = keys(t, [[0, 0], [S[11], 1], [S[12] + 0.3, 0]], 0.8);
      P.liver.visible = lv > 0.35;
      P.liver.material.userData.u.uGlow.value = lv * (0.03 + 0.03 * Math.sin(t * 5)) * (t > T.organo ? 1 : 0.3);
      P.liver.material.userData.u.uGlowCol.value.set(0xffa040);
      liverLight.intensity = lv * 14;
      // ---- electric wave from the sinoatrial node on every beat (scene "electricidad")
      const hw = P.heart_wall.material.userData.u;
      const eOn = t > T.electricidad - 0.3 && t < S[5];
      const b = lastBeat(t + 0.12);
      const wr = b !== undefined ? (t + 0.12 - b) * 7 : -1; hw.uWave.value.set(SA.x, SA.y, SA.z, eOn && wr < 5.5 ? wr : -1);
      hw.uGlow.value = 0.12 * pl;
      // the secret: the heart glows softly while resting
      // ---- camera: one continuous move
      const c = C;
      const cam6 = keys(t, [
        [0, [c.x + 5, c.y + 3, c.z + 36, c.x, c.y, c.z]],
        [0.05, [c.x + 1.2, c.y + 0.8, c.z + 13, c.x, c.y + 0.3, c.z]],
        [S[1], [c.x - 7.5, c.y + 1.5, c.z + 9.5, c.x, c.y + 0.2, c.z]],
        [S[2], [c.x + 2.5, c.y - 1.2, c.z + 13.5, c.x, c.y - 0.6, c.z]],
        [S[3], [c.x - 1.5, c.y + 2.5, c.z + 17, c.x, c.y + 3.2, c.z]],
        [S[4], [c.x - 4, c.y + 2, c.z + 10.5, c.x - 0.6, c.y + 0.6, c.z]],
        [S[5], [c.x + 3, c.y + 0.5, c.z + 16, c.x, c.y + 1.4, c.z]],
        [S[7], [c.x, c.y + 0.4, c.z + 11.5, c.x, c.y + 0.4, c.z]],
        [S[8], [c.x + 1.5, c.y + 0.6, c.z + 14, c.x, c.y + 0.5, c.z]],
        [S[9], [c.x - 3, c.y + 1, c.z + 15, c.x, c.y + 1.2, c.z]],
        [S[10], [c.x + 4, c.y + 2.5, c.z + 34, c.x, c.y - 1.5, c.z]],
        [S[11], [c.x - 2, c.y - 1.5, c.z + 19, LIVER.x + 0.8, LIVER.y + 1.2, LIVER.z]],
        [S[12], [c.x, c.y + 0.6, c.z + 12, c.x, c.y + 0.4, c.z]],
      ], 1.1);
      if (t < S[1]) { const p = E.inOutCubic(prog(t, 0.05, T.nacieras + 0.3)); for (let i = 0; i < 6; i++) cam6[i] = lerp([c.x + 5, c.y + 3, c.z + 36, c.x, c.y, c.z][i], [c.x + 1.2, c.y + 0.8, c.z + 13, c.x, c.y + 0.3, c.z][i], p); }
      const drift = [Math.sin(t * 0.31) * 0.4, Math.sin(t * 0.23 + 1) * 0.25, Math.sin(t * 0.19) * 0.3];
      G.lookFrom(cam, [cam6[0] + drift[0], cam6[1] + drift[1], cam6[2] + drift[2]], [cam6[3], cam6[4], cam6[5]], Math.sin(t * 0.27) * 0.015);
      cam.updateMatrixWorld(); SCREEN.heart = C.clone().project(cam);

      // ---- floating cells
      for (let i = 0; i < NF; i++) {
        const a = hash01(i, 1) * 6.283, r = 5 + hash01(i, 2) * 8, h = (hash01(i, 3) - 0.5) * 12;
        v3.set(c.x + Math.cos(a + t * 0.05) * r, c.y + h + Math.sin(t * 0.3 + i) * 0.3, c.z - 3 - Math.abs(Math.sin(a + t * 0.05)) * r * 0.7);
        e3.set(t * 0.3 + i, t * 0.2 + i * 2, 0); q.setFromEuler(e3); s3.setScalar(0.35 + hash01(i, 4) * 0.25);
        floaters.setMatrixAt(i, m4.compose(v3, q, s3));
      }
      floaters.instanceMatrix.needsUpdate = true;
      // ---- the blood stream out of the aortic arch (only around "bombea 7.000 litros")
      const sOn = t > S[3] - 0.2 && t < S[4] + 0.4;
      stream.visible = sOn;
      if (sOn) {
        const F = flow(t), fade = clamp((t - S[3] + 0.2) * 2) * (1 - clamp((t - S[4]) / 0.4));
        for (let i = 0; i < NS; i++) {
          const u = (hash01(i, 5) + F * 0.6) % 1, sp = 0.6 + hash01(i, 6) * 0.8;
          const dir = new THREE.Vector3((hash01(i, 7) - 0.5) * 0.9, 1, (hash01(i, 8) - 0.2) * 0.9).normalize();
          v3.copy(ARCH).addScaledVector(dir, u * 14 * sp); v3.y -= u * u * 5;
          e3.set(u * 9 + i, u * 7, i); q.setFromEuler(e3); s3.setScalar(0.32 * fade * (u < 0.05 ? u / 0.05 : 1));
          stream.setMatrixAt(i, m4.compose(v3, q, s3));
        }
        stream.instanceMatrix.needsUpdate = true;
      }
    } };
}
const SCREEN = { heart: new THREE.Vector3() };
const toPx = (v) => [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H];

// ------------------------------------------------------------------ 2-D overlays (each one explains its sentence)
function glassCard(ctx, x, y, w, h, k, { border = 'rgba(255,201,74,0.65)' } = {}) {
  ctx.save(); ctx.globalAlpha *= k;
  ctx.fillStyle = 'rgba(12,6,8,0.72)'; rrect(ctx, x, y, w, h, 26); ctx.fill();
  ctx.strokeStyle = border; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
}
function counter(ctx, t, t0, t1, to, label, y = 520) {
  if (t < t0 || t >= t1) return;
  const k = Math.min(1, spring(t - t0, SPRING.snappy)), p = E.outCubic(prog(t, t0, t0 + 1.1));
  const n = Math.round(to * p).toLocaleString('es-CO').replace(/,/g, '.');
  ctx.save(); ctx.globalAlpha = k * (1 - prog(t, t1 - 0.2, t1)); ctx.translate(W / 2, y);
  let sz = 170; ctx.font = font(sz, 900, 'Heavy'); while (ctx.measureText(n).width > W - 140) ctx.font = font(sz -= 6, 900, 'Heavy');
  const g = ctx.createLinearGradient(0, -sz, 0, 0); g.addColorStop(0, '#FFE7A3'); g.addColorStop(0.55, GOLD); g.addColorStop(1, '#C98A1E');
  ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 30; ctx.fillStyle = g; ctx.fillText(n, 0, 0);
  ctx.shadowBlur = 12; ctx.font = font(44, 900, 'Heavy'); ctx.fillStyle = '#fff'; ctx.fillText(label, 0, 70); ctx.restore();
}
function barrels(ctx, t) {
  if (t < T.siete - 0.1 || t > S[4] + 0.1) return;
  const k = Math.min(1, spring(t - T.siete + 0.1, SPRING.snappy)) * (1 - prog(t, S[4] - 0.25, S[4] + 0.05));
  const x0 = 140, y0 = 330, bw = 104, bh = 120, gx = 10, gy = 16;
  glassCard(ctx, x0 - 34, y0 - 110, 7 * (bw + gx) + 58, 5 * (bh + gy) + 150, k);
  ctx.save(); ctx.globalAlpha = k;
  ctx.font = font(64, 900, 'Heavy'); ctx.textAlign = 'center'; ctx.fillStyle = GOLD; ctx.fillText('7.000 LITROS AL DÍA', W / 2, y0 - 34);
  const filled = t < T.treinta ? 0 : Math.min(35, Math.floor(prog(t, T.treinta, T.barriles + 0.6) * 35.99));
  for (let i = 0; i < 35; i++) {
    const cx = x0 + (i % 7) * (bw + gx), cy = y0 + Math.floor(i / 7) * (bh + gy);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; rrect(ctx, cx + 8, cy, bw - 16, bh, 14); ctx.fill();
    if (i < filled) { const f = Math.min(1, (prog(t, T.treinta, T.barriles + 0.6) * 35.99 - i)); const g = ctx.createLinearGradient(0, cy, 0, cy + bh); g.addColorStop(0, '#ff4b4b'); g.addColorStop(1, '#8e0b16');
      ctx.fillStyle = g; rrect(ctx, cx + 8, cy + bh * (1 - f), bw - 16, bh * f, 14); ctx.fill(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; rrect(ctx, cx + 8, cy, bw - 16, bh, 14); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(cx + 8, cy + bh * 0.33, bw - 16, 3); ctx.fillRect(cx + 8, cy + bh * 0.66, bw - 16, 3);
  }
  ctx.font = font(36, 800, 'UI'); ctx.fillStyle = '#fff'; ctx.fillText(`${filled} barriles de 200 litros`, W / 2, y0 + 5 * (bh + gy) + 22);
  ctx.restore();
}
function ecg(ctx, t) {
  if (t < T.electricidad - 0.3 || t > S[5]) return;
  const a = 1 - prog(t, S[5] - 0.3, S[5]), y = 380, x0 = 70, x1 = W - 70;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#7fe9ff'; ctx.lineWidth = 6; ctx.shadowColor = '#7fe9ff'; ctx.shadowBlur = 22; ctx.lineJoin = 'round';
  ctx.beginPath(); const head = (t - T.electricidad + 0.3) * 700;
  for (let x = x0; x <= Math.min(x1, x0 + head); x += 3) {
    const ph = ((x - x0) / 330) % 1;
    const v = 30 * Math.exp(-(((ph - 0.2) / 0.035) ** 2)) + 150 * Math.exp(-(((ph - 0.38) / 0.012) ** 2)) - 55 * Math.exp(-(((ph - 0.42) / 0.012) ** 2)) + 45 * Math.exp(-(((ph - 0.62) / 0.05) ** 2));
    x === x0 ? ctx.moveTo(x, y - v) : ctx.lineTo(x, y - v);
  }
  ctx.stroke(); ctx.shadowBlur = 0; ctx.font = font(34, 800, 'UI'); ctx.fillStyle = '#bff5ff'; ctx.textAlign = 'left'; ctx.fillText('NODO SINUSAL: SU PROPIO MARCAPASOS', x0, y + 150); ctx.restore();
}
function renewCards(ctx, t) {
  if (t < T.piel - 0.1 || t > S[7]) return;
  const rows = [[T.piel, 'PIEL', '1 MES', '#e8c4a8', 'skin'], [T.globulos, 'GLÓBULOS ROJOS', '4 MESES', '#ff5a5a', 'cell'], [T.celulas, 'CORAZÓN', t >= T.edad ? 'TU EDAD' : '¿ ?', '#ff2d3d', 'heart']];
  const out = 1 - prog(t, S[7] - 0.25, S[7]);
  rows.forEach(([t0, name, val, col, icon], i) => {
    if (t < t0 - 0.1) return;
    const k = Math.min(1, spring(t - t0 + 0.1, SPRING.snappy)) * out, y = 270 + i * 190, x = 90 + (1 - k) * -120;
    const hot = icon === 'heart' && t >= T.edad;
    glassCard(ctx, x, y, W - 180, 160, k, { border: hot ? '#ff3b3b' : 'rgba(255,201,74,0.55)' });
    ctx.save(); ctx.globalAlpha = k; ctx.translate(x + 95, y + 80);
    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 6;
    if (icon === 'skin') { for (let j = 0; j < 3; j++) { ctx.beginPath(); for (let s = -45; s <= 45; s += 5) ctx.lineTo(s, -24 + j * 22 + Math.sin(s * 0.12 + j) * 6); ctx.stroke(); } }
    if (icon === 'cell') { ctx.beginPath(); ctx.ellipse(0, 0, 46, 40, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, 0, 20, 17, 0, 0, 6.283); ctx.fill(); }
    if (icon === 'heart') { const s = 1 + 0.12 * pulse(t); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, 38); ctx.bezierCurveTo(-60, -5, -30, -55, 0, -22); ctx.bezierCurveTo(30, -55, 60, -5, 0, 38); ctx.fill(); }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = k; ctx.textAlign = 'left'; ctx.font = font(40, 900, 'Heavy'); ctx.fillStyle = '#fff'; ctx.fillText(name, x + 180, y + 66);
    ctx.font = font(58, 900, 'Heavy'); ctx.fillStyle = hot ? '#ff4d4d' : GOLD; ctx.fillText(val, x + 180, y + 128);
    ctx.font = font(28, 800, 'UI'); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.textAlign = 'right'; ctx.fillText(icon === 'heart' ? 'casi no se renueva' : 'se renueva', x + W - 210, y + 66); ctx.restore();
  });
}
function beatDial(ctx, t) {
  if (t < T.relaja - 0.2 || t > S[9]) return;
  const k = Math.min(1, spring(t - T.relaja + 0.2, SPRING.snappy)) * (1 - prog(t, S[9] - 0.3, S[9]));
  const [hx, hy] = toPx(SCREEN.heart), R = 330;
  const b = lastBeat(t) ?? 0, ph = clamp((t - b) / 0.92), a0 = -Math.PI / 2;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(hx, hy); ctx.lineCap = 'round';
  ctx.lineWidth = 26; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.283); ctx.stroke();
  ctx.strokeStyle = '#ff3b3b'; ctx.shadowColor = '#ff3b3b'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(0, 0, R, a0, a0 + 2.094); ctx.stroke();
  ctx.strokeStyle = '#3d9bff'; ctx.shadowColor = '#3d9bff'; ctx.beginPath(); ctx.arc(0, 0, R, a0 + 2.094 + 0.06, a0 + 6.283 - 0.06); ctx.stroke();
  ctx.shadowBlur = 0; const an = a0 + ph * 6.283; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(Math.cos(an) * R, Math.sin(an) * R, 22, 0, 6.283); ctx.fill();
  ctx.textAlign = 'center'; ctx.font = font(54, 900, 'Heavy');
  if (t > T.dos - 0.1) { ctx.fillStyle = '#ff6b6b'; ctx.fillText('1/3 TRABAJA', 230, -R - 50); ctx.fillStyle = '#7dbbff'; ctx.fillText('2/3 DESCANSA', -170, R + 95); }
  ctx.restore();
}
function employee(ctx, t) {
  if (t < T.trabajador - 0.1 || t > S[10]) return;
  const k = Math.min(1, spring(t - T.trabajador + 0.1, SPRING.snappy)) * (1 - prog(t, S[10] - 0.25, S[10]));
  const x = 120, y = 250, w = W - 240, h = 420;
  glassCard(ctx, x, y, w, h, k);
  ctx.save(); ctx.globalAlpha = k; ctx.textAlign = 'left';
  ctx.font = font(34, 800, 'UI'); ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText('FICHA DEL EMPLEADO · CORAZÓN', x + 50, y + 70);
  [['Llegadas tarde', '0', '#fff'], ['Faltas', '0', '#fff'], ['Horas extra', 'TODAS', GOLD]].forEach(([a, v, c], i) => {
    const kk = clamp((t - T.trabajador - i * 0.45) * 4); ctx.globalAlpha = k * kk;
    ctx.font = font(48, 900, 'Heavy'); ctx.fillStyle = '#fff'; ctx.fillText(a, x + 50, y + 160 + i * 90);
    ctx.textAlign = 'right'; ctx.fillStyle = c; ctx.fillText(v, x + w - 50, y + 160 + i * 90); ctx.textAlign = 'left';
  });
  ctx.restore();
  UI.stamp(ctx, 'EMPLEADO DEL AÑO', W / 2, y + h - 20, t, T.tarde, { size: 62, tEnd: S[10] - 0.2 });
}
function captionsBig(ctx, t, y = 1300) {
  const c = CAP.captions.find((c) => t >= c.t - 0.03 && t < c.end); if (!c) return;
  const words = c.words.map((w) => (w.o || w.w).toUpperCase());
  let sz = 94; const gap = () => sz * 0.26;
  const measure = () => { ctx.font = font(sz, 900, 'Heavy'); return words.reduce((a, w, i) => a + ctx.measureText(w).width + (i ? gap() : 0), 0); };
  while (measure() > W - 150 && sz > 50) sz -= 3;
  const k = Math.min(1, spring(t - c.t + 0.03, { stiffness: 620, damping: 26 }));
  ctx.save(); ctx.translate(W / 2, y); ctx.scale(lerp(0.85, 1, k), lerp(0.85, 1, k)); ctx.globalAlpha = Math.min(1, k * 1.5);
  ctx.font = font(sz, 900, 'Heavy'); ctx.textAlign = 'left'; ctx.shadowColor = 'rgba(0,0,0,0.95)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 6;
  let x = -measure() / 2;
  c.words.forEach((w, i) => { const on = t >= w.t - 0.03;
    ctx.fillStyle = w.k ? (on ? GOLD : 'rgba(255,201,74,0.5)') : on ? '#fff' : 'rgba(255,255,255,0.5)';
    if (i) x += gap(); ctx.fillText(words[i], x, 0); x += ctx.measureText(words[i]).width; });
  ctx.restore();
}

const SETS = {};
M.film({
  fonts: [font(100, 900, 'Heavy'), font(100, 800, 'UI'), font(100, 400, 'Display')],
  hits: HITS, samples: 1,
  async init() {
    CAP = await fetch('captions.json').then((r) => r.json());
    const tm = await fetch('timing.json').then((r) => r.json());
    S.push(...tm.S); Object.assign(T, tm.T);
    HB = (await fetch('beats.json').then((r) => r.json())).heartbeats || [];
    HITS.push(...hitList());
    await G.initGL({ exposure: 1.0 });
    C = A.HEART_CENTER.clone(); SA = A.toScene(A.SA_NODE_MM); LIVER = A.toScene([-30, -130, 1120]);
    const body = await A.load(PARTS);
    SETS.chest = chestSet(body);
  },
  draw(ctx, u, t) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    G.renderSet(ctx, SETS.chest, t, u);
    const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.22, W / 2, H * 0.45, H * 0.8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const fl = t >= T.descansa ? Math.exp(-(t - T.descansa) * 6) * 0.5 : 0; if (fl > 0.01) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
    counter(ctx, t, T.cien - 0.05, T.tres - 0.05, 100000, 'LATIDOS AL DÍA');
    counter(ctx, t, T.tres - 0.05, S[3], 3000000000, 'LATIDOS EN TU VIDA');
    barrels(ctx, t); ecg(ctx, t); renewCards(ctx, t); beatDial(ctx, t); employee(ctx, t);
    UI.pill(ctx, 'PRÓXIMO CAPÍTULO: EL HÍGADO', W / 2, 1150, t, T.organo, { tEnd: S[12] - 0.1, bg: '#E63B2E', fg: '#fff', size: 44 });
    UI.pill(ctx, 'COMPÁRTELO', W / 2, 1150, t, T.compartele + 0.2, { bg: '#E63B2E', fg: '#fff', size: 56 });
    captionsBig(ctx, t);
    UI.watermark(ctx);
    if (t > T.end - 3) { ctx.save(); ctx.globalAlpha = 0.5; ctx.font = font(20, 800, 'UI'); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('Anatomía 3D: BodyParts3D © DBCLS · CC BY-SA 2.1 JP', W / 2, H - 40); ctx.restore(); }
  },
});
