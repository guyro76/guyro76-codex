const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const candidates = [
  path.join(root, '.next', 'server', 'app-paths-manifest.json'),
  path.join(root, '.next', 'app-path-routes-manifest.json'),
  path.join(root, '.next', 'routes-manifest.json'),
];

const manifests = candidates
  .filter((file) => fs.existsSync(file))
  .map((file) => ({ file, data: JSON.parse(fs.readFileSync(file, 'utf8')) }));

if (!manifests.length) {
  throw new Error('Organo QA failed: no Next.js route manifest was generated.');
}

const serialized = JSON.stringify(manifests.map((entry) => entry.data));
const required = ['/page', '/home/page', '/login/page', '/faq/page', '/api/status/route'];
const missing = required.filter((route) => !serialized.includes(route));

if (missing.length) {
  throw new Error(`Organo QA failed: missing critical routes: ${missing.join(', ')}`);
}

const buildId = path.join(root, '.next', 'BUILD_ID');
if (!fs.existsSync(buildId) || !fs.readFileSync(buildId, 'utf8').trim()) {
  throw new Error('Organo QA failed: BUILD_ID was not generated.');
}

console.log(`Organo route QA passed: ${required.join(', ')}`);
