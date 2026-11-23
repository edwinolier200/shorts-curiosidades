// Style picker: the same real heart shape in 6 looks (one per second of the film).
import * as M from './lib/motion.js';
import * as G from './lib/gl.js';
import * as A from './lib/anatomy.js';
const { THREE } = G; const { W, H } = M;
const PARTS = ['heart_wall','coronary_arteries','cardiac_veins','aorta','vena_cava','pulmonary_artery'];
const SETS = {};
const pal = (h, v, a, vc, p, ve) => ({ heart_wall: h, coronary_arteries: v, cardiac_veins: ve, aorta: a, vena_cava: vc, pulmonary_artery: p });
let GR; const grad = (n) => { const d = n === 2 ? [110, 255] : [70, 150, 255]; const t = new THREE.DataTexture(new Uint8Array(d), d.length, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; };
const STYLES = [
  { name: 'real', bg: 0x0c0405, mat: (k) => A.MAT[k]() },
  { name: 'toon', bg: 0x1b1030, outline: true, mat: (k) => new THREE.MeshToonMaterial({ color: pal(0xe8473f, 0xffd23f, 0xff7a6b, 0x4a63e0, 0x7f8cff, 0x5b6cff)[k], gradientMap: grad(3) }) },
  { name: 'clay', bg: 0x2a3a5c, mat: (k) => new THREE.MeshStandardMaterial({ color: pal(0xc9483d, 0xe8b04a, 0xd98a7a, 0x5a6fb0, 0x8c96c9, 0x6a78c0)[k], roughness: 0.92, metalness: 0 }) },
  { name: 'pixar', bg: 0x173a5e, mat: (k) => new THREE.MeshPhysicalMaterial({ color: pal(0xd92d3a, 0xffc23d, 0xff8577, 0x3d5fd9, 0x7b8cff, 0x4f63f0)[k], roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.6, sheenColor: new THREE.Color(0xffb3b3) }) },
  { name: 'flat', bg: 0xf4e3c8, mat: (k) => new THREE.MeshToonMaterial({ color: pal(0xe35d5b, 0xf6b93b, 0xf19a8e, 0x5c7cfa, 0x91a7ff, 0x748ffc)[k], gradientMap: grad(2) }) },
  { name: 'holo', bg: 0x02101c, mat: () => new THREE.MeshBasicMaterial({ color: 0x38d6ff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), wire: true },
];
function outlineMat(w) { const m = new THREE.MeshBasicMaterial({ color: 0x1a0a12, side: THREE.BackSide });
  m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\ntransformed += normalize(normal) * ${w.toFixed(2)};`); }; return m; }
M.film({ fonts: [], samples: 1,
  async init() {
    await G.initGL({ exposure: 1.0 });
    const scene = new THREE.Scene(); scene.environment = G.ENV;
    const key = new THREE.DirectionalLight(0xfff4e8, 2.6); key.position.set(-4, 6, 8);
    const rim = new THREE.DirectionalLight(0xbfe4ff, 1.8); rim.position.set(5, 3, -6);
    scene.add(key, rim, new THREE.HemisphereLight(0xffffff, 0x302030, 0.5));
    const body = await A.load(PARTS); scene.add(body); SETS.body = body;
    SETS.mats = STYLES.map((st) => Object.fromEntries(PARTS.map((k) => [k, st.mat(k)])));
    SETS.outl = {}; PARTS.forEach((k) => { const o = new THREE.Mesh(body.parts[k].geometry, outlineMat(k === 'heart_wall' ? 1.5 : 0.8)); body.parts[k].add(o); SETS.outl[k] = o; });
    SETS.wire = {}; PARTS.forEach((k) => { const w = new THREE.LineSegments(new THREE.EdgesGeometry(body.parts[k].geometry, 25), new THREE.LineBasicMaterial({ color: 0x9ff0ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending })); body.parts[k].add(w); SETS.wire[k] = w; });
    const cam = G.camera(30); SETS.a = { scene, camera: cam, bloom: 0.25, bloomThreshold: 0.85, update(t) {
      const i = Math.min(5, Math.floor(t)), st = STYLES[i];
      scene.background = new THREE.Color(st.bg);
      PARTS.forEach((k) => { body.parts[k].material = SETS.mats[i][k]; SETS.outl[k].visible = !!st.outline; SETS.wire[k].visible = !!st.wire; });
      key.intensity = st.name === 'flat' ? 1.6 : 2.6;
      const c = A.HEART_CENTER; G.lookFrom(cam, [c.x + 1.5, c.y + 1, c.z + 12.5], [c.x, c.y + 0.5, c.z]);
    } };
  },
  draw(ctx, u, t) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); G.renderSet(ctx, SETS.a, t, u); } });
