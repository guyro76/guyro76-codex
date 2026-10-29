import test from 'node:test';
import assert from 'node:assert/strict';
import {offlineQuestions} from '../src/lib/offlineQuestions.ts';
import {englishQuestions} from '../src/lib/englishQuestions.ts';
import {freshLocalQuestionReserve,LOCAL_QUESTION_RELEASE_BATCH,
 freshLocalQuestions,countLocalReserve} from '../src/lib/freshQuestions.ts';

function normalize(text){
 return text.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
}
for(const [locale,base] of [['he',offlineQuestions],['en',englishQuestions]]){
 test('Question bank '+locale+' contains distinct editorial content and additional reviewed material',()=>{
  const reserve=freshLocalQuestionReserve.filter(q=>q.locale===locale);
  assert.ok(reserve.length>=45,'at least 45 unserved approved items in reserve');
  const pool=[...base,...reserve];
  assert.equal(new Set(pool.map(q=>q.id)).size,pool.length,'ID collision');
  assert.equal(new Set(pool.map(q=>normalize(q.text))).size,pool.length,'duplicate question text');
  assert.ok(new Set(reserve.map(q=>q.category)).size>=7,'not enough distinct topics');
  for(const q of pool){
   assert.equal(q.answers.length,4,q.text);
   assert.equal(new Set(q.answers).size,4,q.text);
   assert.ok(q.correct>=0&&q.correct<4,q.text);
   assert.doesNotMatch(q.category,/(mathematics|arithmetic|mental maths|מתמטיקה|חשבון|כפל)/i);
  }
 });
 test('Every '+locale+' new game adds unseen approved questions, and old games never reset history',()=>{
  const seenIds=new Set(),seenText=new Set();
  let released=0,rounds=0;
  const full=countLocalReserve(locale);
  while(rounds<50){
   released=Math.min(full,released+LOCAL_QUESTION_RELEASE_BATCH);
   const pool=[...base,...freshLocalQuestions(locale,released)];
   for(let i=0;i<Math.min(7,pool.length);i++){
    const candidate=pool.find(q=>!seenIds.has(q.id)&&!seenText.has(normalize(q.text)));
    if(!candidate)break;
    assert.equal(seenIds.has(candidate.id),false);
    seenIds.add(candidate.id);seenText.add(normalize(candidate.text));
   }
   rounds++;
  }
  assert.equal(released,full,'approved reserve was not fully released');
  assert.equal(seenIds.size,seenText.size,'duplicate questions reached a player');
  assert.equal(freshLocalQuestions(locale,full+999).length,full,'reserve never wraps');
 });
}
