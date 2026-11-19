// Thumbnails v2: render the two thumbnails from <episode>/publicar/thumb.json.
//   node tools/thumbs.cjs episodes/<slug>
// thumb.json fields (all text in CAPS works best, 2-5 words per line):
//   bg        image key in assets/img used as the full background (required)
//   hero      image key shown sharp inside the white-ringed circle (optional; defaults to bg)
//   big       the giant number or word, e.g. "46" (required)
//   unit      small word glued under/next to the big number, e.g. "ROJAS" (optional)
//   line1     first hook line, e.g. "EL JUGADOR MÁS"
//   mark      word painted in the yellow marker box, e.g. "EXPULSADO"
//   line2     optional third line
//   badge     red ribbon at the top, e.g. "RÉCORD MUNDIAL"
//   emoji     one emoji for the reaction bubble, e.g. "😱"
//   flag      optional country flag emoji for the corner, e.g. "🇨🇴"
// Old episodes without thumb.json keep using publicar/thumb.html.
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');

const ep = path.resolve(process.argv[2]);
const pub = path.join(ep, 'publicar');
const root = path.resolve(__dirname, '..');
const url = (p) => 'file://' + p;

function html(d) {
  const img = (k) => url(path.join(ep, 'assets/img', `${k}.png`));
  const bg = img(d.bg), hero = img(d.hero || d.bg);
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const lines = (size) => `
    ${d.line1 ? `<div class="l1" style="font-size:${size}px">${esc(d.line1)}</div>` : ''}
    ${d.mark ? `<div class="mark" style="font-size:${size * 1.12}px"><span>${esc(d.mark)}</span></div>` : ''}
    ${d.line2 ? `<div class="l1" style="font-size:${size * 0.9}px">${esc(d.line2)}</div>` : ''}`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:A;src:url(${url(path.join(root, 'fonts/display.woff2'))})}
