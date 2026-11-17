// Render the two thumbnails from <episode>/publicar/thumb.html:  node tools/thumbs.js episodes/<slug>
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const dir = path.resolve(process.argv[2], 'publicar');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 2700 } });
  await p.goto('file://' + dir + '/thumb.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await (await p.$('#v')).screenshot({ path: dir + '/miniatura_vertical_1080x1920.png' });
  await (await p.$('#h')).screenshot({ path: dir + '/miniatura_1280x720.png' });
  await b.close(); console.log('thumbs ->', dir);
})();
