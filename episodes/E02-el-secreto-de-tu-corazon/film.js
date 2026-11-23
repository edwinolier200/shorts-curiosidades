// E02 · El secreto de tu corazón — cinematic 3-D (three.js), every image built in code.
// Two worlds: the HALL (dark tile floor that ripples red with every heartbeat of the score, fog, light shafts,
// a glossy glass-red heart, gold metal numbers, barrels, electricity, the beat timeline) and the TABLE
// (dark wood, typewriter notes). The camera never cuts inside a world: it glides between shots.
import * as M from './lib/motion.js';
import * as G from './lib/gl.js';
import * as UI from './lib/ui.js';
const { THREE } = G;
const { W, H, E, prog, lerp, clamp, spring, SPRING, hash01, font } = M;

const S = [], T = {};
let CAP = { captions: [] }, HB = [];
const B = (s) => s / 0.5;
const HITS = [];
const hitList = () => [
  [B(0.1), 'heart appears', 'impact', { gain: 0.8 }],
  [B(S[1]), 'orbit', 'whoosh', { len: 0.5 }],
  [B(T.secreto), 'question mark', 'pop', { pitch: 'E5' }],
  [B(S[2]), 'to the number', 'whoosh', { len: 0.45 }],
  [B(T.cien), '100.000', 'thud+sub'],
  [B(T.tres), '3.000 millones', 'impact'],
  [B(S[3]), 'crane up', 'whoosh', { len: 0.5, from: 500, to: 2400 }],
  [B(T.siete), '7.000 litros', 'thud'],
  ...[0, 1, 2, 3, 4, 5, 6].map((i) => [B(T.treinta + 0.06 + i * 0.2), 'barrels land', 'tok', { gain: 0.5, pan: (i - 3) / 4 }]),
  [B(S[4]), 'heart again', 'whoosh', { len: 0.4 }],
  [B(T.electricidad), 'zap', 'crash+blip', { gain: 0.45 }],
  [B(T.latiendo), 'zap 2', 'blip', { pitch: 'C6' }],
  [B(S[5]), 'to the table', 'whoosh', { len: 0.45 }],
  [B(T.piel), 'note', 'type'], [B(T.globulos), 'note', 'type'], [B(T.celulas), 'note', 'type'],
  [B(T.edad), 'TU EDAD', 'impact'],
  [B(S[7]), 'lights out', 'sub', { gain: 0.9 }],
  [B(T.descansa), 'secret', 'bell', { pitch: 'E5', verb: 0.6 }],
  [B(S[8]), 'timeline', 'whoosh', { len: 0.4 }],
  [B(T.dos), '2/3', 'pop', { pitch: 'G5' }],
  [B(S[9]), 'to the table', 'whoosh', { len: 0.4 }],
  [B(T.trabajador), 'note', 'type'],
  [B(T.tarde), 'stamp', 'impact'],
  [B(S[10]), 'back to the heart', 'whoosh', { len: 0.5, from: 2400, to: 400 }],
  [B(T.compartele), 'share', 'pop', { pitch: 'E6' }],
];

// ------------------------------------------------------------------ the heartbeat (same times as the score's thumps)
function lastBeats(t, n = 3) { const out = []; for (let i = HB.length - 1; i >= 0 && out.length < n; i--) if (HB[i] <= t) out.push(HB[i]); return out; }
function pulse(t) {
  const b = lastBeats(t, 1)[0]; if (b === undefined) return 0;
  const d = t - b, d2 = d - 0.18;
  return Math.exp(-d * 13) + (d2 > 0 ? 0.6 * Math.exp(-d2 * 13) : 0);
}
// blend through keyframes [[t, value]] with an eased move of `dur` seconds starting at each key
function keys(t, K, dur = 0.8, ease = E.inOutCubic) {
  let i = 0; while (i + 1 < K.length && t >= K[i + 1][0]) i++;
  if (i === 0 || t >= K[i][0] + dur) return K[i][1];
  const p = ease(prog(t, K[i][0], K[i][0] + dur)), a = K[i - 1][1], b = K[i][1];
  return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], p)) : lerp(a, b, p);
}
const vfov = 40, hfov = 2 * Math.atan(Math.tan((vfov * Math.PI) / 360) * (W / H));
const fitDist = (width, frac = 0.82) => width / frac / 2 / Math.tan(hfov / 2);
const pop = (t, a, b = 1e9, cfg = SPRING.bouncy) => (t < a || t > b + 0.4 ? 0 : Math.max(0, Math.min(1.1, spring(t - a, cfg)) * (1 - E.inCubic(prog(t, b, b + 0.35)))));

