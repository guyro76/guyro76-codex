import test from 'node:test';
import assert from 'node:assert/strict';
import {findLocalQuestion,bundledQuestionBanks} from '../src/lib/localQuestionLookup.ts';
import {languageQuestions} from '../src/lib/languageQuestions.ts';
import {spanishQuestions} from '../src/lib/spanishQuestions.ts';
import {offlineQuestions} from '../src/lib/offlineQuestions.ts';

test('language and Spanish questions can be answered (their correct index is found)',()=>{
 for(const q of [...languageQuestions,...spanishQuestions]){
  const hit=findLocalQuestion(q.id);
  assert.ok(hit,'missing answer key for question '+q.id);
  assert.equal(hit.correct,q.correct);
 }
});

test('regular Hebrew questions still resolve to their own answer key',()=>{
 for(const q of offlineQuestions.slice(0,200))assert.equal(findLocalQuestion(q.id)?.correct,q.correct);
});

test('no two bundled questions share an id, so a lookup can never return another question\'s answer',()=>{
 const seen=new Map();
 for(const bank of bundledQuestionBanks)for(const q of bank){
  if(seen.has(q.id))assert.fail('duplicate id '+q.id);
  seen.set(q.id,true);
 }
});

test('remote cached questions are found when not bundled, unknown ids return undefined',()=>{
 assert.equal(findLocalQuestion(-424242,[{id:-424242,correct:2}])?.correct,2);
 assert.equal(findLocalQuestion(-1),undefined);
 assert.equal(findLocalQuestion(undefined),undefined);
});
