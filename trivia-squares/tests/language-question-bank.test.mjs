import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const source=readFileSync(join(process.cwd(),'src/lib/languageQuestions.ts'),'utf8');
const match=source.match(/export const languageQuestions:LanguageQuestion\[\]=(\[[\s\S]*\]);/);
assert.ok(match,'Question bank should contain a JSON-compatible array');
const questions=JSON.parse(match[1]);
const locales=['he','en','ru','fr','ar','es'];
test('every locale receives curated language questions',()=>{
 for(const locale of locales)assert.ok(questions.filter(q=>q.locale===locale).length>=3,locale);
});
test('language questions have distinct IDs, four distinct answers and valid indices',()=>{
 assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
 for(const q of questions){
  assert.equal(q.category,'languages');
  assert.ok(q.text.trim().length>8);
  assert.equal(q.answers.length,4);
  assert.equal(new Set(q.answers.map(x=>x.toLocaleLowerCase().trim())).size,4);
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
 }
});
test('avoid duplicate prompts in each locale',()=>{
 const keys=questions.map(q=>q.locale+':'+q.text.normalize('NFKC').toLocaleLowerCase().trim());
 assert.equal(new Set(keys).size,keys.length);
});
test('recent topic history accepts the language topic',()=>{
 const mix=readFileSync(join(process.cwd(),'src/lib/questionMix.ts'),'utf8');
 assert.match(mix,/'languages',/);
 assert.match(mix,/'general'/);
});
