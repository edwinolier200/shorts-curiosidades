// maps.js — animated maps for the films (countries, cities, routes, true-size comparisons).
// Pure functions of their inputs: draw from a camera you compute from t (springKeys / kf), never from state.
//
//   import * as MAP from './lib/maps.js';
//   await MAP.load();                                   // in M.film init() — loads lib/geo/world-50m.json
//   const cam = MAP.camera(lon, lat, zoom);             // zoom 1 = whole world fits the frame width
//   MAP.world(ctx, cam);                                // ocean + all land
//   MAP.country(ctx, cam, 'Colombia', { fill: '#FF3B30' });
//   MAP.city(ctx, cam, -74.07, 4.71, 'BOGOTÁ', t, t0);   // pulsing marker + label
//   MAP.route(ctx, cam, [-74.07, 4.71], [31.2, 30.0], p); // great-circle line drawn up to progress p (0..1)
//   MAP.trueSize(ctx, cam, 'France', [-73, 4], {...});  // France at its real size, moved onto Colombia
//
// Country names are the Natural Earth English names (world-atlas): 'Colombia', 'Brazil', 'Mexico', 'Spain',
// 'France', 'United States of America', 'Guyana', 'Suriname'... MAP.ES gives Spanish labels for common ones.
// Data: Natural Earth 1:50m via world-atlas (public domain / ISC).
import { W, H } from './motion.js';

export const STYLE = {
  ocean: '#0A1424', oceanGlow: '#10233F', land: '#1C2A3D', border: '#3A5170', grid: 'rgba(120,160,220,0.07)',
  accent: '#FF3B30', gold: '#FFD60A', ink: '#F4EFE6',
};
export const ES = {
  'Colombia': 'COLOMBIA', 'Brazil': 'BRASIL', 'Mexico': 'MÉXICO', 'Argentina': 'ARGENTINA', 'Peru': 'PERÚ', 'Chile': 'CHILE',
  'Venezuela': 'VENEZUELA', 'Ecuador': 'ECUADOR', 'Bolivia': 'BOLIVIA', 'Paraguay': 'PARAGUAY', 'Uruguay': 'URUGUAY',
  'Panama': 'PANAMÁ', 'Costa Rica': 'COSTA RICA', 'Guyana': 'GUYANA', 'Suriname': 'SURINAM', 'Spain': 'ESPAÑA',
  'France': 'FRANCIA', 'Portugal': 'PORTUGAL', 'Germany': 'ALEMANIA', 'Italy': 'ITALIA', 'United Kingdom': 'REINO UNIDO',
  'United States of America': 'EE. UU.', 'Canada': 'CANADÁ', 'Cuba': 'CUBA', 'Dominican Rep.': 'REP. DOMINICANA',
  'Guatemala': 'GUATEMALA', 'Honduras': 'HONDURAS', 'El Salvador': 'EL SALVADOR', 'Nicaragua': 'NICARAGUA',
  'Netherlands': 'PAÍSES BAJOS', 'Belgium': 'BÉLGICA', 'Switzerland': 'SUIZA', 'Austria': 'AUSTRIA', 'Japan': 'JAPÓN',
  'China': 'CHINA', 'Russia': 'RUSIA', 'Australia': 'AUSTRALIA', 'India': 'INDIA', 'Egypt': 'EGIPTO',
};

let GEO = null; const BY = new Map();
export async function load(url = 'lib/geo/world-50m.json') {
  GEO = await fetch(url).then((r) => r.json());
  for (const f of GEO.features) BY.set(f.properties.name, f);
  return GEO;
}
export const feature = (name) => {
  const f = BY.get(name);
  if (!f) throw new Error(`maps.js: unknown country "${name}"`);
  return f;
};
const polys = (f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates);

