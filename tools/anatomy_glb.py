# BodyParts3D (CC BY-SA 2.1 JP, (c) DBCLS) STL -> decimated, welded, smooth-shaded GLB groups for three.js.
# Coordinates stay in the shared BodyParts3D space (mm), so groups line up with each other.
#   python3 tools/anatomy_glb.py <stl_dir> assets3d/anatomy
import sys, os, json, numpy as np, trimesh, fast_simplification as fs
SRC, OUT = sys.argv[1], sys.argv[2]
G = {
 'heart_wall': (['FMA7274'], 60000),
 'coronary_arteries': (['FMA3802','FMA3818','FMA3840nsn','FMA3862nsn','FMA3895','FMA4685','FMA76994'], 30000),
 'cardiac_veins': (['FMA4706','FMA4707','FMA4713','FMA71567','FMA76751'], 25000),
 'aorta': (['FMA3736','FMA3768','FMA3784','FMA3932nsn','FMA4058','FMA4694'], 30000),
 'vena_cava': (['FMA4720','FMA10951'], 12000),
 'pulmonary_artery': (['FMA66326'], 30000),
 'lungs': (['FMA7333','FMA7337','FMA7370','FMA7371','FMA7383'], 60000),
 'ribs': (['FMA7857','FMA7882','FMA7909','FMA7957','FMA7987','FMA8012','FMA8039','FMA8066','FMA8093','FMA8148','FMA8175','FMA8202','FMA8229','FMA8256','FMA8283','FMA8310'], 70000),
 'sternum': (['FMA7486','FMA7487','FMA7488'], 12000),
 'diaphragm': (['FMA13295'], 25000),
 'liver': (['FMA7197'], 40000),
}
CLIP = {'pulmonary_artery': ([-45, -200, 1220], [85, -60, 1400]), 'heart_wall': ([-99, -999, 1166], [999, 999, 9999]),
        'aorta': ([-99, -999, 1195], [999, 999, 9999]), 'vena_cava': ([-99, -999, 1195], [999, 999, 9999])}
NO_NEEDLE = {'aorta', 'vena_cava', 'pulmonary_artery', 'coronary_arteries', 'cardiac_veins', 'ribs', 'sternum'}
def needles(m):
    # needle triangles: one long edge and almost no area (they show up as hair-thin streaks)
    e = m.vertices[m.faces]; L = np.max(np.linalg.norm(e - np.roll(e, 1, axis=1), axis=2), axis=1)
    bad = (L > 6.0) & (m.area_faces / np.maximum(L, 1e-6) ** 2 < 0.03)
    m.update_faces(~bad); m.remove_unreferenced_vertices(); return m
info = {}
for name, (ids, target) in G.items():
    ms = []
    for i in ids:
        p = os.path.join(SRC, i + '.stl')
        if os.path.exists(p): ms.append(trimesh.load(p, force='mesh'))
    m = trimesh.util.concatenate(ms); m.merge_vertices()
    # drop the long sliver triangles some source meshes carry, then tiny floating bits
    m = m if name in NO_NEEDLE else needles(m)
    if name in CLIP: lo, hi = CLIP[name]; c = m.triangles_center; m.update_faces(np.all((c >= lo) & (c <= hi), axis=1)); m.remove_unreferenced_vertices()
    parts = m.split(only_watertight=False); m = trimesh.util.concatenate([p for p in parts if len(p.faces) > 150])
    v, f = m.vertices.astype(np.float32), m.faces.astype(np.int64)
    if len(f) > target:
        v, f = fs.simplify(v, f, target_reduction=1 - target / len(f))
    m = trimesh.Trimesh(v, f, process=True); m.merge_vertices()
    if name in CLIP: lo, hi = CLIP[name]; c = m.triangles_center; m.update_faces(np.all((c >= lo) & (c <= hi), axis=1)); m.remove_unreferenced_vertices()
    if name not in NO_NEEDLE: m = needles(m)
    vz = m.vertices[m.faces][:, :, 2]; m.update_faces(vz.max(1) - vz.min(1) < 25); m.remove_unreferenced_vertices()   # decimation spikes
    m = m if name in NO_NEEDLE else needles(m)
    m = trimesh.util.concatenate([p for p in m.split(only_watertight=False) if len(p.faces) > 150])
    trimesh.smoothing.filter_taubin(m, iterations=6)
    # Taubin can fling non-manifold vertices out into spikes: drop those faces after smoothing
    e = m.vertices[m.faces]; L = np.max(np.linalg.norm(e - np.roll(e, 1, axis=1), axis=2), axis=1)
    m.update_faces(L < 3 * np.median(L) + 6); m.remove_unreferenced_vertices()
    m = trimesh.util.concatenate([p for p in m.split(only_watertight=False) if len(p.faces) > 150])
    m.export(os.path.join(OUT, name + '.glb'))
    info[name] = dict(faces=len(m.faces), bounds=m.bounds.round(1).tolist())
    print(name, len(m.faces), m.bounds.round(0).tolist())
json.dump(info, open(os.path.join(OUT, 'info.json'), 'w'), indent=1)
