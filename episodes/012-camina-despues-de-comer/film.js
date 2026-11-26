// 012 · Camina 10 minutos después de comer — first "🧪 Prueba en casa (Don Tito)" episode.
// Format (PLAYBOOK → Formato PRUEBA EN CASA): personal question → Don Tito's rule → what happens → the evidence → the test you
// can do at home → how simple it is → safety note → share. Dark-blue textured background, one big drawn object per sentence,
// karaoke captions at the top. Don Tito's mouth follows the voice (mouth.json from tools/mouth.py).
// v2 (2026-11-26): clearer study sentence, easier words (no 'compruébalo/mídete'), legend that matches the voice,
// 'valores de ejemplo', and a real ending: next-test teaser + closing card + musical sting (no more silent fade).
import * as M from './lib/motion.js';
import * as K from './lib/props2d.js';
import * as O from './lib/organs2d.js';
import * as UI from './lib/ui.js';
const { W, H, E, prog, lerp, clamp, spring, SPRING, font, rrect, hash01 } = M;

const S = [], T = {};
let CAP = { captions: [] }, MOUTH = { fps: 60, v: [] };
const B = (s) => s / 0.5;
const HITS = [];
const hitList = () => [
  [B(0.1), 'tito', 'pop', { pitch: 'C5' }], [B(T.almorzar - 0.1), 'plate', 'thud', { gain: 0.6 }], [B(T.sientas), 'chair', 'tok'],
  [B(S[1]), 'rule', 'whoosh', { len: 0.4 }], [B(T.barriga), 'card', 'pop', { pitch: 'E5' }], [B(T.movimiento), 'card', 'pop', { pitch: 'G5' }],
  [B(S[2]), 'meter', 'whoosh', { len: 0.35 }], [B(T.normal), 'check', 'blip', { pitch: 'C6' }],
  [B(S[3]), 'sitting', 'whoosh', { len: 0.35 }], [B(T.tarda), 'warn', 'thud'],
  [B(S[4]), 'walk', 'whoosh', { len: 0.4 }], [B(T.gasolina), 'fuel', 'coins', { gain: 0.5 }],
  [B(S[5]), 'study', 'whoosh', { len: 0.4 }], [B(T.doce), '-12%', 'impact', { gain: 0.7 }],
  [B(T.veintidos), '-22%', 'impact'],
  [B(S[7]), 'test', 'whoosh', { len: 0.4 }], [B(T.horas), 'clock', 'tick'],
  [B(S[8]), 'block', 'whoosh', { len: 0.4 }], [B(T.diez2), '10 min', 'pop', { pitch: 'E6' }],
  [B(S[9]), 'careful', 'sub', { gain: 0.6 }],
  [B(S[10]), 'share', 'whoosh', { len: 0.4 }], [B(T.tio), 'share', 'pop', { pitch: 'G5' }],
  [B(S[11]), 'next test', 'whoosh', { len: 0.4 }], [B(T.proxima), 'next card', 'pop', { pitch: 'E5' }], [B(T.pie), 'one foot', 'tick'],
];
const GOLD = '#FFC94A';
const mouthAt = (t) => { const i = Math.floor(t * MOUTH.fps); return MOUTH.v[i] || 0; };
const blinkAt = (t) => ((t % 3.3) > 3.18 ? 1 : 0);
// appear with a spring at a, leave by b (0..1)
const show = (t, a, b = 1e9, cfg = SPRING.snappy) => (t < a - 0.05 || t > b + 0.3 ? 0 : Math.max(0, Math.min(1, spring(t - a + 0.05, cfg)) * (1 - E.inCubic(prog(t, b - 0.05, b + 0.25)))));
const pop = (ctx, k, x, y, fn) => { if (k <= 0.001) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.globalAlpha *= Math.min(1, k * 1.4); fn(); ctx.restore(); };

