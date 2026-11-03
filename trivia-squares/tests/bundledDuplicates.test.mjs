import test from 'node:test';
import assert from 'node:assert/strict';
import {applyQuestionCorrections,BUNDLED_DUPLICATES} from '../src/lib/questionCorrections.ts';
import {findLocalQuestion} from '../src/lib/localQuestionLookup.ts';

/* Ultra QA 2026-11-03: the same fact must not be asked twice in one locale.
 * Hidden twins stay resolvable by id (saved games, appeals) but are never dealt. */
test('every hidden duplicate points to a real twin with the same correct answer',()=>{
 for(const [hidden,kept] of BUNDLED_DUPLICATES){
  const a=findLocalQuestion(hidden),b=findLocalQuestion(kept);
  assert.ok(a,'hidden question '+hidden+' still resolvable');
  assert.ok(b,'kept twin '+kept+' exists');
  assert.ok(!BUNDLED_DUPLICATES.has(kept),'kept twin '+kept+' is not itself hidden');
  const norm=s=>String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  assert.equal(norm(a.answers[a.correct]),norm(b.answers[b.correct]),hidden+' vs '+kept);
 }
});

test('hidden duplicates are never dealt',()=>{
 const bank=[...BUNDLED_DUPLICATES.keys()].map(id=>({id,text:'x',answers:['a','b'],correct:0}));
 assert.equal(applyQuestionCorrections([...bank,{id:1,text:'y',answers:['a','b'],correct:0}]).length,1);
});