// ------------------------------------------------------------------ materials + shapes
const gold = () => new THREE.MeshPhysicalMaterial({ color: 0xE6AE48, metalness: 1, roughness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.15, envMap: G.ENV, envMapIntensity: 1.5 });
function heartGeo() {
  const s = new THREE.Shape();
  s.moveTo(5, 5); s.bezierCurveTo(5, 5, 4, 0, 0, 0); s.bezierCurveTo(-6, 0, -6, 7, -6, 7); s.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
  s.bezierCurveTo(12, 15.4, 16, 11, 16, 7); s.bezierCurveTo(16, 7, 16, 0, 10, 0); s.bezierCurveTo(7, 0, 5, 5, 5, 5);
  const g = new THREE.ExtrudeGeometry(s, { depth: 4, bevelEnabled: true, bevelSegments: 12, steps: 1, bevelSize: 3.2, bevelThickness: 4, curveSegments: 48 });
  g.center(); g.rotateZ(Math.PI); g.scale(0.115, 0.115, 0.115);
  return g;
}
function shaftTexture() {
  const t = G.canvasTexture(64, 512);
  t.draw((c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,225,180,0.9)'); g.addColorStop(1, 'rgba(255,225,180,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, h); const g2 = c.createLinearGradient(0, 0, w, 0); g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(0.5, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,1)');
    c.globalCompositeOperation = 'destination-out'; c.fillStyle = g2; c.fillRect(0, 0, w, h); });
  return t;
}
function barrelTexture() {
  const t = G.canvasTexture(512, 512);
  t.draw((c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#7d0c18'); g.addColorStop(0.5, '#c4192b'); g.addColorStop(1, '#7d0c18');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (const y of [0.06, 0.33, 0.67, 0.94]) { c.fillStyle = 'rgba(40,0,6,0.55)'; c.fillRect(0, y * h - 9, w, 18); c.fillStyle = 'rgba(255,150,150,0.25)'; c.fillRect(0, y * h - 9, w, 3); }
  });
  return t;
}

