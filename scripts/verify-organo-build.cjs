const fs = require('node:fs');
const file = '.next/server/app-paths-manifest.json';
if (!fs.existsSync(file)) throw new Error('Missing Next.js app paths manifest');
const text = fs.readFileSync(file, 'utf8');
const required = [
  '/page', '/login/page', '/admin/page', '/privacy/page', '/privacy-request/page',
  '/cookies/page', '/accessibility/page', '/security/page', '/terms/page',
  '/setup-required/page', '/api/status/route', '/api/admin/route', '/api/privacy-request/route'
];
const missing = required.filter((route) => !text.includes(route));
if (missing.length) throw new Error(`Missing critical routes: ${missing.join(', ')}`);
if (!fs.existsSync('.next/BUILD_ID')) throw new Error('Missing BUILD_ID');
console.log(`Organo production route verification passed (${required.length} routes).`);
