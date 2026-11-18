/**
 * بعد `expo export -p web`: Vercel CLI يتجاهل أي مجلد اسمه node_modules عند الرفع،
 * وExpo يحط الخطوط والصور (مثل أيقونات @expo/vector-icons) داخل dist/assets/node_modules.
 * فنعيد تسميته لـ vendor ونحدّث المراجع في ملفات الـ bundle.
 */
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const from = path.join(dist, 'assets', 'node_modules');
const to = path.join(dist, 'assets', 'vendor');

if (fs.existsSync(from)) {
  fs.rmSync(to, { recursive: true, force: true });
  fs.renameSync(from, to);
}

let changed = 0;
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (p !== to) walk(p);
    } else if (/\.(js|css|html|json)$/.test(e.name)) {
      const s = fs.readFileSync(p, 'utf8');
      const n = s.split('/assets/node_modules/').join('/assets/vendor/');
      if (n !== s) {
        fs.writeFileSync(p, n);
        changed++;
      }
    }
  }
};
walk(dist);

// الملف تغيّر بعد ما Expo حسب اسمه، وVercel يخزّن /_expo/ سنة كاملة (immutable) — فنعطيه اسم جديد من محتواه
const crypto = require('crypto');
const jsDir = path.join(dist, '_expo', 'static', 'js', 'web');
for (const f of fs.readdirSync(jsDir).filter((x) => x.endsWith('.js'))) {
  const buf = fs.readFileSync(path.join(jsDir, f));
  const hash = crypto.createHash('md5').update(buf).digest('hex');
  const next = f.replace(/-[0-9a-f]{32}\.js$/, `-${hash}.js`);
  if (next !== f) {
    fs.renameSync(path.join(jsDir, f), path.join(jsDir, next));
    const html = path.join(dist, 'index.html');
    fs.writeFileSync(html, fs.readFileSync(html, 'utf8').split(f).join(next));
  }
}
fs.copyFileSync(path.join(__dirname, '..', 'vercel.json'), path.join(dist, 'vercel.json'));
console.log(`postexport-web: moved assets/node_modules -> assets/vendor, patched ${changed} file(s)`);
