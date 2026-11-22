// Demo of the v5 look: relief map + stage with clay objects + top captions + day badge + stat card + stamp.
import * as M from './lib/motion.js';
import * as MAP from './lib/maps.js';
import * as UI from './lib/ui.js';
const { W, H, E, prog, lerp, kf } = M;
let CAP = { captions: [] }, IMG = {};
const logk = (a, b, p) => Math.exp(lerp(Math.log(a), Math.log(b), p));
const ANDES = [[-75.5, 6.5], [-74.8, 5.0], [-76.2, 4.0], [-73.6, 7.2], [-75.9, 2.2], [-73.8, 10.8]];
function photoOnStage(ctx, key, t, t0, t1) {
  UI.stage(ctx);
  const im = IMG[key]; if (!im) return;
  const p = E.inOutSine(prog(t, t0, t1)), z = lerp(1.0, 1.12, p);
  const s = (W / im.width) * 1.08 * z, w = im.width * s, h = im.height * s;
  ctx.save(); ctx.globalAlpha = Math.min(1, (t - t0) / 0.2);
  ctx.drawImage(im, (W - w) / 2, H * 0.62 - h / 2, w, h); ctx.restore();
}
M.film({
  fonts: [M.font(100, 400, 'Display'), M.font(100, 800, 'UI'), M.font(100, 600, 'UI')],
  images: { taza: 'assets/img/taza.png', canal: 'assets/img/canal.png' },
  samples: 2,
  async init() { await MAP.load(); CAP = await fetch('captions.json').then((r) => r.json()); },
  draw(ctx, u, t, images) {
    IMG = images;
    if (t < 5) {
      const p = E.inOutCubic(prog(t, 0, 2.2));
      const cam = MAP.camera(lerp(-62, -73.5, p), lerp(-8, 5.2, p), logk(1.1, MAP.fit(MAP.bbox('Colombia'), 0.95), p), { tilt: 1, cy: H * 0.6 });
      const up = 40 * E.outBack(prog(t, 2.2, 2.8));
      MAP.relief(ctx, cam, { colors: { Colombia: '#F2C14E' }, lift: { Colombia: prog(t, 2.2, 2.8) } });
      MAP.mountains(ctx, cam, ANDES, { k: E.outBack(prog(t, 2.6, 3.1)), up: up * 1.9 });
      MAP.flag(ctx, cam, -72.4, 6.2, MAP.FLAGS.Colombia, t, { k: E.outBack(prog(t, 2.9, 3.4)), up: up * 1.9 });
      MAP.label(ctx, cam, 'Colombia', { dy: -up * 1.9 + 70, alpha: prog(t, 3.0, 3.3), font: M.font(60, 400, 'Display'), color: '#3A2A10' });
    } else if (t < 10) {
      photoOnStage(ctx, 'taza', t, 5, 10);
      UI.pill(ctx, 'PRECIO ↑', W / 2 + 200, 900, t, 8.9);
      UI.statCard(ctx, '8,50 $', 'tu cafecito… a precio de cóctel 🍹', t, 9.1, { y: 1250 });
    } else {
      photoOnStage(ctx, 'canal', t, 10, 15);
      UI.statCard(ctx, '5.000 M $', 'lo que gana el canal en un año 🚢', t, 11.0, { y: 1250, tEnd: 13.0 });
      UI.stamp(ctx, 'EN PARO', W / 2 + 150, 980, t, 13.2);
    }
    UI.dayBadge(ctx, 'SIN COLOMBIA', 'LUNES', t, 5.0, { tEnd: 10 });
    UI.dayBadge(ctx, 'SIN COLOMBIA', 'MARTES', t, 10.0);
    UI.captionsTop(ctx, CAP, t);
    UI.watermark(ctx);
  },
});
