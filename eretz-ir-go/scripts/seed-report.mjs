/**
 * דו"ח כיסוי המאגר: כמה ערכים יש לכל קטגוריה קלאסית בכל אות,
 * ואילו שילובים חלשים. מריצים: npm run seed:report
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/data/seed.ts'), 'utf8');

const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'.split('');
const CLASSIC = ['country', 'city', 'animal', 'plant', 'inanimate', 'boyname', 'girlname', 'profession', 'celebrity'];

// חילוץ גס של הערכים מקובץ ה-seed (שם + קטגוריות)
const entries = [];
const re = /e\(\s*['"‘]([^'"]+)['"]\s*,\s*\[([^\]]*)\]/g;
let m;
while ((m = re.exec(src))) {
  const cats = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  if (cats.length) entries.push({ name: m[1], cats });
}

console.log(`סה"כ ערכים במאגר: ${entries.length}\n`);
const weak = [];
for (const cat of CLASSIC) {
  const counts = LETTERS.map((letter) => {
    const n = entries.filter((e) => e.cats.includes(cat) && e.name.replace(/["'׳]/g, '').startsWith(letter)).length;
    if (n === 0) weak.push(`${cat} × ${letter}`);
    return `${letter}:${n}`;
  });
  console.log(`${cat.padEnd(12)} ${counts.join(' ')}`);
}
console.log(`\nשילובים ללא כיסוי (${weak.length}):`);
console.log(weak.join(', ') || 'אין! 🎉');
