// Cinematic 3-D look demo: perspective tile floor with fog + light shafts + gold 3-D number,
// then a dark wooden table with typewriter notes crossed out in red. Big centred captions.
import * as M from './lib/motion.js';
import * as G from './lib/gl.js';
const { THREE } = G;
const { W, H, E, prog, lerp, clamp, spring, SPRING, hash01, font } = M;
const SETS = {};

// ------------------------------------------------------------------ shared helpers
function shaftTexture() {                     // soft vertical light shaft for additive planes
  const t = G.canvasTexture(64, 512);
  t.draw((c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,230,180,0.9)'); g.addColorStop(1, 'rgba(255,230,180,0)');
    c.fillStyle = g; c.fillRect(0, 0, w, h); const g2 = c.createLinearGradient(0, 0, w, 0); g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(0.5, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,1)');
    c.globalCompositeOperation = 'destination-out'; c.fillStyle = g2; c.fillRect(0, 0, w, h); });
  return t;
}
const gold = () => new THREE.MeshPhysicalMaterial({ color: 0xE2A946, metalness: 1, roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.2, envMap: G.ENV, envMapIntensity: 1.4 });

// ------------------------------------------------------------------ SET 1: tile floor + gold number
function gridSet() {
  const scene = new THREE.Scene(), cam = G.camera(42, 0.1, 200);
  scene.background = new THREE.Color(0x0d1418); scene.fog = new THREE.FogExp2(0x1b1a16, 0.045);
  scene.add(new THREE.HemisphereLight(0x9fb7c9, 0x120c06, 0.5));
  const key = new THREE.SpotLight(0xffd9a0, 400, 80, 0.5, 0.6, 1.6); key.position.set(10, 24, -18); key.target.position.set(0, 0, 0); scene.add(key, key.target);
  const NX = 44, NZ = 70, N = NX * NZ;
  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.86, 0.18, 0.86), new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.35, envMap: G.ENV, envMapIntensity: 0.5 }), N);
  const m = new THREE.Matrix4(), col = new THREE.Color();
  const seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) { const x = (i % NX) - NX / 2, z = -Math.floor(i / NX) + 8; m.makeTranslation(x, 0, z); tiles.setMatrixAt(i, m); seeds[i] = hash01(i, 9); tiles.setColorAt(i, col.set(0x2b3a40)); }
  scene.add(tiles);
  const shaftTex = shaftTexture(), shafts = [];
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(2.2 + i * 0.6, 40), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    p.position.set(6 - i * 2.2, 12, -22 - i * 3); p.rotation.z = -0.5; scene.add(p); shafts.push(p);
  }
  const num = new THREE.Mesh(G.text3D('100.000', 1.25, 0.4, 0.06, 8), gold()); num.position.set(0, 6.4, -9); scene.add(num);
  const glow = new THREE.PointLight(0xffc770, 25, 30, 2); glow.position.set(0, 7, -5); scene.add(glow);
  return { scene, camera: cam, bloom: 0.45, bloomThreshold: 0.85, bloomRadius: 0.6,
    update(t) {
      const p = E.inOutSine(prog(t, 0, 5.5));
      G.lookFrom(cam, [lerp(-1.2, 0.6, p), lerp(4.2, 2.8, p), lerp(13, 8, p)], [0, 3.6, -9]);
      // a heartbeat wave of lit tiles travels away from the camera (70 bpm)
      const front = t * 7;
      for (let i = 0; i < N; i++) {
        const z = Math.floor(i / NX), d = Math.abs(z - (front % 60));
        const beat = Math.exp(-((t * 70 / 60) % 1) * 5);
        const lit = d < 1.4 ? 1 : seeds[i] < 0.06 * clamp(t / 4) ? 0.6 : 0;
        col.setRGB(lerp(0.035, 1.0, lit), lerp(0.045, 0.12 + 0.12 * beat, lit), lerp(0.05, 0.08, lit));
        tiles.setColorAt(i, col);
      }
      tiles.instanceColor.needsUpdate = true;
      const k = spring(t - 0.15, SPRING.gentle);
      num.position.y = lerp(3.5, 6.4, Math.min(1, k)); num.rotation.y = Math.sin(t * 0.6) * 0.12; num.scale.setScalar(Math.max(0.001, Math.min(1.05, k)));
      shafts.forEach((s, i) => { s.material.opacity = 0.12 + 0.06 * Math.sin(t * 0.8 + i); });
    } };
}

