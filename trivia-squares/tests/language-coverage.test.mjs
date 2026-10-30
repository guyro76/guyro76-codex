import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=async path=>readFile(new URL(path,import.meta.url),'utf8');
const literalKeyRegex=/\btr\(\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')\s*\)/g;
const present=(src,key)=>src.includes(JSON.stringify(key)+':')||src.includes("'"+key.replaceAll("'","\\'")+"':");

test('literal game controls have a native translation in all six locales',async()=>{
 const [game,english,extra,complete]=await Promise.all([
  read('../src/app/game.tsx'),read('../src/lib/i18n.ts'),read('../src/lib/i18nExtra.ts'),read('../src/lib/i18nCompleteness.ts')]);
 const keys=[...new Set([...game.matchAll(literalKeyRegex)].map(m=>m[1]||m[2]))];
 assert.ok(keys.length>=105,'Should audit at least 105 literal game UI texts');
 const en=english.slice(english.indexOf('export const englishDictionary'),english.indexOf('export function translate'));
 const es=extra.slice(extra.indexOf('"es": {'));
 const segments={ru:extra.slice(extra.indexOf('"ru": {'),extra.indexOf('"fr": {')),
 fr:extra.slice(extra.indexOf('"fr": {'),extra.indexOf('"ar": {')),
 ar:extra.slice(extra.indexOf('"ar": {'),extra.indexOf('"es": {')),es,en};
 const patch=JSON.parse(complete.slice(complete.indexOf('={')+1,complete.lastIndexOf('};')+1));
 for(const locale of ['en','ru','fr','ar','es']){
  const missing=keys.filter(key=>!present(segments[locale],key)&&!Object.prototype.hasOwnProperty.call(patch[locale],key));
  assert.deepEqual(missing,[],locale+': missing literal UI translations');
  assert.ok(!Object.values(patch[locale]).some(x=>!x||typeof x!=='string'),locale+' patch must not have empty translations');
 }
});

test('Spanish locale has its own playable offline source bank and topics',async()=>{
 const [spanish,topics,i18n,weather,rewards]=await Promise.all([
  read('../src/lib/spanishQuestions.ts'),read('../src/lib/questionTopics.ts'),
  read('../src/lib/i18n.ts'),read('../src/components/GameTimeBar.tsx'),
  read('../src/lib/intermissionLocales.ts')]);
 assert.match(i18n,/ActiveLocale='he'\|'en'\|'ru'\|'fr'\|'ar'\|'es'/);
 assert.match(topics,/id:'eurovision'.*es:'Eurovisión'/);
 assert.match(weather,/es:\{area:'HORA EN ISRAEL'/);
 assert.match(rewards,/es:\{3:\{answer:'manzana'/);
 assert.match(spanish,/locale": "es"/);
 const match=spanish.match(/export const spanishQuestions:SpanishQuestion\[]=(\[[\s\S]*\]);/);
 assert.ok(match,'Offline Spanish starter bank must be a real array');
 const questions=JSON.parse(match[1]);
 assert.ok(questions.length>=100,'At least 100 independent Spanish starter questions');
 for(const q of questions){
  assert.equal(q.locale,'es');
  assert.equal(q.answers.length,4);
  assert.equal(new Set(q.answers).size,4);
  assert.ok(q.correct>=0&&q.correct<=3);
  assert.ok(q.text.length>12);
 }
});