// ------------------------------------------------------------------ karaoke captions at the top (phrase dim, current word white, key word in a box)
function karaoke(ctx, t, y = 330) {
  const c = CAP.captions.find((c) => t >= c.t - 0.03 && t < c.end); if (!c) return;
  const words = c.words.map((w) => w.o || w.w); let sz = 66;
  const wd = (w, k) => { ctx.font = font(sz, k ? 900 : 800, k ? 'Heavy' : 'UI'); return ctx.measureText(w).width; };
  const total = () => words.reduce((a, w, i) => a + wd(w, c.words[i].k) + (i ? sz * 0.3 : 0), 0);
  while (total() > W - 140 && sz > 40) sz -= 2;
  let x = W / 2 - total() / 2;
  const k = Math.min(1, spring(t - c.t + 0.03, { stiffness: 600, damping: 28 }));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 12); ctx.textAlign = 'left'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 14;
  c.words.forEach((w, i) => {
    if (i) x += sz * 0.3; const on = t >= w.t - 0.03, ww = wd(words[i], w.k);
    if (w.k && on) { ctx.save(); ctx.shadowBlur = 0; ctx.fillStyle = '#2F6FE0'; rrect(ctx, x - 10, y - sz * 0.86, ww + 20, sz * 1.12, 10); ctx.fill(); ctx.restore(); }
    ctx.font = font(sz, w.k ? 900 : 800, w.k ? 'Heavy' : 'UI'); ctx.fillStyle = on ? '#FFFFFF' : 'rgba(255,255,255,0.55)'; ctx.fillText(words[i], x, y); x += ww;
  });
  ctx.restore();
}
function card(ctx, text, x, y, size, k, bg = GOLD, fg = '#14121C', rot = -0.03) {
  pop(ctx, k, x, y, () => { ctx.rotate(rot); ctx.font = font(size, 900, 'Heavy'); const w = ctx.measureText(text).width, p = size * 0.35;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; rrect(ctx, -w / 2 - p + 8, -size * 0.75 + 10, w + p * 2, size * 1.35, 18); ctx.fill();
    ctx.fillStyle = bg; rrect(ctx, -w / 2 - p, -size * 0.75, w + p * 2, size * 1.35, 18); ctx.fill(); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.fillText(text, 0, size * 0.32); });
}
function glass(ctx, x, y, w, h, k) { ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = 'rgba(8,16,36,0.78)'; rrect(ctx, x, y, w, h, 30); ctx.fill(); ctx.strokeStyle = 'rgba(255,201,74,0.6)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
function moon(ctx, x, y, r) { ctx.save(); ctx.fillStyle = '#FFE9A8'; ctx.shadowColor = '#FFE9A8'; ctx.shadowBlur = 40; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#16284F'; ctx.beginPath(); ctx.arc(x + r * 0.45, y - r * 0.25, r * 0.85, 0, 6.283); ctx.fill(); ctx.restore(); }

M.film({
  fonts: [font(100, 900, 'Heavy'), font(100, 800, 'UI')],
  hits: HITS, samples: 2,
  async init() {
    CAP = await fetch('captions.json').then((r) => r.json());
    const tm = await fetch('timing.json').then((r) => r.json()); S.push(...tm.S); Object.assign(T, tm.T);
    MOUTH = await fetch('mouth.json').then((r) => r.json()).catch(() => MOUTH);
    HITS.push(...hitList());
  },
  draw(ctx, u, t) {
    // background: textured blue, slow drift + gentle push per scene
    const si = S.reduce((a, s, i) => (t >= s ? i : a), 0), zoom = 1 + 0.035 * prog(t, S[si], S[si + 1] ?? T.end);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(zoom, zoom); ctx.translate(-W / 2 + Math.sin(t * 0.2) * 20, -H / 2);
    K.texturedBg(ctx, W, H, si === 6 ? ['#1C2C5A', '#070D1F'] : si === 9 ? ['#4A2430', '#170A10'] : ['#22406E', '#0C1A33']);
    ctx.restore();
    const mo = mouthAt(t), bl = blinkAt(t);

    // 1 · ¿qué haces después de almorzar? (Tito + plate + chair + sugar rising)
    const k1 = show(t, 0.05, S[1]);
    pop(ctx, show(t, T.almorzar - 0.15, S[1]), 700, 760, () => K.plate(ctx, 0, 0, 560));
    pop(ctx, show(t, T.sientas - 0.05, S[1]), 840, 1180, () => K.chair(ctx, 0, 0, 330));
    if (t > T.azucar - 0.2 && t < S[1] + 0.2) for (let i = 0; i < 9; i++) { const p = clamp((t - T.azucar + 0.2 - i * 0.08) / 1.4); if (p <= 0) continue;
      ctx.save(); ctx.globalAlpha = (1 - p) * k1; K.sugarCube(ctx, 600 + (hash01(i, 2) - 0.5) * 300, 700 - p * 300, 44, p * 3 + i); ctx.restore(); }
    pop(ctx, k1, 330, 1560, () => K.tito(ctx, 0, 0, 760, { mouth: mo, blink: bl, look: [0.6, -0.4] }));

    // 2 · la regla de Don Tito
    const k2 = show(t, S[1], S[2]);
    pop(ctx, k2, 540, 1500, () => K.tito(ctx, 0, 0, 1000, { mouth: mo, blink: bl, mood: 'smile' }));
    card(ctx, 'BARRIGA LLENA,', 540, 620, 84, show(t, T.barriga, S[2]), '#FFFFFF');
    card(ctx, 'PIES EN MOVIMIENTO', 540, 790, 84, show(t, T.movimiento, S[2]), GOLD, '#14121C', 0.02);

    // 3 · al comer el azúcar sube (normal) → 4 · sentado sube más y tarda
    const k3 = show(t, S[2], S[4]);
    if (k3 > 0) {
      const sat = t >= S[3], v = sat ? Math.round(lerp(130, 165, E.outCubic(prog(t, S[3], T.tarda)))) : Math.round(lerp(90, 130, E.outCubic(prog(t, S[2], T.sube + 0.6))));
      pop(ctx, k3, 300, 760, () => K.meter(ctx, 0, 0, 440, { value: String(v), unit: 'mg/dL', state: sat ? 'warn' : 'ok', strip: false }));
      pop(ctx, show(t, S[3], S[4]), 790, 760, () => K.chair(ctx, 0, 60, 300));
      pop(ctx, show(t, T.normal - 0.1, S[3]), 790, 700, () => K.check(ctx, 0, 0, 90));
      pop(ctx, k3, 540, 1240, () => K.chart(ctx, -450, -190, 900, 380, { good: prog(t, S[2] + 0.2, S[3]), bad: prog(t, S[3] + 0.1, T.tarda + 0.8) }));
      if (t > S[2] + 0.5) { ctx.save(); ctx.globalAlpha = k3; ctx.font = font(34, 800, 'UI'); ctx.textAlign = 'left'; ctx.fillStyle = '#3BE37A'; ctx.fillText(t > S[3] ? '● si te mueves' : '● después de comer', 110, 1500); if (t > S[3]) { ctx.fillStyle = '#FF5A66'; ctx.fillText('● si te quedas sentado', 470, 1500); }
        ctx.font = font(28, 800, 'UI'); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.textAlign = 'center'; ctx.fillText('valores de ejemplo', 300, 1010); ctx.restore(); }
    }

    // 5 · al caminar, los músculos usan el azúcar como gasolina
    const k5 = show(t, S[4], S[5]);
    if (k5 > 0) {
      const ph = (t - S[4]) * 1.1, glow = clamp((t - T.musculos) * 2) * (0.6 + 0.4 * Math.sin(t * 8));
      ctx.save(); ctx.globalAlpha = k5; ctx.fillStyle = '#3A4F7A'; ctx.fillRect(0, 1600, W, 12); for (let i = 0; i < 8; i++) { ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(((i * 180 - (t - S[4]) * 260) % (W + 180) + W + 180) % (W + 180) - 90, 1640, 90, 8); } ctx.restore();
      pop(ctx, k5, 540, 1290, () => K.walker(ctx, 0, 0, 880, ph, { glow }));
      for (let i = 0; i < 10; i++) { const p = ((t - S[4]) * 0.7 + hash01(i, 7)) % 1; ctx.save(); ctx.globalAlpha = k5 * (1 - p) * clamp((t - S[4]) * 2);
        K.sugarCube(ctx, 540 + (hash01(i, 3) - 0.5) * 700 * (1 - p), 600 + p * 820, 46 * (1 - p * 0.6), p * 4 + i); ctx.restore(); }
      card(ctx, 'GASOLINA PARA TUS MÚSCULOS', 540, 560, 58, show(t, T.gasolina - 0.1, S[5]), GOLD);
    }

    // 6 · el estudio (−12 %) → 7 · después de la cena (−22 %)
    const k6 = show(t, S[5], S[7]);
    if (k6 > 0) {
      glass(ctx, 70, 470, W - 140, 1040, k6);
      ctx.save(); ctx.globalAlpha = k6; ctx.textAlign = 'center'; ctx.font = font(34, 800, 'UI'); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText('ESTUDIO · Diabetologia, 2016', W / 2, 550);
      ctx.fillText('adultos con diabetes tipo 2', W / 2, 596); ctx.restore();
      const dinner = t >= S[6];
      const kb = clamp((t - T.diez + 0.2) * 1.5);
      ctx.save(); ctx.globalAlpha = k6;
      K.bars(ctx, 140, 720, 800, [[dinner ? '1 caminata al día · cena' : '1 caminata al día (30 min)', 1, '#7C8AA8', ''],
        [dinner ? '10 min tras la cena' : '10 min tras cada comida', dinner ? 0.78 : 0.88, '#3BE37A', '']], kb);
      ctx.restore();
      const big = dinner ? '−22 %' : '−12 %', kk = dinner ? show(t, T.veintidos - 0.1, S[7], SPRING.bouncy) : show(t, T.doce - 0.1, S[6], SPRING.bouncy);
      pop(ctx, kk, 540, 1260, () => { ctx.font = font(190, 900, 'Heavy'); ctx.textAlign = 'center'; const g = ctx.createLinearGradient(0, -170, 0, 0); g.addColorStop(0, '#B7FFC8'); g.addColorStop(1, '#2EC866');
        ctx.fillStyle = g; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; ctx.fillText(big, 0, 0); ctx.shadowBlur = 0; ctx.font = font(40, 800, 'UI'); ctx.fillStyle = '#fff'; ctx.fillText('azúcar después de comer', 0, 70); });
      if (dinner) pop(ctx, show(t, T.cena - 0.1, S[7]), 880, 640, () => moon(ctx, 0, 0, 60));
    }

    // 8 · compruébalo: 2 horas después, un día sentado y otro caminando
    const k8 = show(t, S[7], S[8]);
    if (k8 > 0) {
      pop(ctx, show(t, S[7], S[8]), 540, 640, () => K.clock(ctx, 0, 0, 150, { sweep: clamp((t - T.horas + 0.2) / 1.2) * (2 / 12) }));
      pop(ctx, show(t, T.sentado2 - 0.1, S[8]), 290, 1080, () => { K.meter(ctx, 0, 0, 380, { value: '¿?', unit: 'mg/dL', state: 'warn', strip: false }); });
      pop(ctx, show(t, T.caminando - 0.1, S[8]), 790, 1080, () => { K.meter(ctx, 0, 0, 380, { value: '¿?', unit: 'mg/dL', state: 'ok', strip: false }); });
      ctx.save(); ctx.globalAlpha = k8; ctx.textAlign = 'center'; ctx.font = font(40, 900, 'Heavy');
      if (t > T.sentado2 - 0.1) { ctx.fillStyle = '#FF7A84'; ctx.fillText('DÍA 1 · SENTADO', 290, 1330); }
      if (t > T.caminando - 0.1) { ctx.fillStyle = '#6FF09A'; ctx.fillText('DÍA 2 · CAMINANDO', 790, 1330); }
      if (t > T.caminando + 0.3) { glass(ctx, 110, 1400, W - 220, 150, 1); ctx.font = font(34, 800, 'UI'); ctx.fillStyle = '#fff'; ctx.fillText('Referencia sin diabetes (ADA):', W / 2, 1460); ctx.fillStyle = GOLD; ctx.font = font(44, 900, 'Heavy'); ctx.fillText('menos de 140 mg/dL a las 2 horas', W / 2, 1516); }
      ctx.restore();
    }

    // 9 · diez minutos, sin gimnasio, una vuelta a la cuadra
    const k9 = show(t, S[8], S[9]);
    if (k9 > 0) {
      pop(ctx, k9, 540, 1050, () => K.block(ctx, 0, 0, 640, clamp((t - S[8]) / (S[9] - S[8]))));
      card(ctx, '10 MINUTOS', 540, 600, 96, show(t, T.diez2 - 0.1, S[9], SPRING.bouncy), GOLD);
      card(ctx, 'SIN GIMNASIO', 540, 1490, 58, show(t, T.gimnasio - 0.1, S[9]), '#FFFFFF', '#14121C', 0.03);
    }

    // 10 · cuidado: corazón → médico
    const k10 = show(t, S[9], S[10]);
    if (k10 > 0) {
      pop(ctx, k10, 540, 1520, () => K.tito(ctx, 0, 0, 900, { mouth: mo, blink: bl, mood: 'serious' }));
      pop(ctx, show(t, T.corazon - 0.1, S[10]), 790, 720, () => O.heart(ctx, 0, 0, 300, { beat: 0 }));
      card(ctx, 'PREGÚNTALE A TU MÉDICO', 540, 1000, 54, show(t, T.medico - 0.2, S[10]), '#E63B2E', '#fff');
    }

    // 11 · compártelo con el tío que se duerme después del almuerzo
    const k11 = show(t, S[10], S[11]);
    if (k11 > 0) {
      pop(ctx, k11, 540, 1540, () => K.tito(ctx, 0, 0, 950, { mouth: mo, blink: bl, mood: 'smile', look: [0, -0.3] }));
      card(ctx, 'MÁNDASELO A TU TÍO', 540, 680, 74, show(t, T.tio - 0.1), GOLD);
      if (t > T.almuerzo) { ctx.save(); ctx.globalAlpha = clamp((t - T.almuerzo) * 3); [[0, 0, 1], [40, -50, 0.75], [75, -95, 0.55]].forEach(([dx, dy, s]) => {
        ctx.font = font(80 * s, 900, 'Heavy'); ctx.fillStyle = '#9CCBFF'; ctx.fillText('Z', 820 + dx, 1040 + dy - (t - T.almuerzo) * 20); }); ctx.restore(); }
    }

    // 12 · outro: next test teaser (one foot + 10 s counter) → closing card with the channel and the medical note
    const k12 = show(t, S[11], T.end - 1.3);
    if (k12 > 0) {
      const tc = clamp((t - T.pie + 0.2) / 2.2);
      pop(ctx, k12, 540, 1180, () => K.walker(ctx, 0, 0, 820, 0, { pose: 'onefoot', wobble: Math.sin(t * 3) }));
      card(ctx, 'PRÓXIMA PRUEBA', 540, 600, 80, show(t, T.proxima - 0.15, T.end - 1.3), GOLD);
      pop(ctx, show(t, T.pie - 0.2, T.end - 1.3), 860, 860, () => { K.clock(ctx, 0, 0, 110, { sweep: tc * (10 / 60) }); ctx.font = font(54, 900, 'Heavy'); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(`${Math.round(tc * 10)} s`, 0, 175); });
      pop(ctx, show(t, S[11], T.end - 1.3), 210, 1560, () => K.tito(ctx, 0, 0, 520, { mouth: mo, blink: bl, mood: 'smile', look: [0.6, -0.3] }));
    }
    const kEnd = show(t, T.end - 1.4);
    if (kEnd > 0) { ctx.save(); ctx.globalAlpha = kEnd; ctx.fillStyle = 'rgba(8,14,32,0.9)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      pop(ctx, kEnd, 540, 900, () => { K.tito(ctx, 0, 120, 560, { mouth: 0, blink: bl, mood: 'smile' }); ctx.font = font(96, 900, 'Heavy'); ctx.textAlign = 'center'; ctx.fillStyle = GOLD; ctx.fillText('@EdinTops', 0, -330);
        ctx.font = font(48, 900, 'Heavy'); ctx.fillStyle = '#fff'; ctx.fillText('PRUEBA EN CASA CON DON TITO', 0, -250); });
      ctx.save(); ctx.globalAlpha = kEnd * 0.9; ctx.font = font(32, 800, 'UI'); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('Esto no reemplaza la consulta con tu médico.', W / 2, 1420); ctx.restore(); }
    if (t < T.end - 1.4) karaoke(ctx, t);
    if (t < T.end - 1.4) UI.watermark(ctx, undefined, { y: 470 });
  },
});
