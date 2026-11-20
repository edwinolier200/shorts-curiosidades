import * as M from './lib/motion.js';
import * as MAP from './lib/maps.js';
const { W, H, E, prog, lerp, spring, SPRING, font, text } = M;
const logk = (a, b, p) => Math.exp(lerp(Math.log(a), Math.log(b), p));
const EU = [['Spain', [-74.6, 7.4], {}], ['France', [-71.6, 1.6], { minLon: -10, maxLon: 20 }]];
M.film({
  fonts: [font(100, 400, 'Display'), font(100, 800, 'UI')],
  samples: 2,
  async init() { await MAP.load(); },
  draw(ctx, u, t) {
    const p = E.inOutCubic(prog(t, 0.3, 3.0));
    const lon = lerp(-40, -73.5, p), lat = lerp(15, 4.2, p);
    const zoom = logk(0.9, MAP.fit(MAP.bbox('Colombia'), 0.8) * (t > 9.5 ? logk(1, 0.18, E.inOutCubic(prog(t, 9.5, 11))) : 1), p);
    const cam = MAP.camera(lon, lat, zoom);
    MAP.world(ctx, cam);
    MAP.country(ctx, cam, 'Colombia', { k: E.outBack(prog(t, 3, 3.6)), fill: 'rgba(255,59,48,0.85)' });
    if (t < 9.4) EU.forEach(([n, pos, o], i) => MAP.trueSize(ctx, cam, n, pos, { ...o, k: E.outBack(prog(t, 5.6 + i * 0.6, 6.1 + i * 0.6)) }));
    if (t < 9.4) EU.forEach(([n, pos, o], i) => { const a = prog(t, 6 + i * 0.6, 6.3 + i * 0.6); if (a > 0) { const [x, y] = cam.p(...pos); ctx.save(); ctx.globalAlpha = a; ctx.font = font(40, 800, 'UI'); ctx.textAlign = 'center'; ctx.lineWidth = 8; ctx.strokeStyle = '#000'; ctx.strokeText(MAP.ES[n], x, y + 12); ctx.fillStyle = '#fff'; ctx.fillText(MAP.ES[n], x, y + 12); ctx.restore(); } });
    MAP.label(ctx, cam, 'Colombia', { alpha: prog(t, 3.3, 3.8) * (1 - prog(t, 5.4, 5.7)), font: font(110, 400, 'Display') });
    MAP.city(ctx, cam, -74.07, 4.71, 'BOGOTÁ', t, 9.4);
    MAP.route(ctx, cam, [-74.07, 4.71], [-3.7, 40.4], E.inOutSine(prog(t, 9.8, 11.6)));
    MAP.city(ctx, cam, -3.7, 40.4, 'MADRID', t, 11.4, { left: true });
    const k = spring(t - 0.05, SPRING.bouncy);
    text(ctx, t < 5.5 ? '¿CUÁNTOS PAÍSES DE EUROPA' : t < 9.4 ? 'ESPAÑA + FRANCIA' : 'EN LÍNEA RECTA', W / 2, 1420, font(78, 400, 'Display'), '#fff', 'center');
    text(ctx, t < 5.5 ? 'CABEN EN COLOMBIA?' : t < 9.4 ? 'CABEN EN COLOMBIA' : 'DESDE BOGOTÁ', W / 2, 1510, font(78, 400, 'Display'), '#FFD60A', 'center');
  },
});
