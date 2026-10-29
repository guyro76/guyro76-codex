import test from 'node:test';
import assert from 'node:assert/strict';
import {offlineQuestions} from '../src/lib/offlineQuestions.ts';
import {englishQuestions} from '../src/lib/englishQuestions.ts';
import {hebrewMediaQuestions,englishMediaQuestions} from '../src/lib/mediaQuestions.ts';
import {freshLocalQuestionReserve} from '../src/lib/freshQuestions.ts';

const banks=[['he',offlineQuestions],['en',englishQuestions]];
for(const[locale,questions] of banks){
 test(`QA editorial: ${locale} has a broad, fully unique bank, no arithmetic`,()=>{
  assert.ok(questions.length>=175,`${locale} must have at least 175 curated questions`);
  assert.equal(new Set(questions.map(q=>q.id)).size,questions.length,'duplicate ID');
  assert.equal(new Set(questions.map(q=>q.text)).size,questions.length,'duplicate wording');
  for(const q of questions){
   assert.equal(q.answers.length,4,q.text);
   assert.equal(new Set(q.answers).size,4,q.text);
   assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3,q.text);
   assert.ok(q.text.trim().length>=12,q.text);
   assert.doesNotMatch(q.category,/(math|מתמטיקה|חשבון|כפל)/i);
   assert.doesNotMatch(q.text,/^(כמה הם? [0-9]|מה התוצאה של|מהו שורש|מהו רבע|כמה מעלות יש בזווית ישרה|כמה צלעות יש ל)/i);
  }
 });
}
test('QA editorial: media coverage in both locale banks',()=>{
 for(const q of [...hebrewMediaQuestions,...englishMediaQuestions]){
  assert.equal(new Set(q.answers).size,4,q.text);
  assert.equal(q.answers.length,4,q.text);
  assert.ok(q.answers[q.correct],q.text);
  assert.ok(['he','en'].includes(q.locale));
 }
 const heCat=new Set(hebrewMediaQuestions.map(q=>q.category));
 const enCat=new Set(englishMediaQuestions.map(q=>q.category));
 for(const cat of ['קולנוע','סדרות טלוויזיה','מוזיקה עולמית','מוזיקה ישראלית'])assert.ok(heCat.has(cat));
 for(const cat of ['Movies','Television','World music'])assert.ok(enCat.has(cat));
});
test('QA localization: Israeli artists are Hebrew-only',()=>{
 assert.ok(hebrewMediaQuestions.filter(q=>q.category==='מוזיקה ישראלית').length>=40);
 assert.equal(englishMediaQuestions.some(q=>q.category==='מוזיקה ישראלית'||/Noa Kirel|Omer Adam|Netta Barzilai|Arik Einstein/i.test(q.text)),false);
});

test('QA editorial: staged free local reserve also has diverse non-math, unique questions',()=>{
 const all=[...offlineQuestions,...englishQuestions,...freshLocalQuestionReserve];
 assert.equal(new Set(all.map(q=>q.id)).size,all.length,'ID collision across pools');
 assert.equal(new Set(all.map(q=>q.text)).size,all.length,'duplicate wording across pools');
 for(const q of freshLocalQuestionReserve){
  assert.ok(['en','he'].includes(q.locale));
  assert.equal(q.answers.length,4);
  assert.equal(new Set(q.answers).size,4);
  assert.ok(q.answers[q.correct],q.text);
  assert.doesNotMatch(q.category,/math|mental|מתמטיקה|חשבון|כפל/i);
  assert.doesNotMatch(q.text,/^כמה הם \d+|^What is \d+ (plus|multiplied by)/i);
 }
});
