import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyQuestions,dailyScore,DAILY_COUNT} from '../src/lib/dailyChallenge.ts';
import {answerInQuestion} from '../src/lib/answerGuard.ts';
import {isGeographyQuestion} from '../src/lib/questionMix.ts';
test('every language gets 10 distinct daily questions, the same for everyone on a day, different the next day',()=>{
 for(const l of ['he','en','ru','fr','ar','es']){
  const a=dailyQuestions(l,'2026-11-04'),b=dailyQuestions(l,'2026-11-04'),c=dailyQuestions(l,'2026-11-05');
  assert.equal(a.length,DAILY_COUNT,l);
  assert.deepEqual(a.map(q=>q.id),b.map(q=>q.id));
  assert.notDeepEqual(a.map(q=>q.id),c.map(q=>q.id));
  assert.equal(new Set(a.map(q=>q.id)).size,DAILY_COUNT);
  assert.ok(a.filter(q=>isGeographyQuestion(q)).length<=2,l+' geography cap');
  for(const q of a)assert.ok(!answerInQuestion(q.text,q.answers),q.text);
 }
});
test('score matches the server formula',()=>{assert.equal(dailyScore(7,90),910);assert.equal(dailyScore(10,400),1000);});
