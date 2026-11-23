// anatomy.js — real human anatomy for three.js films (BodyParts3D meshes, CC BY-SA 2.1 JP, © DBCLS).
// Meshes: assets3d/anatomy/<part>.glb (built by tools/anatomy_glb.py; shared body space in mm, z up, front = -y).
//   import * as A from './lib/anatomy.js';
//   const body = await A.load(['heart_wall', 'coronary_arteries', ...]);   // a THREE.Group, y-up, metres*k
//   body.parts.heart_wall.material ...                                     // each part is a Mesh
//   A.HEART_CENTER  (in the group's local space)  ·  A.beat(mesh, amount)  // squeeze the ventricles
// Credit line for every video that uses it (CC BY-SA): "Modelos anatómicos: BodyParts3D, © DBCLS, CC BY-SA 2.1 JP".
import * as G from './gl.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const { THREE } = G;

// ---- tissue materials: PBR + a world-space noise that breaks the plastic look (colour mottling, fibres, wet bump)
const NOISE = /* glsl */ `
float h3(vec3 p){ p=fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float a=.5, s=0.; for(int k=0;k<5;k++){ s+=a*vn(p); p*=2.03; a*=.5; } return s; }`;
function tissue({ color, color2, fat = null, fatAmt = 0, scale = 30, fibre = 0, bump = 0.25, rough = 0.42, clear = 0.9, sheen = 0.4, sheenColor = 0xffb0a0, opacity = 1 }) {
  const m = new THREE.MeshPhysicalMaterial({ color, roughness: rough, clearcoat: clear, clearcoatRoughness: 0.18, sheen, sheenColor: new THREE.Color(sheenColor), sheenRoughness: 0.5, envMapIntensity: 0.85, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
  const u = { uC2: { value: new THREE.Color(color2 ?? color) }, uFat: { value: new THREE.Color(fat ?? color) }, uFatAmt: { value: fatAmt }, uScale: { value: scale }, uFibre: { value: fibre }, uBump: { value: bump } };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed,1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWP; uniform vec3 uC2, uFat; uniform float uFatAmt, uScale, uFibre, uBump;\n${NOISE}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec3 P = vWP * uScale;
        float n = fbm(P), fb = sin((P.y*1.7 + P.x*0.6 + fbm(P*0.5)*6.0) * 6.0)*0.5+0.5;
        diffuseColor.rgb = mix(diffuseColor.rgb, uC2, smoothstep(0.35, 0.75, n) * 0.8);
        diffuseColor.rgb *= 1.0 - uFibre * 0.18 * fb;
        float fat = smoothstep(0.55, 0.85, fbm(P*0.12 + 7.0)) * uFatAmt * 2.0;
        diffuseColor.rgb = mix(diffuseColor.rgb, uFat, fat);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { vec3 Q = vWP * uScale * 2.0; float e = 0.05;
          vec3 g = vec3(fbm(Q+vec3(e,0,0))-fbm(Q-vec3(e,0,0)), fbm(Q+vec3(0,e,0))-fbm(Q-vec3(0,e,0)), fbm(Q+vec3(0,0,e))-fbm(Q-vec3(0,0,e)));
          normal = normalize(normal - uBump * (mat3(viewMatrix) * g)); }`);
  };
  m.customProgramCacheKey = () => `tissue${fibre}${fatAmt}${bump}`;
  return m;
}
export const MAT = {
  heart_wall: () => tissue({ color: 0x6e1012, color2: 0x9a2a24, fat: 0xcfa560, fatAmt: 0.22, fibre: 1, bump: 0.3, rough: 0.38, clear: 1 }),
  coronary_arteries: () => tissue({ color: 0x9c1c1c, color2: 0xc0392b, bump: 0.1, rough: 0.3, clear: 1, sheen: 0.2 }),
  cardiac_veins: () => tissue({ color: 0x3d1328, color2: 0x5a2040, bump: 0.1, rough: 0.3, clear: 1, sheen: 0.2 }),
  aorta: () => tissue({ color: 0xc98f7e, color2: 0xe0b3a0, fat: 0xe8cf8a, fatAmt: 0.0, bump: 0.12, scale: 14, rough: 0.4, sheen: 0.5 }),
  vena_cava: () => tissue({ color: 0x4a1a33, color2: 0x6b2a48, bump: 0.15, rough: 0.35 }),
  pulmonary_artery: () => tissue({ color: 0x8e5a6a, color2: 0xb07a86, bump: 0.15, rough: 0.4 }),
  lungs: () => tissue({ color: 0xc97f7a, color2: 0xe3a59a, scale: 18, bump: 0.5, rough: 0.6, clear: 0.4, sheen: 0.7, opacity: 1 }),
  ribs: () => tissue({ color: 0xe6d8bc, color2: 0xcdb894, scale: 22, bump: 0.3, rough: 0.55, clear: 0.3, sheen: 0.1, sheenColor: 0xffffff }),
  sternum: () => tissue({ color: 0xe6d8bc, color2: 0xcdb894, scale: 22, bump: 0.3, rough: 0.55, clear: 0.3, sheen: 0.1, sheenColor: 0xffffff }),
  liver: () => tissue({ color: 0x5c1e17, color2: 0x7a2c20, scale: 16, bump: 0.25, rough: 0.35, clear: 1, sheen: 0.4 }),
  diaphragm: () => tissue({ color: 0x8a2a28, color2: 0xa84a40, fibre: 1, bump: 0.3 }),
};
// heart centre in body space (mm) -> after load() it is in the group's local frame
export const HEART_MM = [21, -122, 1185];
export const K = 0.03;                                       // 1 mm -> 0.03 scene units (heart ≈ 3.5 units tall)
export const toScene = ([x, y, z]) => new THREE.Vector3(x * K, z * K, -y * K);
export const HEART_CENTER = toScene(HEART_MM);

export async function load(parts, { base = 'a3d/anatomy' } = {}) {
  const L = new GLTFLoader(), group = new THREE.Group(); group.parts = {};
  // body space (x right, y back, z up, mm) -> scene (x, y up, z toward viewer)
  const holder = new THREE.Group(); holder.rotation.x = -Math.PI / 2; holder.scale.set(K, K, K); group.add(holder);
  for (const p of parts) {
    const g = await L.loadAsync(`${base}/${p}.glb`);
    g.scene.traverse((o) => { if (o.isMesh) { o.geometry.computeVertexNormals(); o.material = (MAT[p] || MAT.heart_wall)(); o.castShadow = o.receiveShadow = true; group.parts[p] = o; o.userData.base = o.geometry.attributes.position.array.slice(); } });
    holder.add(g.scene);
  }
  return group;
}
// squeeze the heart wall around its long axis (systole); amount 0..1. Vertex positions are body-space mm.
export function beat(mesh, amount, { center = HEART_MM, apexDir = [0.45, -0.35, -0.82], k = 0.07 } = {}) {
  const pos = mesh.geometry.attributes.position, b = mesh.userData.base, a = pos.array;
  const d = new THREE.Vector3(...apexDir).normalize();
  for (let i = 0; i < a.length; i += 3) {
    const x = b[i] - center[0], y = b[i + 1] - center[1], z = b[i + 2] - center[2];
    const along = x * d.x + y * d.y + z * d.z;                       // + toward the apex
    const w = Math.min(1, Math.max(0, (along + 30) / 70));            // ventricles squeeze more than atria
    const s = 1 - k * amount * w;
    a[i] = center[0] + (x - along * d.x) * s + along * d.x * (1 - 0.03 * amount * w);
    a[i + 1] = center[1] + (y - along * d.y) * s + along * d.y * (1 - 0.03 * amount * w);
    a[i + 2] = center[2] + (z - along * d.z) * s + along * d.z * (1 - 0.03 * amount * w);
  }
  pos.needsUpdate = true; mesh.geometry.computeVertexNormals();
}
