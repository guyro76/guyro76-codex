import test from 'node:test';
import assert from 'node:assert/strict';
import {activeLocales} from '../src/lib/i18n.ts';
import {questionAvailabilityMessage} from '../src/lib/questionAvailability.ts';
const cases=['networkError','serverExhausted','offlineExhausted','topicFallback'];

test('question-exhaustion and retry messages are translated into all six languages',()=>{
 const native={he:/[\u0590-\u05ff]/u,en:/[a-z]/iu,ru:/[\u0400-\u04ff]/u,fr:/[a-zé]/iu,ar:/[\u0600-\u06ff]/u,es:/[a-zá]/iu};
 for(const locale of activeLocales){
  for(const state of cases){
   const message=questionAvailabilityMessage(locale,state);
   assert.ok(message.length>=45,locale+' '+state);
   assert.match(message,native[locale],locale+' '+state);
   assert.ok(!message.includes('undefined'));
  }
  assert.notEqual(questionAvailabilityMessage(locale,'offlineExhausted'),questionAvailabilityMessage(locale,'networkError'));
 }
});
test('every locale explicitly preserves progress in exhaustion errors',()=>{
 const saved={he:/נשמר/,en:/sav/i,ru:/сохран/,fr:/sauvegard/,ar:/حفظ/,es:/guardad/i};
 for(const locale of activeLocales){
  for(const state of ['networkError','offlineExhausted','serverExhausted']){
   assert.match(questionAvailabilityMessage(locale,state),saved[locale],locale+' '+state);
  }
 }
});
