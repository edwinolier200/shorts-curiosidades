import * as M from './lib/motion.js';
import * as G from './lib/gl.js';
import * as A from './lib/anatomy.js';
const { THREE } = G; const { W, H } = M;
const SETS = {}; const HEART = ['heart_wall','coronary_arteries','cardiac_veins','aorta','vena_cava','pulmonary_artery'];
const COL = { heart_wall: 0xe8473f, coronary_arteries: 0xffd23f, cardiac_veins: 0x5b6cff, aorta: 0xff7a6b, vena_cava: 0x4a63e0, pulmonary_artery: 0x7f8cff };
function grad() { const d = new Uint8Array([90, 170, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; }
function outlineMat(w) { const m = new THREE.MeshBasicMaterial({ color: 0x1a0a12, side: THREE.BackSide });
  m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\ntransformed += normalize(normal) * ${w.toFixed(2)};`); }; return m; }
M.film({ fonts: [], samples: 1,
  async init() {
    await G.initGL({ exposure: 1.0 });
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1b1030);
    const d = new THREE.DirectionalLight(0xffffff, 2.4); d.position.set(-4, 6, 8); scene.add(d, new THREE.AmbientLight(0xffffff, 0.35));
    const body = await A.load(HEART); scene.add(body); const g = grad();
    Object.entries(body.parts).forEach(([k, m]) => {
      m.material = new THREE.MeshToonMaterial({ color: COL[k], gradientMap: g });
      const o = new THREE.Mesh(m.geometry, outlineMat(k === 'heart_wall' ? 1.6 : 0.8)); m.parent.add(o);
    });
    // cartoon eyes? no - keep it anatomical but friendly
    const cam = G.camera(30); SETS.a = { scene, camera: cam, bloom: 0, update(t) {
      const c = A.HEART_CENTER; G.lookFrom(cam, [c.x + 1.5, c.y + 1, c.z + 12], [c.x, c.y + 0.6, c.z]); } };
  },
  draw(ctx, u, t) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); G.renderSet(ctx, SETS.a, t, u); } });
