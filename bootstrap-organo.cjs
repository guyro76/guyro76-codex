const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const source = path.join(root, 'organo-app');
const directories = ['app', 'lib', 'types', 'public', 'components'];

for (const name of directories) {
  const target = path.join(root, name);
  fs.rmSync(target, { recursive: true, force: true });
  fs.symlinkSync(path.join(source, name), target, 'dir');
}

const configFiles = ['tsconfig.json', 'next-env.d.ts', 'next.config.mjs', 'proxy.ts', 'instrumentation-client.ts'];
for (const name of configFiles) {
  const target = path.join(root, name);
  fs.rmSync(target, { force: true });
  fs.copyFileSync(path.join(source, name), target);
}

for (const name of [
  'next.config.js', 'next.config.ts',
  'postcss.config.js', 'postcss.config.cjs', 'postcss.config.mjs',
  'tailwind.config.js', 'tailwind.config.cjs', 'tailwind.config.ts'
]) {
  fs.rmSync(path.join(root, name), { force: true });
}

console.log('Organo source linked directly at repository root.');