// ------------------------------------------------------------------ HALL
function hallSet() {
  const scene = new THREE.Scene(), cam = G.camera(vfov, 0.1, 200);
  scene.background = new THREE.Color(0x070b0e); scene.fog = new THREE.FogExp2(0x120f0d, 0.05);
  const hemi = new THREE.HemisphereLight(0x9fb7c9, 0x120c06, 0.45); scene.add(hemi);
  const key = new THREE.SpotLight(0xffd9a0, 380, 80, 0.5, 0.6, 1.6); key.position.set(9, 22, -16); key.target.position.set(0, 0, 0); scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x5fd0e0, 1.4); rim.position.set(-6, 5, -8); scene.add(rim);
  const front = new THREE.DirectionalLight(0xfff1e0, 0.9); front.position.set(2, 4, 10); scene.add(front);
  const solo = new THREE.SpotLight(0xffe0c0, 0, 30, 0.32, 0.5, 1.2); solo.position.set(0, 10, 3); solo.target.position.set(0, 2.6, 0); scene.add(solo, solo.target);
  const red = new THREE.PointLight(0xff2a3a, 0, 14, 2); red.position.set(0, 2.6, 2.2); scene.add(red);

  // floor: instanced tiles whose colour carries the heartbeat ripple
  const NX = 36, NZ = 56, N = NX * NZ;
  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.88, 0.2, 0.88), new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.35, envMap: G.ENV, envMapIntensity: 0.45 }), N);
  const m4 = new THREE.Matrix4(), col = new THREE.Color(), R = new Float32Array(N), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) { const x = (i % NX) - NX / 2 + 0.5, z = -Math.floor(i / NX) + 12; m4.makeTranslation(x, -0.1, z); tiles.setMatrixAt(i, m4); R[i] = Math.hypot(x, z); seed[i] = hash01(i, 9); tiles.setColorAt(i, col.set(0x101418)); }
  scene.add(tiles);
  const shaftTex = shaftTexture(), shafts = [];
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(2 + i * 0.6, 40), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    p.position.set(7 - i * 2.4, 12, -20 - i * 3); p.rotation.z = -0.5; scene.add(p); shafts.push(p);
  }

  // the heart
  const heartMat = new THREE.MeshPhysicalMaterial({ color: 0xcf1230, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.06, sheen: 0.6, sheenColor: new THREE.Color(0xff7080), envMap: G.ENV, envMapIntensity: 1.2, emissive: 0x6a0012, emissiveIntensity: 0.3 });
  const heart = new THREE.Mesh(heartGeo(), heartMat); heart.castShadow = true; scene.add(heart);
  // gold question mark, numbers
  const G1 = gold();
  const qmark = new THREE.Mesh(G.text3D('?', 1.9, 0.5, 0.07, 10), G1); qmark.position.set(2.5, 4.3, 0.4); scene.add(qmark);
  const mk = (str, size) => { const g = G.text3D(str, size, 0.42, 0.06, 8); g.computeBoundingBox(); const m = new THREE.Mesh(g, G1); m.userData.w = g.boundingBox.max.x - g.boundingBox.min.x; scene.add(m); return m; };
  const num1 = mk('100.000', 1.3), num2 = mk('3.000.000.000', 1.05), num3 = mk('7.000 LITROS', 0.8);

  // barrels 7 x 5
  const NB = 35, bMat = new THREE.MeshPhysicalMaterial({ map: barrelTexture(), metalness: 0.55, roughness: 0.32, clearcoat: 0.7, envMap: G.ENV, envMapIntensity: 0.9 });
  const barrels = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.42, 0.42, 1.15, 32, 1), bMat, NB); scene.add(barrels);
  const BW = 7 * 1.02;

  // electricity: jagged glowing tubes around the heart + an ECG trace behind it
  const zapMat = new THREE.MeshBasicMaterial({ color: 0xa8f4ff, fog: false });
  const zaps = []; for (let i = 0; i < 6; i++) { const z = new THREE.Mesh(new THREE.BufferGeometry(), zapMat); scene.add(z); zaps.push(z); }
  let zapKey = -1;
  const ecgPts = []; for (let i = 0; i <= 240; i++) { const u = i / 240, x = lerp(-7, 7, u), ph = (u * 2.2) % 1;
    const y = 0.35 * Math.exp(-(((ph - 0.25) / 0.04) ** 2)) + 1.8 * Math.exp(-(((ph - 0.42) / 0.012) ** 2)) - 0.7 * Math.exp(-(((ph - 0.46) / 0.012) ** 2)) + 0.5 * Math.exp(-(((ph - 0.65) / 0.05) ** 2));
    ecgPts.push(new THREE.Vector3(x, 2.0 + y, -2.6)); }
  const ecgGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ecgPts), 600, 0.045, 6, false);
  const ecg = new THREE.Mesh(ecgGeo, new THREE.MeshBasicMaterial({ color: 0x55f0ff, fog: false })); scene.add(ecg);
  const ecgCount = ecgGeo.index.count, ecgStep = 6 * 6;

  // the beat timeline: 12 tiles, 4 red (works) + 8 blue (rests)
  const row = [];
  for (let i = 0; i < 12; i++) {
    const r = i < 4, mat = new THREE.MeshStandardMaterial({ color: r ? 0x3a0a10 : 0x0a1a3a, emissive: r ? 0xff2436 : 0x2f8cff, emissiveIntensity: 0, roughness: 0.35, metalness: 0.2 });
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.3, 0.82), mat); b.position.set(-4.95 + i * 0.9, 0.15, 2.2); scene.add(b); row.push(b);
  }
  const lbl = (str, size, color, x, y) => { const m = new THREE.Mesh(G.text3D(str, size, 0.12, 0.02, 6), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9 })); m.position.set(x, y, 2.2); m.rotation.x = -0.25; scene.add(m); return m; };
  const L1 = lbl('1/3', 0.75, 0xff3346, -3.6, 1.35), L2 = lbl('2/3', 0.75, 0x46a0ff, 1.35, 1.35);
  const L1b = lbl('TRABAJA', 0.3, 0xff8a94, -3.6, 0.72), L2b = lbl('DESCANSA', 0.3, 0x9cc8ff, 1.35, 0.72);
  const labels = [L1, L2, L1b, L2b];

  return { scene, camera: cam, bloom: 0.5, bloomThreshold: 0.8, bloomRadius: 0.55,
    update(t) {
      // ---- light level: normal, black-out for the secret, half for the timeline, warm for the end
      const lvl = keys(t, [[0, 1], [S[7], 0.06], [T.relaja, 0.5], [S[10], 1]], 0.5);
      hemi.intensity = 0.45 * lvl; key.intensity = 380 * lvl; rim.intensity = 1.4 * lvl; front.intensity = 0.9 * Math.max(lvl, 0.15);
      shafts.forEach((s, i) => { s.material.opacity = (0.11 + 0.05 * Math.sin(t * 0.8 + i)) * lvl; });
      solo.intensity = keys(t, [[0, 0], [S[7] + 0.25, 260], [S[8], 0]], 0.6);
      const pl = pulse(t); red.intensity = 30 * pl * Math.max(0.3, lvl);

      // ---- floor ripple: each heartbeat sends a red ring outward from the heart
      const bs = lastBeats(t, 3), sparkle = t > S[2] && t < S[4];
      for (let i = 0; i < N; i++) {
        let v = 0; for (const b of bs) { const d = t - b, x = R[i] - d * 11; v += Math.exp(-(x * x) / 1.6) * Math.exp(-d * 0.9); }
        if (sparkle && seed[i] < 0.04) v = Math.max(v, 0.5 + 0.5 * Math.sin(t * 3 + seed[i] * 80));
        v = Math.min(1, v);
        col.setRGB(lerp(0.03 * lvl + 0.005, 0.95, v), lerp(0.04 * lvl + 0.006, 0.07, v), lerp(0.05 * lvl + 0.008, 0.08, v));
        tiles.setColorAt(i, col);
      }
      tiles.instanceColor.needsUpdate = true;

      // ---- camera: a continuous glide between shots
      const d1 = fitDist(num1.userData.w), d2 = fitDist(num2.userData.w), db = fitDist(BW, 0.9);
      const P = keys(t, [
        [0, [0, 1.6, 13, 0, 2.6, 0]], [0.01, [0, 2.4, 8.2, 0, 2.6, 0]],
        [S[1], [3.4, 3.6, 6.8, 0.7, 2.9, 0]],
        [S[2], [-0.6, 1.6, d1 + 1, 0, 2.9, 0]], [T.tres, [0.6, 2.4, d2, 0, 2.9, 0]],
        [S[3], [0, db * 0.75, db * 0.85, 0, 1.0, 0]],
        [S[4], [-2.6, 2.9, 7.2, 0, 2.6, 0]],
        [S[7], [0, 2.6, 6.2, 0, 2.6, 0]],
        [S[8], [0, 5.2, 11, 0, 1.6, 0.8]],
        [S[10], [0, 2.5, 9.5, 0, 2.7, 0]],
      ], 1.0);
      const drift = [Math.sin(t * 0.37) * 0.35, Math.sin(t * 0.29 + 1) * 0.18, Math.sin(t * 0.21) * 0.25];
      const push = t >= S[10] ? E.inOutSine(prog(t, S[10], T.end)) * 3.4 : t >= S[7] && t < S[8] ? prog(t, S[7], S[8]) * 1.2 : 0;
      G.lookFrom(cam, [P[0] + drift[0], P[1] + drift[1], P[2] - push + drift[2]], [P[3], P[4], P[5]], Math.sin(t * 0.33) * 0.012);

      // ---- heart: where it sits, how big, how it beats
      const hp = keys(t, [[0, [0, 2.6, 0, 0]], [0.01, [0, 2.6, 0, 1]], [S[2], [0, 2.6, 0, 0]], [S[4], [0, 2.6, 0, 1]], [S[8], [0, 3.6, -3.2, 0.72]], [S[10], [0, 2.7, 0, 1.12]]], 0.7);
      const grow = Math.min(1.05, spring(t - 0.05, SPRING.gentle));
      heart.position.set(hp[0], hp[1], hp[2]);
      heart.scale.setScalar(Math.max(0.001, hp[3] * (t < 2 ? grow : 1) * (1 + 0.075 * pl)));
      heart.rotation.y = Math.sin(t * 0.55) * 0.4; heart.rotation.x = Math.sin(t * 0.4) * 0.06;
      const zap = t > T.electricidad && t < S[5] ? Math.max(0, Math.sin(t * 41) * Math.sin(t * 17)) : 0;
      heartMat.emissive.setHex(zap > 0.3 ? 0x3aa8c8 : 0x6a0012); heartMat.emissiveIntensity = 0.25 + 1.1 * pl + 1.5 * zap;
      heart.visible = heart.scale.x > 0.01;

      // ---- question mark + numbers
      const kq = pop(t, T.secreto, S[2] - 0.3); qmark.scale.setScalar(Math.max(0.001, kq)); qmark.rotation.y = t * 1.8; qmark.visible = kq > 0.01;
      const k1 = pop(t, T.cien - 0.05, T.tres - 0.25), k2 = pop(t, T.tres - 0.05, S[3] - 0.2), k3 = pop(t, T.siete - 0.05, S[4] - 0.25);
      [[num1, k1, [0, 2.9, 0]], [num2, k2, [0, 2.9, 0]], [num3, k3, [0, 3.6, -1.8]]].forEach(([m, k, p], j) => {
        m.visible = k > 0.01; m.scale.setScalar(Math.max(0.001, k)); m.position.set(p[0], p[1] + (1 - Math.min(1, k)) * -1.2, p[2]);
        m.rotation.y = Math.sin(t * 0.6 + j) * 0.14;
      });

      // ---- barrels drop in one after another
      for (let i = 0; i < NB; i++) {
        const cx = (i % 7) - 3, cz = Math.floor(i / 7) - 2, ta = T.treinta + 0.05 + i * 0.04;
        const k = t < ta || t > S[4] + 0.3 ? 0 : Math.min(1.08, spring(t - ta, SPRING.bouncy)) * (1 - E.inCubic(prog(t, S[4] - 0.2, S[4] + 0.25)));
        m4.compose(new THREE.Vector3(cx * 1.02, 0.58 + (1 - Math.min(1, k)) * 4, cz * 1.02), new THREE.Quaternion(), new THREE.Vector3(Math.max(0.001, k), Math.max(0.001, k), Math.max(0.001, k)));
        barrels.setMatrixAt(i, m4);
      }
      barrels.instanceMatrix.needsUpdate = true; barrels.visible = t > T.treinta - 0.1 && t < S[4] + 0.4;

      // ---- electricity
      const zOn = t > T.electricidad - 0.05 && t < S[5];
      const zk = Math.floor(t * 14);
      if (zOn && zk !== zapKey) {
        zapKey = zk;
        zaps.forEach((z, i) => {
          const a0 = hash01(zk * 7 + i, 3) * Math.PI * 2, pts = [];
          for (let s = 0; s <= 9; s++) { const r = 1.3 + s * 0.32, j = (hash01(zk * 31 + i * 11 + s, 5) - 0.5) * 0.5;
            pts.push(new THREE.Vector3(Math.cos(a0 + j) * r, 2.6 + Math.sin(a0 + j) * r * 0.9, (hash01(zk + i * 3 + s, 7) - 0.5) * 1.4)); }
          z.geometry.dispose(); z.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1), 40, 0.028, 5, false);
        });
      }
      zaps.forEach((z, i) => { z.visible = zOn && hash01(zk * 13 + i, 11) > 0.35; });
      const eP = prog(t, T.electricidad, T.electricidad + 1.6);
      ecg.visible = t > T.electricidad && t < S[5];
      ecgGeo.setDrawRange(0, Math.floor((ecgCount * eP) / ecgStep) * ecgStep);

      // ---- beat timeline (one heartbeat cycle: 1/3 works, 2/3 rests)
      const rowOn = t > S[8] - 0.2 && t < S[9] + 0.3;
      const b0 = lastBeats(t, 1)[0] ?? 0, per = 0.92, ph = clamp((t - b0) / per);
      row.forEach((b, i) => {
        const k = pop(t, S[8] + i * 0.05, S[9] - 0.2, SPRING.snappy);
        b.visible = rowOn && k > 0.01; b.scale.setScalar(Math.max(0.001, k));
        const lit = i < 4 ? ph * 3 * 4 > i && ph < 1 / 3 + 0.05 : ph > 1 / 3 && (ph - 1 / 3) * 1.5 * 8 > i - 4;
        b.material.emissiveIntensity = (lit ? 2.2 : 0.18) * clamp((t - T.relaja) * 2);
      });
      labels.forEach((m, i) => { const k = pop(t, T.dos - 0.1 + (i % 2) * 0.25, S[9] - 0.2); m.visible = k > 0.01; m.scale.setScalar(Math.max(0.001, k)); });
    } };
}

