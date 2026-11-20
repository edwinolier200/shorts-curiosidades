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
export function camera(lon, lat, zoom, { cx = W / 2, cy = H * 0.42 } = {}) {
  const [mx, my] = merc(lon, lat); const s = W * zoom;
  return { mx, my, s, cx, cy, zoom, p: (lo, la) => { const [x, y] = merc(lo, la); return [cx + (x - mx) * s, cy + (y - my) * s]; } };
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
