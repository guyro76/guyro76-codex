import test from 'node:test';
import assert from 'node:assert/strict';
import {intermissionBonusQuestion} from '../src/lib/intermissionBonus.ts';

// Editorial QA: 20 unique stage milestones, with equivalent vetted facts across
// all six languages. Brazil's official language is Portuguese under Constitution
// art. 13: https://portal.stf.jus.br/constituicao-supremo/artigo.asp?abrirArtigo=13&abrirBase=CF
const languages=['he','en','ru','fr','ar','es'];
for(const lang of languages){
 test(`intermission ${lang}: twenty valid, distinct four-choice questions`,()=>{
  const texts=new Set();
  for(let stage=5;stage<=100;stage+=5){
   const q=intermissionBonusQuestion(lang,stage);
   assert.ok(q.question.length>=10,`short question in ${lang} at stage ${stage}`);
   assert.equal(q.answers.length,4);
   assert.equal(new Set(q.answers.map(x=>x.trim().toLocaleLowerCase())).size,4);
   assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3);
   assert.ok(!texts.has(q.question),`repeat question in ${lang}`);
   texts.add(q.question);
   assert.ok(!/hexagon|משושה|шестиугольник|hexagone|السداسي|hexágono/i.test(q.question),
      `mathematics/geometry question returned in ${lang}`);
  }
  assert.equal(texts.size,20);
 });
 test(`intermission ${lang}: Brazil's verified official language is correct`,()=>{
  const q=intermissionBonusQuestion(lang,20);
  const expected={he:'פורטוגזית',en:'Portuguese',ru:'Португальский',
   fr:'Le portugais',ar:'البرتغالية',es:'Portugués'};
  assert.equal(q.answers[q.correct],expected[lang]);
 });
}
