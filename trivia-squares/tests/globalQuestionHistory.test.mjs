import test from 'node:test';
import assert from 'node:assert/strict';
import {freshLocalQuestionReserve,freshLocalQuestions,countLocalReserve,LOCAL_QUESTION_RELEASE_BATCH} from '../src/lib/freshQuestions.ts';
import {offlineQuestions} from '../src/lib/offlineQuestions.ts';
import {englishQuestions} from '../src/lib/englishQuestions.ts';

const canonical=(value)=>value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
for (const locale of ['he','en']){
  test('new games release precisely one approved batch, do not reset history: '+locale,()=>{
    const total=countLocalReserve(locale);
    assert.ok(total>=50, 'both languages need a substantial reserve');
    assert.ok(LOCAL_QUESTION_RELEASE_BATCH>0 && LOCAL_QUESTION_RELEASE_BATCH<=5);
    const first=freshLocalQuestions(locale,LOCAL_QUESTION_RELEASE_BATCH);
    const second=freshLocalQuestions(locale,LOCAL_QUESTION_RELEASE_BATCH*2);
    assert.equal(first.length,LOCAL_QUESTION_RELEASE_BATCH);
    assert.equal(second.length,LOCAL_QUESTION_RELEASE_BATCH*2);
    assert.deepEqual(second.slice(0,first.length),first,'existing questions remain identifiable');
    const previous=new Set(first.map(q=>canonical(q.text)));
    assert.equal(second.filter(q=>previous.has(canonical(q.text))).length,first.length,'new release never duplicates a reserve entry');
    assert.equal(second.length,new Set(second.map(q=>q.id)).size);
    assert.equal(freshLocalQuestions(locale,5000).length,total,'reserve does not invent or recycle questions when exhausted');
  });
}
test('the entire offline inventory has no repeated wording across base and reserve in either locale',()=>{
  const all=[...offlineQuestions,...englishQuestions,...freshLocalQuestionReserve];
  const counts=new Map();
  for(const q of all){
    const key=canonical(q.text);
    counts.set(key,(counts.get(key)||0)+1);
  }
  assert.deepEqual([...counts].filter(([,count])=>count>1),[]);
  assert.ok(all.length>=480);
});
test('reserved questions are not arithmetic and cover meaningful editorial genres',()=>{
  const categories=new Set(freshLocalQuestionReserve.map(q=>q.category));
  assert.ok([...categories].length>=10);
  assert.ok(categories.has('Movies') && categories.has('קולנוע'));
  assert.ok(categories.has('World music') && categories.has('מוזיקה'));
  for(const q of freshLocalQuestionReserve){
    assert.ok(q.answers.length===4);
    assert.equal(new Set(q.answers).size,4);
    assert.ok(q.correct>=0&&q.correct<=3);
    assert.doesNotMatch(q.category,/math|מתמטיקה|חשבון|כפל/i);
  }
});