// ------------------------------------------------------------------ projection + camera (Web Mercator)
const D = Math.PI / 180;
const clampLat = (lat) => Math.max(-85, Math.min(85, lat));
export const merc = (lon, lat) => [lon / 360 + 0.5, 0.5 - Math.log(Math.tan(Math.PI / 4 + clampLat(lat) * D / 2)) / (2 * Math.PI)];
// tilt 0..1 squashes the map vertically (a table-top view, used by relief()).
export function camera(lon, lat, zoom, { cx = W / 2, cy = H * 0.42, tilt = 0 } = {}) {
  const [mx, my] = merc(lon, lat); const s = W * zoom, ty = 1 - 0.42 * tilt;
  return { mx, my, s, cx, cy, zoom, tilt, p: (lo, la) => { const [x, y] = merc(lo, la); return [cx + (x - mx) * s, cy + (y - my) * s * ty]; } };
}
// Zoom that makes a lon/lat box fill `frac` of the frame width/height.
export function fit(bbox, frac = 0.8, { h = H * 0.6 } = {}) {
  const [a, b] = merc(bbox[0], bbox[3]), [c, d] = merc(bbox[2], bbox[1]);
  return Math.min((W * frac) / (W * (c - a)), (h * frac) / (W * (d - b)));
}
export function bbox(name, { minLon = -180, maxLon = 180 } = {}) {
  let b = [180, 90, -180, -90];
  for (const poly of polys(feature(name))) for (const [lo, la] of poly[0]) {
    if (lo < minLon || lo > maxLon) continue;
    b = [Math.min(b[0], lo), Math.min(b[1], la), Math.max(b[2], lo), Math.max(b[3], la)];
  }
  return b;
}
export const center = (name, o) => { const b = bbox(name, o); return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]; };

