const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const source = path.join(root, 'organo-app');
const remove = ['app', 'pages', 'src', 'lib', 'types', 'public', 'components'];
for (const name of remove) fs.rmSync(path.join(root, name), { recursive: true, force: true });
for (const name of ['next.config.js', 'next.config.ts', 'next.config.mjs']) {
  fs.rmSync(path.join(root, name), { force: true });
}
for (const name of ['app', 'lib', 'types', 'public', 'components']) {
  fs.cpSync(path.join(source, name), path.join(root, name), { recursive: true });
}
for (const name of ['tsconfig.json', 'next-env.d.ts', 'next.config.mjs']) {
  fs.copyFileSync(path.join(source, name), path.join(root, name));
}
console.log('Organo source prepared at repository root.');
