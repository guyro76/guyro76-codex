const fs=require('node:fs');
const path=require('node:path');
const root=__dirname;
const source=path.join(root,'organo-app');
for(const name of ['app','pages','src','lib','types','public','components']) fs.rmSync(path.join(root,name),{recursive:true,force:true});
for(const name of ['app','lib','types','public','components']) fs.cpSync(path.join(source,name),path.join(root,name),{recursive:true});
for(const name of ['tsconfig.json','next-env.d.ts','next.config.mjs','postcss.config.mjs','proxy.ts','instrumentation-client.ts']) fs.copyFileSync(path.join(source,name),path.join(root,name));
for(const name of ['next.config.js','next.config.ts','postcss.config.js','postcss.config.cjs','tailwind.config.js','tailwind.config.cjs','tailwind.config.ts']) fs.rmSync(path.join(root,name),{force:true});
console.log('Organo source copied to repository root.');