// ------------------------------------------------------------------ SET 2: dark table + typewriter notes
function woodTexture() {
  const t = G.canvasTexture(1024, 1024);
  t.draw((c, w, h) => {
    c.fillStyle = '#2a1a10'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const y = hash01(i, 3) * h, a = 0.05 + hash01(i, 4) * 0.12;
      c.strokeStyle = hash01(i, 5) > 0.5 ? `rgba(90,55,30,${a})` : `rgba(10,5,2,${a})`; c.lineWidth = 1 + hash01(i, 6) * 5;
      c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 32) c.lineTo(x, y + Math.sin(x * 0.01 + i) * 6 + (hash01(i * 7 + x, 1) - 0.5) * 3); c.stroke(); }
  });
  t.texture = t; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3);
  return t;
}
function noteTexture(word) {
  const t = G.canvasTexture(768, 320);
  t.draw((c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#d9ceb3'); g.addColorStop(1, '#b8a988'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(60,40,20,${hash01(i, 2) * 0.08})`; c.fillRect(hash01(i, 3) * w, hash01(i, 4) * h, 3, 3); }
    c.fillStyle = '#2c2620'; c.font = '700 120px "Courier New", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(word, w / 2, h / 2 + 6);
  });
  return t;
}
function tableSet() {
  const scene = new THREE.Scene(), cam = G.camera(38, 0.1, 100);
  scene.background = new THREE.Color(0x0a0705); scene.fog = new THREE.FogExp2(0x0a0705, 0.06);
  scene.add(new THREE.HemisphereLight(0x4a6a80, 0x0a0503, 0.35));
  const spot = new THREE.SpotLight(0xffc98a, 160, 40, 0.55, 0.7, 1.4); spot.position.set(-3, 12, 4); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); scene.add(spot, spot.target);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.62, metalness: 0.05 }));
  table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);
  const words = [['corazón', -0.9, 2.4, 0.1], ['pulmones', 1.0, 1.0, -0.08], ['cerebro', -0.8, -0.6, 0.06], ['riñones', 0.9, -2.1, -0.1]];
  const notes = words.map(([w, x, z, r], i) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.02, 1.25), [0, 0, new THREE.MeshStandardMaterial({ map: noteTexture(w), roughness: 0.85 }), 0, 0, 0].map((m) => m || new THREE.MeshStandardMaterial({ color: 0xb8a988 })));
    mesh.position.set(x, 0.02 + i * 0.005, z); mesh.rotation.y = r; mesh.castShadow = true; scene.add(mesh);
    const line = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.012, 0.09), new THREE.MeshStandardMaterial({ color: 0xff2a1a, emissive: 0xff1a0a, emissiveIntensity: 1.6 }));
    line.position.set(x, 0.05 + i * 0.005, z); line.rotation.y = r + 0.08; scene.add(line);
    return { mesh, line, x };
  });
  return { scene, camera: cam, bloom: 0.2, bloomThreshold: 0.92,
    update(t) {
      const lt = t - 5.5, p = E.inOutSine(prog(lt, 0, 5.5));
      G.lookFrom(cam, [lerp(0.6, -0.3, p), lerp(13, 10.5, p), lerp(7.5, 5.5, p)], [0, 0, -0.2]);
      notes.forEach((n, i) => {
        const k = spring(lt - i * 0.7, SPRING.snappy);
        n.mesh.position.y = 0.02 + i * 0.005 + (1 - Math.min(1, k)) * 2; n.mesh.visible = k > 0.01;
        const s = clamp((lt - i * 0.7 - 0.6) / 0.35);                 // the red line draws across
        n.line.scale.x = Math.max(0.001, s); n.line.visible = s > 0;
        n.line.position.x = n.x - (1 - s) * 1.3 * Math.cos(n.mesh.rotation.y);
      });
    } };
}

// ------------------------------------------------------------------ big centred captions (reference style)
const CAPS = [[0.3, 2.6, 'TU CORAZÓN'], [2.6, 5.4, 'LATE 100.000 VECES AL DÍA'], [5.6, 7.8, 'Y NUNCA SE QUEJA'], [7.8, 11, 'DE NINGUNO']];
function captions(ctx, t) {
  const c = CAPS.find(([a, b]) => t >= a && t < b); if (!c) return;
  const k = Math.min(1, spring(t - c[0], { stiffness: 600, damping: 24 }));
  ctx.save(); ctx.translate(W / 2, 1180); ctx.scale(lerp(0.8, 1, k), lerp(0.8, 1, k));
  let sz = 104; ctx.font = font(sz, 900, 'Heavy'); while (ctx.measureText(c[2]).width > W - 140) ctx.font = font(sz -= 4, 900, 'Heavy'); ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#fff'; ctx.fillText(c[2], 0, 0); ctx.restore();
}

M.film({
  fonts: [font(100, 900, 'Heavy'), font(100, 800, 'UI')],
  samples: 1,
  async init() { await G.initGL({ font: 'fonts/display.ttf', exposure: 1.05 }); SETS.grid = gridSet(); SETS.table = tableSet(); },
  draw(ctx, u, t) {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    G.renderSet(ctx, t < 5.5 ? SETS.grid : SETS.table, t, u);
    // vignette + a little film grain-free contrast
    const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.45, H * 0.8); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    captions(ctx, t);
  },
});
