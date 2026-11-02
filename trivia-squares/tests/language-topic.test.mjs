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

// Each local starter question has an individually attributable dictionary entry.
// These checks enforce metadata and answer-to-source alignment, not a claim that
// the entire database has received independent human fact review.
const languageSource=readFileSync(join(process.cwd(),'src/lib/languageQuestions.ts'),'utf8');
const languageLiteral=languageSource.match(/export const languageQuestions:LanguageQuestion\[\]=(\[[\s\S]*\]);\s*$/);
assert.ok(languageLiteral,'language question array is present');
const languageBank=JSON.parse(languageLiteral[1]);
test('language question provenance is complete and answers match cited dictionary terms',()=>{
 assert.equal(languageBank.length,18);
 assert.equal(new Set(languageBank.map(q=>q.id)).size,18);
 for(const locale of ['he','en','ru','fr','ar','es']){
  assert.equal(languageBank.filter(q=>q.locale===locale).length,3,locale+' language questions');
 }
 for(const q of languageBank){
  assert.equal(q.answers.length,4,'four choices for '+q.id);
  assert.equal(new Set(q.answers.map(s=>s.trim().toLocaleLowerCase())).size,4,'distinct choices for '+q.id);
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4,'valid answer index '+q.id);
  const url=new URL(q.sourceUrl);
  assert.ok(['dictionary.cambridge.org','www.larousse.fr','www.treccani.it'].includes(url.hostname),'reviewed dictionary '+q.id);
  const term=url.pathname.split('/').pop().replace(/\d+$/,'').replace(/[-_]/g,' ').toLocaleLowerCase();
  assert.ok(q.answers[q.correct].toLocaleLowerCase().includes(term),'source term matches correct answer '+q.id);
 }
});