@font-face{font-family:I;src:url(${url(path.join(root, 'fonts/ui.woff2'))});font-weight:800}
html,body{margin:0;background:#000}
.t{position:relative;overflow:hidden;background:#111}
.bg{position:absolute;inset:-40px;background:url(${bg}) center/cover;filter:blur(6px) saturate(1.5) contrast(1.2) brightness(.8)}
.grade{position:absolute;inset:0;background:
  radial-gradient(ellipse at 50% 40%,rgba(0,0,0,0) 30%,rgba(0,0,0,.75) 100%),
  linear-gradient(160deg,rgba(255,59,48,.45) 0%,rgba(255,59,48,0) 45%,rgba(0,0,0,0) 60%,rgba(0,0,0,.85) 100%)}
.rays{position:absolute;left:50%;top:var(--cy);width:2600px;height:2600px;margin:-1300px;opacity:.22;
  background:repeating-conic-gradient(from 0deg,#FFD60A 0deg 6deg,transparent 6deg 18deg);
  -webkit-mask:radial-gradient(circle,#000 0%,transparent 60%)}
.hero{position:absolute;left:50%;top:var(--cy);width:var(--hs);height:var(--hs);transform:translate(-50%,-50%);border-radius:50%;
  background:url(${hero}) center/cover;filter:saturate(1.3) contrast(1.15);
  box-shadow:0 0 0 18px #fff,0 0 0 30px #FF3B30,0 30px 80px rgba(0,0,0,.8)}
.big{position:absolute;left:0;right:0;text-align:center;font-family:A;color:#FFD60A;line-height:.85;
  -webkit-text-stroke:var(--sw) #000;paint-order:stroke fill;text-shadow:0 14px 0 #000,0 0 60px rgba(0,0,0,.7);transform:rotate(-4deg)}
.unit{display:block;font-size:.3em;color:#fff;letter-spacing:.06em;margin-top:.08em}
.badge{position:absolute;font-family:A;color:#fff;background:#FF3B30;padding:.12em .55em .1em;border-radius:.18em;
  transform:rotate(-3deg);box-shadow:0 10px 0 #8E1A16,0 20px 40px rgba(0,0,0,.6);letter-spacing:.04em;white-space:nowrap}
.txt{position:absolute;left:0;right:0;text-align:center;font-family:A;color:#fff;line-height:1}
.l1{-webkit-text-stroke:.09em #000;paint-order:stroke fill;text-shadow:0 .07em 0 #000;margin:.05em 0}
.mark span{display:inline-block;background:#FFD60A;color:#111;padding:.04em .3em 0;transform:rotate(-2deg);
  box-shadow:0 .09em 0 #000;border-radius:.08em;margin:.06em 0}
.emoji{position:absolute;font-size:var(--es);filter:drop-shadow(0 10px 10px rgba(0,0,0,.6))}
.arrow{position:absolute;width:var(--as);filter:drop-shadow(0 8px 0 #000)}
#v{width:1080px;height:1920px;--cy:1060px;--hs:560px;--sw:24px;--es:180px;--as:260px}
#h{width:1280px;height:720px;--cy:360px;--hs:470px;--sw:16px;--es:120px;--as:200px}
#h .hero,#h .rays{left:960px}
.col{position:absolute;display:flex;flex-direction:column;align-items:center;text-align:center}
.col .big,.col .badge,.col .txt{position:static;transform:none}
.col .big{transform:rotate(-4deg)}
.col .badge{transform:rotate(-3deg)}
.fit{white-space:nowrap}
.mark span{padding-top:.16em}
</style></head><body>
<div class="t" id="v">
  <div class="bg"></div><div class="grade"></div><div class="rays"></div><div class="hero"></div>
  ${d.flag ? `<div class="emoji" style="right:50px;top:110px;--es:140px">${d.flag}</div>` : ''}
  <div class="col" style="left:40px;right:40px;top:90px">
    ${d.badge ? `<div class="badge fit" data-max="900" style="font-size:80px">${esc(d.badge)}</div>` : ''}
    <div class="big fit" data-max="1000" style="font-size:400px;margin-top:30px">${esc(d.big)}</div>
    ${d.unit ? `<div class="txt fit" data-max="980" style="font-size:110px;margin-top:14px"><div class="l1">${esc(d.unit)}</div></div>` : ''}
  </div>
  <svg class="arrow" style="left:30px;top:1120px;transform:rotate(15deg)" viewBox="0 0 200 200"><path d="M20 30 C 120 30, 160 80, 150 160" fill="none" stroke="#FFD60A" stroke-width="22" stroke-linecap="round"/><path d="M110 140 L150 175 L185 125" fill="none" stroke="#FFD60A" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/></svg>
  ${d.emoji ? `<div class="emoji" style="right:40px;top:1220px">${d.emoji}</div>` : ''}
  <div class="col" style="left:40px;right:40px;bottom:110px">
    ${d.line1 ? `<div class="txt fit" data-max="1000" style="position:static;font-size:112px"><div class="l1">${esc(d.line1)}</div></div>` : ''}
    ${d.mark ? `<div class="txt fit mark" data-max="1000" style="position:static;font-size:128px"><span>${esc(d.mark)}</span></div>` : ''}
    ${d.line2 ? `<div class="txt fit" data-max="1000" style="position:static;font-size:100px"><div class="l1">${esc(d.line2)}</div></div>` : ''}
  </div>
</div>
<div class="t" id="h">
  <div class="bg"></div><div class="grade"></div><div class="rays"></div><div class="hero"></div>
  ${d.flag ? `<div class="emoji" style="left:1160px;top:14px;--es:80px">${d.flag}</div>` : ''}
  ${d.emoji ? `<div class="emoji" style="left:1120px;top:540px">${d.emoji}</div>` : ''}
  <div class="col" style="left:20px;width:680px;top:0;bottom:0;justify-content:center;gap:4px">
    ${d.badge ? `<div class="badge fit" data-max="600" style="font-size:48px;margin-bottom:6px">${esc(d.badge)}</div>` : ''}
    <div class="big fit" data-max="660" style="font-size:250px">${esc(d.big)}</div>
    ${d.unit ? `<div class="txt fit" data-max="660" style="position:static;font-size:76px"><div class="l1">${esc(d.unit)}</div></div>` : ''}
    ${d.mark ? `<div class="txt fit mark" data-max="660" style="position:static;font-size:70px"><span>${esc(d.mark)}</span></div>` : ''}
  </div>
</div>
<script>
document.fonts.ready.then(() => {
  for (const el of document.querySelectorAll('.fit')) {
    const max = +el.dataset.max; let fs = parseFloat(el.style.fontSize);
    el.style.display = 'inline-block';
    while (el.scrollWidth > max && fs > 20) { fs -= 2; el.style.fontSize = fs + 'px'; }
    el.style.display = '';
  }
  window.fitted = true;
});
</script>
</body></html>`;
}

(async () => {
  const jf = path.join(pub, 'thumb.json');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 2700 } });
  if (fs.existsSync(jf)) {
    const tmp = path.join(pub, '_thumb_render.html');
    fs.writeFileSync(tmp, html(JSON.parse(fs.readFileSync(jf, 'utf8'))));
    await p.goto(url(tmp));
    await p.waitForFunction(() => window.fitted === true); await p.waitForTimeout(300);
    await (await p.$('#v')).screenshot({ path: path.join(pub, 'miniatura_vertical_1080x1920.png') });
    await (await p.$('#h')).screenshot({ path: path.join(pub, 'miniatura_1280x720.png') });
    fs.unlinkSync(tmp);
  } else {
    await p.goto(url(path.join(pub, 'thumb.html'))); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await (await p.$('#v')).screenshot({ path: path.join(pub, 'miniatura_vertical_1080x1920.png') });
    await (await p.$('#h')).screenshot({ path: path.join(pub, 'miniatura_1280x720.png') });
  }
  await b.close(); console.log('thumbs ->', pub);
})();
