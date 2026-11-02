import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

// Source-level regression checks for the six-language topic taxonomy.
// These are intentionally independent of TypeScript loaders.
const source=readFileSync(join(process.cwd(),'src/lib/questionTopics.ts'),'utf8');
test('How do you say topic has labels for all six supported locales',()=>{
 const row=source.split('\n').find(line=>line.includes("id:'languages'"));
 assert.ok(row,'languages topic exists');
 for(const locale of ['he','en','ru','fr','ar','es'])assert.match(row,new RegExp('\\b'+locale+':'));
});
test('language classification precedes generic geography and culture matches',()=>{
 const language=source.indexOf("return 'languages'");
 const geography=source.indexOf("return 'capitals'");
 assert.ok(language>0 && geography>language);
});
test('all supported locale names are represented in topic declaration',()=>{
 for(const locale of ['he','en','ru','fr','ar','es'])assert.ok(source.includes(locale+':'));
});