// ------------------------------------------------------------------ TABLE
function woodTexture() {
  const t = G.canvasTexture(1024, 1024);
  t.draw((c, w, h) => {
    c.fillStyle = '#2a1a10'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const y = hash01(i, 3) * h, a = 0.05 + hash01(i, 4) * 0.12;
      c.strokeStyle = hash01(i, 5) > 0.5 ? `rgba(95,58,30,${a})` : `rgba(10,5,2,${a})`; c.lineWidth = 1 + hash01(i, 6) * 5;
      c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 32) c.lineTo(x, y + Math.sin(x * 0.01 + i) * 6 + (hash01(i * 7 + x, 1) - 0.5) * 3); c.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3);
  return t;
}
function noteTexture(title, value, valueColor = '#2c2620') {
  const t = G.canvasTexture(1024, 480);
  t.draw((c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#e3d8bd'); g.addColorStop(1, '#bfae8b'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { c.fillStyle = `rgba(60,40,20,${hash01(i, 2) * 0.08})`; c.fillRect(hash01(i, 3) * w, hash01(i, 4) * h, 3, 3); }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#2c2620'; c.font = '700 92px "Courier New", monospace'; c.fillText(title, w / 2, h * 0.33);
    c.fillStyle = valueColor; c.font = '700 120px "Courier New", monospace'; c.fillText(value, w / 2, h * 0.7);
  });
  return t;
}
function tableSet() {
  const scene = new THREE.Scene(), cam = G.camera(38, 0.1, 100);
  scene.background = new THREE.Color(0x0a0705); scene.fog = new THREE.FogExp2(0x0a0705, 0.05);
  scene.add(new THREE.HemisphereLight(0x4a6a80, 0x0a0503, 0.4));
  const spot = new THREE.SpotLight(0xffc98a, 190, 40, 0.6, 0.7, 1.4); spot.position.set(-3, 12, 4); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); scene.add(spot, spot.target);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.6, metalness: 0.05 }));
  table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);
  const edge = new THREE.MeshStandardMaterial({ color: 0xb8a988, roughness: 0.9 });
  const note = (tex, x, z, r) => { const m = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.02, 1.6), [edge, edge, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }), edge, edge, edge]);
    m.position.set(x, 0.02, z); m.rotation.y = r; m.castShadow = true; scene.add(m); return m; };
  // group A: what renews and what doesn't
  const heartQ = noteTexture('CORAZÓN', '¿ ?', '#b3121f'), heartA = noteTexture('CORAZÓN', 'TU EDAD', '#b3121f');
  const A = [[note(noteTexture('PIEL', '1 MES'), -0.9, -2.0, 0.07), () => T.piel - 0.1],
    [note(noteTexture('GLÓBULOS ROJOS', '4 MESES'), 0.8, -0.2, -0.06), () => T.globulos - 0.1],
    [note(heartQ, -0.2, 1.75, 0.04), () => T.celulas - 0.1]];
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.06, 8, 80), new THREE.MeshStandardMaterial({ color: 0xff2a1a, emissive: 0xff1a0a, emissiveIntensity: 1.8 }));
  ring.rotation.x = -Math.PI / 2; ring.scale.set(1, 0.48, 1); ring.position.set(-0.2, 0.06, 1.75); scene.add(ring);
  // group B: the perfect employee
  const Bn = [[note(noteTexture('LLEGADAS TARDE', '0'), -0.7, -1.7, -0.05), () => T.trabajador - 0.05],
    [note(noteTexture('FALTAS', '0'), 0.9, 0.0, 0.07), () => T.trabajador + 0.45],
    [note(noteTexture('HORAS EXTRA', 'TODAS', '#b3121f'), -0.3, 1.8, -0.03), () => T.trabajador + 0.95]];
  return { scene, camera: cam, bloom: 0.22, bloomThreshold: 0.9,
    update(t) {
      const inA = t < S[8], t0 = inA ? S[5] : S[9];
      const p = E.inOutSine(prog(t, t0, inA ? S[7] : S[10]));
      if (inA && t >= S[6]) { const q = E.inOutCubic(prog(t, S[6], S[6] + 1.2));
        G.lookFrom(cam, [lerp(-0.2, -0.3, q), lerp(11.5, 7.6, q), lerp(6.5, 6.6, q)], [lerp(0, -0.2, q), 0, lerp(-0.2, 1.6, q)]); }
      else G.lookFrom(cam, [lerp(0.7, -0.2, p), lerp(13.5, 11.5, p), lerp(7.8, 6.5, p)], [0, 0, -0.2]);
      const drop = ([m, ta], show) => { const k = show ? spring(t - ta(), SPRING.snappy) : 0; m.visible = show && k > 0.01; m.position.y = 0.02 + (1 - Math.min(1, k)) * 2.2; };
      A.forEach((n) => drop(n, inA)); Bn.forEach((n) => drop(n, !inA));
      A[2][0].material[2].map = t >= T.edad ? heartA : heartQ;
      const kr = inA ? clamp((t - T.edad + 0.05) / 0.3) : 0; ring.visible = kr > 0; ring.scale.set(lerp(1.4, 1, E.outCubic(kr)), 0.48, lerp(1.4, 1, E.outCubic(kr)));
    } };
}

