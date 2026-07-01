const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const source = path.join(root, 'organo-app');
const removeDirectories = ['app', 'pages', 'src', 'lib', 'types', 'public', 'components'];
for (const name of removeDirectories) fs.rmSync(path.join(root, name), { recursive: true, force: true });

const removeFiles = [
  'next.config.js', 'next.config.ts', 'next.config.mjs',
  'postcss.config.js', 'postcss.config.cjs', 'postcss.config.mjs',
  'tailwind.config.js', 'tailwind.config.cjs', 'tailwind.config.ts',
  'instrumentation-client.ts'
];
for (const name of removeFiles) fs.rmSync(path.join(root, name), { force: true });

for (const name of ['app', 'lib', 'types', 'public', 'components']) {
  fs.cpSync(path.join(source, name), path.join(root, name), { recursive: true });
}
for (const name of ['tsconfig.json', 'next-env.d.ts', 'next.config.mjs', 'proxy.ts', 'instrumentation-client.ts']) {
  fs.copyFileSync(path.join(source, name), path.join(root, name));
}
console.log('Organo source prepared at repository root.');
