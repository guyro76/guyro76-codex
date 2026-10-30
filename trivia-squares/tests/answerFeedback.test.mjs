import test from 'node:test';
import assert from 'node:assert/strict';
import {answerFeedback} from '../src/lib/answerFeedback.ts';
import {activeLocales} from '../src/lib/i18n.ts';

test('all six languages offer distinct native-answer feedback and preserve credits',()=>{
 const scripts={he:/[\u0590-\u05FF]/u,en:/[A-Za-z]/u,ru:/[\u0400-\u04FF]/u,fr:/[A-Za-z]/u,ar:/[\u0600-\u06FF]/u,es:/[A-Za-z]/u};
 for(const locale of activeLocales){
  const correct=answerFeedback(locale,{correct:true,gained:0});
  const capture=answerFeedback(locale,{correct:true,gained:2});
  const wrong=answerFeedback(locale,{correct:false,gained:0});
  const bonus=answerFeedback(locale,{correct:true,gained:0,bonus:true});
  for(const value of [correct,capture,wrong,bonus])assert.match(value,scripts[locale],locale);
  assert.match(correct,/10/);assert.match(correct,/5/);
  assert.match(capture,/2/);assert.match(capture,/25/);
  assert.notEqual(correct,wrong);
  assert.notEqual(bonus,answerFeedback(locale,{correct:false,gained:0,bonus:true}));
 }
});
test('negative or decimal captured squares cannot inflate shown credits',()=>{
 assert.match(answerFeedback('en',{correct:true,gained:-10}),/\+5 credits/);
 assert.match(answerFeedback('en',{correct:true,gained:1.9}),/\+15 credits/);
});