// ------------------------------------------------------------------ captions: big, centred, white; the key word in gold
const GOLD = '#FFC94A';
function captionsBig(ctx, t, y = 1270) {
  const c = CAP.captions.find((c) => t >= c.t - 0.03 && t < c.end); if (!c) return;
  const words = c.words.map((w) => (w.o || w.w).toUpperCase());
  let sz = 96; const gap = () => sz * 0.26;
  const measure = () => { ctx.font = font(sz, 900, 'Heavy'); return words.reduce((a, w, i) => a + ctx.measureText(w).width + (i ? gap() : 0), 0); };
  while (measure() > W - 150 && sz > 50) sz -= 3;
  const k = Math.min(1, spring(t - c.t + 0.03, { stiffness: 620, damping: 26 }));
  ctx.save(); ctx.translate(W / 2, y); ctx.scale(lerp(0.85, 1, k), lerp(0.85, 1, k)); ctx.globalAlpha = Math.min(1, k * 1.5);
  ctx.font = font(sz, 900, 'Heavy'); ctx.textAlign = 'left'; ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 6;
  let x = -measure() / 2;
  c.words.forEach((w, i) => {
    const on = t >= w.t - 0.03;
    ctx.fillStyle = w.k ? (on ? GOLD : 'rgba(255,201,74,0.5)') : on ? '#fff' : 'rgba(255,255,255,0.5)';
    if (i) x += gap(); ctx.fillText(words[i], x, 0); x += ctx.measureText(words[i]).width;
  });
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
    await G.initGL({ font: 'fonts/display.ttf', exposure: 1.05 });
    SETS.hall = hallSet(); SETS.table = tableSet();
  },
  draw(ctx, u, t) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    // which world, with a short cross-dissolve at each switch
    const inTable = (x) => (x >= S[5] && x < S[7]) || (x >= S[9] && x < S[10]);
    const sw = [S[5], S[7], S[9], S[10]].find((s) => t >= s && t < s + 0.35);
    if (sw !== undefined) {
      const a = inTable(sw - 0.01) ? SETS.table : SETS.hall, b = inTable(sw) ? SETS.table : SETS.hall;
      G.renderSet(ctx, a, t, u); G.renderSet(ctx, b, t, u, { alpha: E.inOutSine(prog(t, sw, sw + 0.35)) });
    } else G.renderSet(ctx, inTable(t) ? SETS.table : SETS.hall, t, u);
    // vignette
    const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.45, H * 0.8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // the secret: a white flash on "descansa"
    const fl = Math.exp(-Math.max(0, t - T.descansa) * 6) * (t >= T.descansa ? 0.55 : 0); if (fl > 0.01) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
    // 2-D accents
    UI.pill(ctx, 'LATIDOS AL DÍA', W / 2, 1100, t, T.cien + 0.1, { tEnd: T.tres - 0.1, bg: GOLD, size: 46 });
    UI.pill(ctx, 'LATIDOS EN TU VIDA', W / 2, 1100, t, T.tres + 0.1, { tEnd: S[3] - 0.1, bg: GOLD, size: 46 });
    UI.pill(ctx, 'BARRILES DE 200 LITROS', W / 2, 1100, t, T.barriles, { tEnd: S[4] - 0.1, bg: GOLD, size: 42 });
    UI.stamp(ctx, 'EMPLEADO DEL AÑO', W / 2, 700, t, T.tarde, { size: 64, tEnd: S[10] });
    UI.pill(ctx, 'COMPÁRTELO', W / 2, 1100, t, T.compartele + 0.2, { bg: '#E63B2E', fg: '#fff', size: 56 });
    captionsBig(ctx, t);
    UI.watermark(ctx);
  },
});
