import test from 'node:test';
import assert from 'node:assert/strict';
import {offlineQuestions} from '../src/lib/offlineQuestions.ts';

test('reserve of diverse unique offline questions does not duplicate IDs or wording',()=>{
  assert.ok(offlineQuestions.length >= 400,'long games need >400 questions');
  assert.equal(new Set(offlineQuestions.map(q=>q.id)).size,offlineQuestions.length);
  assert.equal(new Set(offlineQuestions.map(q=>q.text)).size,offlineQuestions.length);
});
test('every question has four different answers and exactly one correct choice',()=>{
  for(const q of offlineQuestions){
    assert.equal(q.answers.length,4,q.text);
    assert.equal(new Set(q.answers).size,4,q.text);
    assert.ok(Number.isInteger(q.correct) && q.correct>=0 && q.correct<=3,q.text);
    assert.ok(q.text.trim().length>9,q.text);
  }
});
test('all automatically generated arithmetic answers are mathematically correct',()=>{
 for(const q of offlineQuestions.filter(q=>q.id>=20000)){
   const addition=/^כמה הם (\d+) ועוד (\d+)\?$/.exec(q.text);
   const multiply=/^כמה הם (\d+) כפול (\d+)\?$/.exec(q.text);
   assert.ok(addition||multiply,q.text);
   const groups=addition||multiply;
   assert.equal(Number(q.answers[q.correct]),addition? Number(groups[1])+Number(groups[2]): Number(groups[1])*Number(groups[2]));
 }
});