// ------------------------------------------------------------------ drawing
function pathPolys(ctx, cam, list) {
  ctx.beginPath();
  for (const poly of list) for (const ring of poly) {
    let prev = null;
    ring.forEach(([lo, la], i) => {
      // avoid long horizontal smears across the antimeridian
      if (prev && Math.abs(lo - prev) > 180) { const [x, y] = cam.p(lo, la); ctx.moveTo(x, y); prev = lo; return; }
      const [x, y] = cam.p(lo, la); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); prev = lo;
    });
    ctx.closePath();
  }
}
export function ocean(ctx, cam) {
  const g = ctx.createRadialGradient(W / 2, cam.cy, 0, W / 2, cam.cy, H * 0.9);
  g.addColorStop(0, STYLE.oceanGlow); g.addColorStop(1, STYLE.ocean);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // lon/lat graticule every 15 degrees
  ctx.save(); ctx.strokeStyle = STYLE.grid; ctx.lineWidth = 2;
  for (let lo = -180; lo <= 180; lo += 15) { const [x] = cam.p(lo, 0); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let la = -75; la <= 75; la += 15) { const [, y] = cam.p(0, la); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
}
export function world(ctx, cam, { land = STYLE.land, border = STYLE.border, oceanToo = true } = {}) {
  if (oceanToo) ocean(ctx, cam);
  ctx.save(); ctx.lineJoin = 'round';
  for (const f of GEO.features) {
    pathPolys(ctx, cam, polys(f));
    ctx.fillStyle = land; ctx.fill();
    ctx.strokeStyle = border; ctx.lineWidth = Math.max(1, Math.min(3, cam.zoom * 0.35)); ctx.stroke();
  }
  ctx.restore();
}
// One country, with optional glow and a fill that grows in (k 0..1, scale about its centre).
export function country(ctx, cam, name, { fill = STYLE.accent, stroke = '#FFFFFF', width = 4, glow = 30, k = 1, alpha = 1, minLon, maxLon } = {}) {
  if (k <= 0 || alpha <= 0) return;
  let list = polys(feature(name));
  if (minLon != null || maxLon != null) list = list.filter((p) => p[0].some(([lo]) => lo >= (minLon ?? -180) && lo <= (maxLon ?? 180)));
  const [clo, cla] = center(name, { minLon, maxLon }); const [cx, cy] = cam.p(clo, cla);
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy);
  pathPolys(ctx, cam, list);
  ctx.shadowColor = fill; ctx.shadowBlur = glow; ctx.fillStyle = fill; ctx.fill();
  ctx.shadowBlur = 0; ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke();
  ctx.restore();
}
// A country drawn at its TRUE size centred on another lon/lat (fixes the Mercator size illusion).
// Each vertex is turned into km east/north of the country's centre, then laid out again around the target.
export function trueSize(ctx, cam, name, [tlo, tla], { fill = 'rgba(255,214,10,0.55)', stroke = STYLE.gold, width = 4, k = 1, rot = 0, minLon, maxLon } = {}) {
  if (k <= 0) return;
  let list = polys(feature(name));
  if (minLon != null || maxLon != null) list = list.filter((p) => p[0].some(([lo]) => lo >= (minLon ?? -180) && lo <= (maxLon ?? 180)));
  const [clo, cla] = center(name, { minLon, maxLon });
  const R = 6371, cr = Math.cos(rot), sr = Math.sin(rot);
  const moved = list.map((poly) => poly.map((ring) => ring.map(([lo, la]) => {
    let e = (lo - clo) * D * R * Math.cos(la * D), n = (la - cla) * D * R;
    [e, n] = [e * cr - n * sr, e * sr + n * cr];
    e *= k; n *= k;
    const nla = tla + n / R / D; return [tlo + e / (R * Math.cos(nla * D)) / D, nla];
  })));
  ctx.save(); pathPolys(ctx, cam, moved);
  ctx.fillStyle = fill; ctx.fill(); ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke();
  ctx.restore();
}
// Pulsing city marker; label drawn to the right (or left with { left: true }).
export function city(ctx, cam, lon, lat, label, t, t0 = 0, { color = STYLE.gold, size = 16, font = '800 44px UI', left = false } = {}) {
  if (t < t0) return;
  const [x, y] = cam.p(lon, lat); const a = Math.min(1, (t - t0) / 0.25);
  const ph = ((t - t0) % 1.2) / 1.2;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.globalAlpha *= 1 - ph;
  ctx.beginPath(); ctx.arc(x, y, size + ph * size * 3, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = a; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.stroke();
  if (label) {
    ctx.font = font; ctx.textAlign = left ? 'right' : 'left'; ctx.lineJoin = 'round';
    ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(label, x + (left ? -1 : 1) * (size + 16), y + 15);
    ctx.fillStyle = STYLE.ink; ctx.fillText(label, x + (left ? -1 : 1) * (size + 16), y + 15);
  }
  ctx.restore();
}
// Great-circle path ("en línea recta" sobre el globo) drawn up to progress p (0..1).
export function greatCircle(a, b, n = 160) {
  const v = ([lo, la]) => [Math.cos(la * D) * Math.cos(lo * D), Math.cos(la * D) * Math.sin(lo * D), Math.sin(la * D)];
  const A = v(a), B = v(b); const w = Math.acos(Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])));
  const out = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n, s1 = Math.sin((1 - f) * w) / Math.sin(w), s2 = Math.sin(f * w) / Math.sin(w);
    const x = s1 * A[0] + s2 * B[0], y = s1 * A[1] + s2 * B[1], z = s1 * A[2] + s2 * B[2];
    out.push([Math.atan2(y, x) / D, Math.atan2(z, Math.hypot(x, y)) / D]);
  }
  return out;
}
export function route(ctx, cam, a, b, p, { color = STYLE.gold, width = 8, dash = false, points } = {}) {
  if (p <= 0) return;
  const pts = points || greatCircle(a, b); const m = Math.max(1, Math.floor(pts.length * Math.min(1, p)));
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash([width * 2.5, width * 2]);
  ctx.shadowColor = color; ctx.shadowBlur = 18;
  ctx.beginPath();
  for (let i = 0; i < m; i++) { const [x, y] = cam.p(...pts[i]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  const [hx, hy] = cam.p(...pts[m - 1]); ctx.shadowBlur = 0; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(hx, hy, width * 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// Label centred on a country (Spanish name by default).
export function label(ctx, cam, name, { text, font = '400 64px Display', color = STYLE.ink, dy = 0, alpha = 1, minLon, maxLon } = {}) {
  if (alpha <= 0) return;
  const [x, y] = cam.p(...center(name, { minLon, maxLon }));
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = font; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(text || ES[name] || name.toUpperCase(), x, y + dy);
  ctx.fillStyle = color; ctx.fillText(text || ES[name] || name.toUpperCase(), x, y + dy);
  ctx.restore();
}

// Real surface area in km² (spherical polygon area). Use it to CHECK every size claim before writing the script
// ("¿cuántos países caben…?"): the drawing must match the numbers.
export function areaKm2(name, { minLon, maxLon } = {}) {
  let list = polys(feature(name));
  if (minLon != null || maxLon != null) list = list.filter((p) => p[0].some(([lo]) => lo >= (minLon ?? -180) && lo <= (maxLon ?? 180)));
  const R = 6371.0088; let total = 0;
  for (const poly of list) poly.forEach((ring, ri) => {
    let a = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const [l1, p1] = ring[i], [l2, p2] = ring[i + 1];
      a += (l2 - l1) * D * (2 + Math.sin(p1 * D) + Math.sin(p2 * D));
    }
    a = Math.abs(a * R * R / 2); total += ri === 0 ? a : -a;
  });
  return total;
}


// ------------------------------------------------------------------ v5: 3D relief map (toy/diorama look)
export const PASTEL = ['#F2C14E', '#E9A6C9', '#9CCB7C', '#F08A4B', '#C9B6E4', '#F5E6A8', '#8FC7D9', '#E8D4A8'];
const shade = (hex, f) => '#' + [1, 3, 5].map((i) => Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * f))).toString(16).padStart(2, '0')).join('');
const hashName = (n) => { let h = 7; for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const BB = new Map();
function fbbox(f) {
  if (BB.has(f)) return BB.get(f);
  let b = [180, 90, -180, -90];
  for (const poly of polys(f)) for (const [lo, la] of poly[0]) b = [Math.min(b[0], lo), Math.min(b[1], la), Math.max(b[2], lo), Math.max(b[3], la)];
  BB.set(f, b); return b;
}
const onScreen = (cam, b) => { const [x1, y1] = cam.p(b[0], b[3]), [x2, y2] = cam.p(b[2], b[1]); return x2 > -200 && x1 < W + 200 && y2 > -200 && y1 < H + 200; };
// colors: { 'Colombia': '#F2C14E' } overrides; lift: { 'Colombia': 0..1 } raises a country (it "pops out" of the map)
export function relief(ctx, cam, { depth = 34, colors = {}, lift = {}, sea = '#14254A' } = {}) {
  const g = ctx.createRadialGradient(W / 2, cam.cy, 0, W / 2, cam.cy, H); g.addColorStop(0, '#1D3366'); g.addColorStop(1, sea);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const vis = GEO.features.filter((f) => onScreen(cam, fbbox(f)));
  // draw north to south so nearer (southern, lower on screen) blocks overlap the ones behind them
  vis.sort((a, b) => fbbox(b)[3] - fbbox(a)[3]);
  const lifted = vis.filter((f) => lift[f.properties.name] > 0), flat = vis.filter((f) => !(lift[f.properties.name] > 0));
  for (const f of [...flat, ...lifted]) {
    const name = f.properties.name, top = colors[name] || PASTEL[hashName(name) % PASTEL.length];
    const up = (lift[name] || 0) * depth * 2.2, d = depth;
    // tiny islands: no walls (they turn into slivers); polygons under ~3 px are skipped
    const size = (poly) => { let a = [1e9, 1e9, -1e9, -1e9]; for (const [lo, la] of poly[0]) { const [x, y] = cam.p(lo, la); a = [Math.min(a[0], x), Math.min(a[1], y), Math.max(a[2], x), Math.max(a[3], y)]; } return Math.max(a[2] - a[0], a[3] - a[1]); };
    const sized = polys(f).map((poly) => [poly, size(poly)]).filter(([, z]) => z > 3);
    const list = sized.map(([p]) => p), big = sized.filter(([, z]) => z > depth * 1.6).map(([p]) => p);
    if (!list.length) continue;
    ctx.save(); ctx.lineJoin = 'round';
    // side walls: the same outline stacked downwards in a darker tone
    if (big.length) for (let z = d; z > 0; z -= 3) {
      ctx.save(); ctx.translate(0, z - up); pathPolys(ctx, cam, big); ctx.fillStyle = shade(top, 0.62 + 0.18 * (1 - z / d)); ctx.fill(); ctx.restore();
    }
    ctx.translate(0, -up); pathPolys(ctx, cam, list);
    if (up > 0) { ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 20; }
    ctx.fillStyle = top; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = shade(top, 0.8); ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
}
// Little snow-capped mountains standing on the map. pts: [[lon, lat], ...]
export function mountains(ctx, cam, pts, { size = 34, k = 1, up = 0 } = {}) {
  if (k <= 0) return;
  for (const [lo, la] of [...pts].sort((a, b) => b[1] - a[1])) {
    const [x, y0] = cam.p(lo, la), y = y0 - up, s = size * k;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y + 4, s * 0.9, s * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#C98A4B'; ctx.beginPath(); ctx.moveTo(x - s, y); ctx.lineTo(x, y - s * 1.3); ctx.lineTo(x + s, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#A86E36'; ctx.beginPath(); ctx.moveTo(x, y - s * 1.3); ctx.lineTo(x + s, y); ctx.lineTo(x + s * 0.2, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(x - s * 0.34, y - s * 0.86); ctx.lineTo(x, y - s * 1.3); ctx.lineTo(x + s * 0.34, y - s * 0.86); ctx.lineTo(x + s * 0.1, y - s * 0.95); ctx.lineTo(x - s * 0.1, y - s * 0.82); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
// Waving flag on a pole. stripes: [[color, weight], ...] top to bottom, e.g. Colombia [['#FCD116',2],['#003893',1],['#CE1126',1]]
export function flag(ctx, cam, lon, lat, stripes, t, { h = 260, w = 230, up = 0, k = 1 } = {}) {
  if (k <= 0) return;
  const [x, y0] = cam.p(lon, lat), y = y0 - up, ph = h * k, top = y - ph;
  ctx.save();
  ctx.fillStyle = '#C9CDD4'; ctx.fillRect(x - 5, top, 10, ph); ctx.fillStyle = '#E8EBF0'; ctx.beginPath(); ctx.arc(x, top, 9, 0, Math.PI * 2); ctx.fill();
  const fw = w * k, fh = fw * 0.62, tot = stripes.reduce((a, s) => a + s[1], 0);
  const N = 24;
  let acc = 0;
  for (const [col, wt] of stripes) {
    const y1 = acc / tot * fh, y2 = (acc + wt) / tot * fh; acc += wt;
    ctx.fillStyle = col; ctx.beginPath();
    for (let i = 0; i <= N; i++) { const u = i / N, wv = Math.sin(u * 5 - t * 6) * 10 * u; ctx.lineTo(x + 6 + u * fw, top + 4 + y1 + wv); }
    for (let i = N; i >= 0; i--) { const u = i / N, wv = Math.sin(u * 5 - t * 6) * 10 * u; ctx.lineTo(x + 6 + u * fw, top + 4 + y2 + wv); }
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
export const FLAGS = {
  Colombia: [['#FCD116', 2], ['#003893', 1], ['#CE1126', 1]], Mexico: [['#006847', 1], ['#FFFFFF', 1], ['#CE1126', 1]],
  Peru: [['#D91023', 1], ['#FFFFFF', 1], ['#D91023', 1]], Argentina: [['#74ACDF', 1], ['#FFFFFF', 1], ['#74ACDF', 1]],
  Venezuela: [['#FFCC00', 1], ['#00247D', 1], ['#CF142B', 1]], Ecuador: [['#FFDD00', 2], ['#034EA2', 1], ['#ED1C24', 1]],
  Chile: [['#FFFFFF', 1], ['#D52B1E', 1]], Bolivia: [['#D52B1E', 1], ['#F9E300', 1], ['#007934', 1]],
  Panama: [['#FFFFFF', 1], ['#DA121A', 1]], Spain: [['#AA151B', 1], ['#F1BF00', 2], ['#AA151B', 1]],
};
